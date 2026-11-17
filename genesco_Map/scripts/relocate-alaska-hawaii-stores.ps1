[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [Parameter(Mandatory)] [string] $OpenSearchUrl,
  [System.Management.Automation.PSCredential] $Credential,
  [switch] $NoAuth,
  [switch] $SkipCertificateCheck
)

$ErrorActionPreference = 'Stop'
$osBase = $OpenSearchUrl.TrimEnd('/')

if (-not $NoAuth) {
  if (-not $Credential) {
    $Credential = Get-Credential -Message 'OpenSearch credentials'
  }
  $plainPassword = $Credential.GetNetworkCredential().Password
  $token = [Convert]::ToBase64String(
    [Text.Encoding]::UTF8.GetBytes("$($Credential.UserName):$plainPassword")
  )
  $headers = @{ Authorization = "Basic $token" }
} else {
  $headers = @{}
}

function Invoke-OpenSearch([string] $Method, [string] $Path, $Body) {
  $request = @{
    Method = $Method
    Uri = "$osBase$Path"
    Headers = $headers
    ContentType = 'application/json'
  }
  if ($null -ne $Body) {
    $request.Body = $Body | ConvertTo-Json -Depth 12
  }
  if ($SkipCertificateCheck) {
    $request.SkipCertificateCheck = $true
  }
  Invoke-RestMethod @request
}

$regions = @(
  @{
    State = 'AK'
    LatRange = @{ gte = 50 }
    LonRange = @{ lt = -130 }
    SourceCenter = @(-152.0, 64.0)
    TargetCenter = @(-126.0, 46.5)
    Scale = 0.1
  },
  @{
    State = 'HI'
    LatRange = @{ gte = 18; lte = 23 }
    LonRange = @{ gte = -162; lte = -154 }
    SourceCenter = @(-157.0, 20.8)
    TargetCenter = @(-127.0, 37.5)
    Scale = 0.3
  }
)

foreach ($region in $regions) {
  $query = @{
    bool = @{
      filter = @(
        @{ match = @{ state = $region.State } }
        @{ range = @{ lat = $region.LatRange } }
        @{ range = @{ lon = $region.LonRange } }
      )
    }
  }
  $countResponse = Invoke-OpenSearch 'POST' '/gensco-sites/_count' @{ query = $query }
  if ($countResponse.count -eq 0) {
    Write-Host "No unrelocated $($region.State) store coordinates found."
    continue
  }

  $source = @'
double oldLon = ctx._source.lon;
double oldLat = ctx._source.lat;
ctx._source.lon = params.targetLon + (oldLon - params.sourceLon) * params.scale;
ctx._source.lat = params.targetLat + (oldLat - params.sourceLat) * params.scale;
'@
  $body = @{
    query = $query
    script = @{
      lang = 'painless'
      source = $source
      params = @{
        sourceLon = $region.SourceCenter[0]
        sourceLat = $region.SourceCenter[1]
        targetLon = $region.TargetCenter[0]
        targetLat = $region.TargetCenter[1]
        scale = $region.Scale
      }
    }
  }

  $description = "Relocate $($countResponse.count) $($region.State) store coordinates offshore along the West Coast"
  if ($PSCmdlet.ShouldProcess('gensco-sites index', $description)) {
    $result = Invoke-OpenSearch 'POST' '/gensco-sites/_update_by_query?refresh=true&conflicts=proceed' $body
    Write-Host "Updated $($result.updated) $($region.State) store coordinates."
  }
}
