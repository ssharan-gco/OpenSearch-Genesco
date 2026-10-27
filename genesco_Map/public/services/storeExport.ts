import { displayLabel } from '../lib/constants';
import { SiteRecord } from '../lib/types';

const escapeCsvValue = (value: string) => `"${value.replace(/"/g, '""')}"`;

export const createStoresCsv = (sites: SiteRecord[]): string => {
  const rows = [
    ['Store Number', 'Address', 'Status'],
    ...sites.map((site) => [
      site.siteId,
      [site.address, site.city, site.state, site.zip].filter(Boolean).join(', '),
      displayLabel(site.status),
    ]),
  ];

  return `\uFEFF${rows.map((row) => row.map(escapeCsvValue).join(',')).join('\r\n')}`;
};

export const exportStoresToCsv = (sites: SiteRecord[]) => {
  const csv = createStoresCsv(sites);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `stores-${date}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
