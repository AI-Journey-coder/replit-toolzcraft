import Papa from 'papaparse';

export function parseCsv(text: string): Record<string, string>[] {
  const parsed = Papa.parse<string[]>(text.replace(/^\uFEFF/, ''), { delimiter: ',', skipEmptyLines: 'greedy' });
  if (parsed.errors.length) throw new Error('Invalid CSV: ' + parsed.errors[0].message);
  const [headers, ...rows] = parsed.data;
  if (!headers?.length || headers.some(h => !h.trim())) throw new Error('CSV needs non-empty column headings.');
  if (new Set(headers).size !== headers.length) throw new Error('Column headings must be unique.');
  return rows.map((values, index) => {
    if (values.length !== headers.length) throw new Error(`Row ${index + 2} has ${values.length} fields; expected ${headers.length}.`);
    return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
  });
}

export function toCsv(data: unknown): string {
  if (!Array.isArray(data) || !data.length || data.some(row => !row || typeof row !== 'object' || Array.isArray(row))) {
    throw new Error('Input must be a non-empty JSON array of objects.');
  }
  const fields = Array.from(new Set(data.flatMap(row => Object.keys(row))));
  if (!fields.length) throw new Error('Objects must contain at least one field.');
  return Papa.unparse({ fields, data: data.map(row => fields.map(key => {
    const value = Object.hasOwn(row, key) ? row[key] : undefined;
    return value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  })) }, { newline: '\n' });
}
