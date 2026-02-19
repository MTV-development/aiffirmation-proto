/**
 * Pulls all KV store values from Supabase and writes them into seed files.
 *
 * Usage: node --import tsx scripts/sync-seeds-from-db.ts
 */
import { db } from '@/src/db';
import { kvStore } from '@/src/db/schema';
import { asc } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

const SEEDS_DIR = path.join(__dirname, '..', 'src', 'db', 'seeds');

interface KVRow {
  key: string;
  value: Record<string, unknown>;
}

/**
 * Extract the base version from a KV key prefix.
 * e.g. "fo-04-discovery" → "fo-04", "af-01" → "af-01", "fo-12" → "fo-12"
 */
function getBaseVersion(versionPrefix: string): string {
  // Match pattern: 2+ letters, dash, 2 digits
  const match = versionPrefix.match(/^([a-z]+-\d+)/);
  return match ? match[1] : versionPrefix;
}

/**
 * Convert a base version like "fo-04" to a camelCase export name like "fo04Seeds"
 */
function toExportName(baseVersion: string): string {
  // "fo-04" → "fo04Seeds"
  const camel = baseVersion.replace(/-(\d+)/, '$1');
  return `${camel}Seeds`;
}

/**
 * Serialize a JS value as a TypeScript literal string.
 * Handles strings (using backtick template literals for multiline),
 * numbers, booleans, arrays, and objects.
 */
function serializeValue(val: unknown, indent: number): string {
  const pad = '  '.repeat(indent);
  const innerPad = '  '.repeat(indent + 1);

  if (val === null || val === undefined) {
    return 'null';
  }
  if (typeof val === 'boolean') {
    return String(val);
  }
  if (typeof val === 'number') {
    return String(val);
  }
  if (typeof val === 'string') {
    // Use backtick for multiline or strings containing single quotes
    if (val.includes('\n') || val.includes("'")) {
      // Escape backticks and ${} in the string
      const escaped = val.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
      return '`' + escaped + '`';
    }
    return `'${val.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return '[]';
    const items = val.map((item) => `${innerPad}${serializeValue(item, indent + 1)}`);
    return `[\n${items.join(',\n')}\n${pad}]`;
  }
  if (typeof val === 'object') {
    const entries = Object.entries(val as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    const lines = entries.map(([k, v]) => {
      // Use quoted key if it contains special characters
      const keyStr = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `'${k}'`;
      return `${innerPad}${keyStr}: ${serializeValue(v, indent + 1)},`;
    });
    return `{\n${lines.join('\n')}\n${pad}}`;
  }
  return String(val);
}

/**
 * Generate the TypeScript seed file content for a given base version and its entries.
 */
function generateSeedFile(baseVersion: string, entries: KVRow[]): string {
  const exportName = toExportName(baseVersion);

  let content = `import type { SeedEntry } from './types';\n\n`;
  content += `export const ${exportName}: SeedEntry[] = [\n`;

  for (const entry of entries) {
    content += `  {\n`;
    content += `    key: '${entry.key}',\n`;
    content += `    value: ${serializeValue(entry.value, 2)},\n`;
    content += `  },\n`;
  }

  content += `];\n`;

  return content;
}

async function main() {
  console.log('Pulling KV store values from Supabase...');

  const rows: KVRow[] = await db
    .select({ key: kvStore.key, value: kvStore.value })
    .from(kvStore)
    .orderBy(asc(kvStore.key)) as KVRow[];

  console.log(`Found ${rows.length} total entries.`);

  // Group by base version
  const groups: Record<string, KVRow[]> = {};
  for (const row of rows) {
    const parts = row.key.split('.');
    const versionPrefix = parts[1]; // e.g. "fo-04-discovery"
    const baseVersion = getBaseVersion(versionPrefix);
    if (!groups[baseVersion]) groups[baseVersion] = [];
    groups[baseVersion].push(row);
  }

  // Write seed files
  for (const [baseVersion, entries] of Object.entries(groups).sort()) {
    const fileName = `${baseVersion}.ts`;
    const filePath = path.join(SEEDS_DIR, fileName);
    const content = generateSeedFile(baseVersion, entries);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  Wrote ${fileName} (${entries.length} entries)`);
  }

  console.log('\nDone! All seed files updated.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
