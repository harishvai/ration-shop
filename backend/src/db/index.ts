import { PGlite } from '@electric-sql/pglite';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

let pgPool: Pool | null = null;
let pgliteInstance: PGlite | null = null;
let isInitialized = false;

export async function getDb() {
  if (isInitialized) {
    return { query, transaction };
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    try {
      console.log('Connecting to PostgreSQL via DATABASE_URL...');
      const pool = new Pool({ connectionString: databaseUrl });
      // Test connection
      await pool.query('SELECT 1');
      pgPool = pool;
      console.log('Successfully connected to external PostgreSQL database.');
      isInitialized = true;
      return { query, transaction };
    } catch (err) {
      console.warn('Failed to connect to external PostgreSQL, falling back to embedded PGlite:', (err as Error).message);
    }
  }

  // Fallback / Default: Embedded PGlite (WASM Postgres 16 with disk persistence)
  const dataDir = path.resolve(process.cwd(), 'data', 'pglite_db');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  console.log(`Initializing embedded PostgreSQL (PGlite) at: ${dataDir}`);
  pgliteInstance = new PGlite(dataDir);
  await pgliteInstance.waitReady;
  console.log('Embedded PostgreSQL engine ready.');
  isInitialized = true;

  return { query, transaction };
}

export async function query<T = any>(text: string, params: any[] = []): Promise<{ rows: T[]; rowCount: number }> {
  await getDb();

  if (pgPool) {
    const result = await pgPool.query(text, params);
    return {
      rows: result.rows as T[],
      rowCount: result.rowCount || 0,
    };
  }

  if (pgliteInstance) {
    const result = await pgliteInstance.query<T>(text, params);
    return {
      rows: (result.rows || []) as T[],
      rowCount: (result.rows || []).length,
    };
  }

  throw new Error('Database not initialized');
}

export async function transaction<T>(callback: (client: { query: typeof query }) => Promise<T>): Promise<T> {
  await getDb();

  if (pgPool) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      const scopedQuery = async (text: string, params: any[] = []) => {
        const res = await client.query(text, params);
        return { rows: res.rows, rowCount: res.rowCount || 0 };
      };
      const result = await callback({ query: scopedQuery as any });
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  if (pgliteInstance) {
    return await pgliteInstance.transaction(async (tx) => {
      const scopedQuery = async (text: string, params: any[] = []) => {
        const res = await tx.query(text, params);
        return { rows: res.rows, rowCount: (res.rows || []).length };
      };
      return await callback({ query: scopedQuery as any });
    });
  }

  throw new Error('Database not initialized');
}

export default { query, transaction, getDb };
