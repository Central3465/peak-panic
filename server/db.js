import "dotenv/config"
import pg from "pg"

const {Pool} = pg

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL missing!")
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "true" ? {rejectUnauthorized: false} : undefined,
})

export async function startDatabase() {
    await pool.query(`CREATE TABLE IF NOT EXISTS scores (
        id SERIAL PRIMARY KEY,
        username VARCHAR(20) NOT NULL,
        score INTEGER NOT NULL DEFAULT 0,
        altitude INTEGER NOT NULL DEFAULT 0,
        peaches INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT valid_score CHECK (score >= 0),
        CONSTRAINT valid_altitude CHECK (altitude >= 0),
        CONSTRAINT valid_peaches CHECK (peaches >= 0)
        )
    `)

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_scores_score ON scores (score DESC)`)

    console.log("Database initalised successfully :)")
}

export default pool