import 'reflect-metadata';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DataSource } from 'typeorm';

const packageSourceDirectory = fileURLToPath(new URL('.', import.meta.url));
const databaseUrl = config({
  path: resolve(packageSourceDirectory, '../../../.env'),
}).parsed?.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  ssl: true,
  synchronize: false,
  migrations: ['src/migrations/*.{ts,js}'],
  entities: ['src/entities/*.{ts,js}'],
});
