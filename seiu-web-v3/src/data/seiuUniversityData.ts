import rawUniversityData from './seiuUniversities.tsv?raw';

export interface SeiuUniversity {
  id: string;
  name: string;
  koreanName: string;
  ranking: string;
  region: string;
  regionLabel: string;
  requiredBankKrw: number;
  establishedYear: string;
  highlight: string;
  website: string;
  logoUrl: string;
  majors: string[];
  gpa: string;
  topik: string;
  acceptedEducation: string;
  regionalRestriction: string;
  financeNote: string;
  applicationFeeKrw: number;
  applicationFeeRaw: string;
  tuitionKrw: number;
  tuitionRaw: string;
  dormKrw: number;
  dormRaw: string;
  otherFeeKrw: number;
  otherFeeRaw: string;
  scholarship: string;
  invoiceNote: string;
  invoiceKrw: number;
}

/** Đọc TSV có dấu ngoặc kép và xuống dòng bên trong ô. */
const parseTsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        cell += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (!quoted && char === '\t') {
      row.push(cell.trim());
      cell = '';
      continue;
    }

    if (!quoted && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
};

const firstKrwAmount = (value: string): number => {
  const match = String(value || '').match(/\d[\d.,]*/);
  if (!match) return 0;
  return Number(match[0].replace(/\D/g, '')) || 0;
};

const regionKey = (label: string): string => {
  const value = label.toLowerCase();
  if (value.includes('seoul')) return 'Seoul';
  if (value.includes('busan')) return 'Busan';
  if (value.includes('daegu')) return 'Daegu';
  if (value.includes('daejeon')) return 'Daejeon';
  if (value.includes('incheon')) return 'Incheon';
  if (value.includes('gyeonggi')) return 'Gyeonggi';
  if (value.includes('chungcheongnam')) return 'Chungcheongnam';
  if (value.includes('ulsan')) return 'Ulsan';
  if (value.includes('jeju')) return 'Jeju';
  return label || 'Khác';
};

const normalizeWebsite = (value: string): string => {
  const match = String(value || '').match(/https?:\/\/[^\s"<>]+|(?:www\.)?[a-z0-9][a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s"<>]*)?/i);
  if (!match) return '';
  return match[0].startsWith('http') ? match[0] : `https://${match[0]}`;
};

const hasHangul = (value: string): boolean => /[\uac00-\ud7af]/.test(value || '');

const makeId = (name: string, index: number): string => {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return normalized || `truong-${index + 1}`;
};

export const seiuUniversities: SeiuUniversity[] = parseTsv(rawUniversityData)
  .filter((columns) => columns.length >= 20 && columns[1]?.trim())
  .map((columns, index) => {
    const firstName = columns[1].trim();
    const secondName = columns[2].trim();
    const name = hasHangul(firstName) ? secondName : firstName;
    const koreanName = hasHangul(firstName) ? firstName : secondName;
    const website = normalizeWebsite(columns[8]);
    const applicationFeeKrw = firstKrwAmount(columns[15]);
    const tuitionKrw = firstKrwAmount(columns[16]);
    const dormKrw = firstKrwAmount(columns[17]);
    const otherFeeKrw = firstKrwAmount(columns[18]);
    return {
      id: makeId(name, index),
      name,
      koreanName,
      ranking: columns[3],
      region: regionKey(columns[4]),
      regionLabel: columns[4],
      requiredBankKrw: firstKrwAmount(columns[5]),
      establishedYear: columns[6],
      highlight: columns[7].replace(/^[-–]\s*/, ''),
      website,
      logoUrl: website ? `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(website)}&sz=128` : '',
      majors: columns[9].split('\n').map((item) => item.trim()).filter(Boolean),
      gpa: columns[10],
      topik: columns[11],
      acceptedEducation: columns[12],
      regionalRestriction: columns[13],
      financeNote: columns[14],
      applicationFeeKrw,
      applicationFeeRaw: columns[15],
      tuitionKrw,
      tuitionRaw: columns[16],
      dormKrw,
      dormRaw: columns[17],
      otherFeeKrw,
      otherFeeRaw: columns[18],
      scholarship: columns[19],
      invoiceNote: columns[20],
      // Bảng dự toán của SEIU chỉ dùng phần học phí/Invoice trường.
      // Không tự cộng phí đăng ký, KTX, bảo hiểm hoặc khoản khác.
      invoiceKrw: tuitionKrw,
    };
  });

export const seiuUniversityRegions = Array.from(new Set(seiuUniversities.map((item) => item.region)));
