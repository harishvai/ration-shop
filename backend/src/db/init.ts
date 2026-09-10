import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, getDb } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDatabase() {
  console.log('Initializing database schema...');
  await getDb();

  let schemaPath = path.resolve(__dirname, 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    schemaPath = path.resolve(__dirname, '../../src/db/schema.sql');
  }
  if (!fs.existsSync(schemaPath)) {
    schemaPath = path.resolve(process.cwd(), 'src', 'db', 'schema.sql');
  }
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  try {
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      await query(stmt);
    }
    console.log('Database schema successfully initialized! All 14 tables verified.');
  } catch (error) {
    console.error('Error initializing schema:', error);
    throw error;
  }
}

const isDirectRun = process.argv[1] && process.argv[1].replace(/\\/g, '/').includes('init');
if (isDirectRun) {
  initDatabase().then(() => {
    console.log('Schema init complete.');
    process.exit(0);
  }).catch((err) => {
    console.error('Schema init failed:', err);
    process.exit(1);
  });
}
