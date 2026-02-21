import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";
import { seedDatabase } from "./seed.js";
import { createChildLogger } from "../core/logger.js";

const log = createChildLogger("db");

export function initDatabase(dbPath = "./realbase.db") {
  log.info({ path: dbPath }, "Initializing database");

  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");

  // Create tables
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS neighborhoods (
      zipcode TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      area_sq_miles REAL NOT NULL,
      composite_score REAL DEFAULT 0,
      school_score REAL DEFAULT 0,
      safety_score REAL DEFAULT 0,
      transit_score REAL DEFAULT 0,
      walkability_score REAL DEFAULT 0,
      affordability_score REAL DEFAULT 0,
      crime_count_90d INTEGER DEFAULT 0,
      crime_per_sq_mile REAL DEFAULT 0,
      walk_score_raw INTEGER DEFAULT 0,
      transit_score_raw INTEGER DEFAULT 0,
      bike_score_raw INTEGER DEFAULT 0,
      median_income INTEGER DEFAULT 0,
      median_rent INTEGER DEFAULT 0,
      population INTEGER DEFAULT 0,
      avg_school_rating REAL DEFAULT 0,
      scores_updated_at TEXT,
      data_updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      address TEXT NOT NULL,
      neighborhood TEXT,
      zipcode TEXT,
      lat REAL,
      lng REAL,
      bedrooms INTEGER,
      bathrooms INTEGER,
      rent_monthly INTEGER,
      ami_percentage INTEGER,
      is_affordable INTEGER DEFAULT 0,
      application_deadline TEXT,
      url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      amount TEXT NOT NULL,
      token TEXT NOT NULL,
      tx_hash TEXT,
      builder_code_included INTEGER DEFAULT 1,
      description TEXT,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS agent_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  const db = drizzle(sqlite, { schema });

  // Seed neighborhood data
  seedDatabase(db);

  log.info("Database initialized");
  return db;
}

export type AppDatabase = ReturnType<typeof initDatabase>;
