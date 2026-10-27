<#
.SYNOPSIS
  Seeds demo data for the sample_map plugin (Gensco map):
    - OpenSearch index  gensco-sites  (from sample-data/gensco-sites.json)
    - OpenSearch index  gensco-logs   (generated log lines for the last N hours)
    - VictoriaMetrics   gensco_* series (generated samples for the last N hours)

.EXAMPLE
  ./scripts/seed-sample-data.ps1 -OpenSearchUrl https://localhost:9200 -VictoriaMetricsUrl http://localhost:8428 -SkipCertificateCheck
  (prompts for OpenSearch credentials; pass -NoAuth for an unsecured cluster)
#>
param(
  [Parameter(Mandatory)] [string] $OpenSearchUrl,
  [string] $VictoriaMetricsUrl = '',
  [int] $Hours = 6,
  [System.Management.Automation.PSCredential] $Credential,
  [switch] $NoAuth,
  [switch] $SkipCertificateCheck,
  [switch] $Reset
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$sites = Get-Content (Join-Path $root 'sample-data/gensco-sites.json') -Raw | ConvertFrom-Json

$os = @{ SkipCertificateCheck = [bool]$SkipCertificateCheck }
if (-not $NoAuth) {
  if (-not $Credential) { $Credential = Get-Credential -Message 'OpenSearch credentials' }
  $os.Authentication = 'Basic'
  $os.Credential = $Credential
}
$osBase = $OpenSearchUrl.TrimEnd('/')

function Invoke-Os([string] $Method, [string] $Path, $Body, [string] $ContentType = 'application/json') {
  Invoke-RestMethod -Method $Method -Uri "$osBase$Path" -Body $Body -ContentType $ContentType @os
}

function Ensure-Index([string] $Name, [hashtable] $Mapping) {
  if ($Reset) { try { Invoke-Os DELETE "/$Name" $null | Out-Null } catch { } }
  try {
    Invoke-Os PUT "/$Name" (@{ mappings = @{ properties = $Mapping } } | ConvertTo-Json -Depth 10) | Out-Null
    Write-Host "Created index $Name"
  } catch {
    Write-Host "Index $Name already exists (use -Reset to recreate)"
  }
}

function Send-Bulk([System.Text.StringBuilder] $Sb) {
  $res = Invoke-Os POST '/_bulk?refresh=true' $Sb.ToString() 'application/x-ndjson'
  if ($res.errors) { throw "Bulk had errors: $($res.items | Where-Object { $_.index.error } | Select-Object -First 1 | ConvertTo-Json -Depth 5)" }
}

# ── Sites ────────────────────────────────────────────────────────
Ensure-Index 'gensco-sites' @{
  site_id = @{ type = 'keyword' }; name = @{ type = 'text' }; address = @{ type = 'text' }
  city = @{ type = 'keyword' }; state = @{ type = 'keyword' }; zip = @{ type = 'keyword' }
  lat = @{ type = 'double' }; lon = @{ type = 'double' }
}
$sb = [System.Text.StringBuilder]::new()
foreach ($s in $sites) {
  [void]$sb.AppendLine((@{ index = @{ _index = 'gensco-sites'; _id = $s.site_id } } | ConvertTo-Json -Compress))
  [void]$sb.AppendLine(($s | ConvertTo-Json -Compress))
}
Send-Bulk $sb
Write-Host "Indexed $($sites.Count) sites"

# ── Logs ─────────────────────────────────────────────────────────
Ensure-Index 'gensco-logs' @{
  '@timestamp' = @{ type = 'date' }; site_id = @{ type = 'keyword' }
  severity = @{ type = 'keyword' }; service = @{ type = 'keyword' }; message = @{ type = 'text' }
}
$messages = @(
  @('INFO', 'pos', 'Transaction batch uploaded successfully'),
  @('INFO', 'sync', 'Inventory sync completed'),
  @('WARN', 'printer', 'Label printer paper low'),
  @('ERROR', 'printer', 'Label printer not responding (timeout after 30s)'),
  @('INFO', 'inventory', 'Stock levels refreshed'),
  @('WARN', 'sync', 'Sync retry 1/3 - upstream returned 503'),
  @('ERROR', 'pos', 'Payment terminal handshake failed'),
  @('DEBUG', 'inventory', 'Cache warm-up finished')
)
$now = [DateTimeOffset]::UtcNow
$rand = [System.Random]::new(42)
$sb = [System.Text.StringBuilder]::new()
$logCount = 0
foreach ($s in $sites) {
  for ($i = 0; $i -lt 60; $i++) {
    $m = $messages[$rand.Next($messages.Count)]
    $ts = $now.AddSeconds(-$rand.Next($Hours * 3600)).ToString('o')
    [void]$sb.AppendLine('{"index":{"_index":"gensco-logs"}}')
    [void]$sb.AppendLine((@{ '@timestamp' = $ts; site_id = $s.site_id; severity = $m[0]; service = $m[1]; message = $m[2] } | ConvertTo-Json -Compress))
    $logCount++
  }
}
Send-Bulk $sb
Write-Host "Indexed $logCount log lines"

# ── Metrics ──────────────────────────────────────────────────────
if (-not $VictoriaMetricsUrl) { Write-Host 'No -VictoriaMetricsUrl given; skipping metrics.'; return }

# Scenario: 103 down, 106 printer stopped, 109 CPU hot, others healthy.
$services = 'pos', 'inventory', 'sync', 'printer'
$lines = [System.Collections.Generic.List[string]]::new()
$stepSec = 60
$startMs = $now.AddHours(-$Hours).ToUnixTimeMilliseconds()
$endMs = $now.ToUnixTimeMilliseconds()
foreach ($s in $sites) {
  $id = $s.site_id
  $seed = [int]$id
  for ($t = $startMs; $t -le $endMs; $t += $stepSec * 1000) {
    $x = $t / 600000 + $seed
    $up = if ($id -eq '103') { 0 } else { 1 }
    $lines.Add("gensco_site_up{site=`"$id`"} $up $t")
    if ($up -eq 0) { continue }
    foreach ($svc in $services) {
      $v = if ($id -eq '106' -and $svc -eq 'printer') { 0 } else { 1 }
      $lines.Add("gensco_service_up{site=`"$id`",service=`"$svc`"} $v $t")
    }
    $cpuBase = if ($id -eq '109') { 88 } else { 25 }
    $cpu = [math]::Round($cpuBase + 8 * [math]::Sin($x) + 3 * [math]::Sin($x * 3.7), 1)
    $mem = [math]::Round(50 + 10 * [math]::Sin($x / 2), 1)
    $lines.Add("gensco_cpu_percent{site=`"$id`"} $cpu $t")
    $lines.Add("gensco_memory_percent{site=`"$id`"} $mem $t")
  }
}
$vmParams = @{ SkipCertificateCheck = [bool]$SkipCertificateCheck }
Invoke-RestMethod -Method POST -Uri "$($VictoriaMetricsUrl.TrimEnd('/'))/api/v1/import/prometheus" `
  -Body ($lines -join "`n") -ContentType 'text/plain' @vmParams | Out-Null
Write-Host "Imported $($lines.Count) metric samples into VictoriaMetrics"
Write-Host 'NOTE: historical samples stop at "now"; re-run the script (or push live samples) to keep the map current.'
