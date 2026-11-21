import express from "express"
import rateLimit from "express-rate-limit"
import pool, { startDatabase } from "./db.js"
import path from "node:path"
import { fileURLToPath } from "node:url"

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distPath = path.join(__dirname, "../dist")
const PORT = process.env.PORT || 3000

app.use(express.json({ limit: "10kb"}))

app.get("/api/health", async (req, res) => {
    try {
        await pool.query("SELECT 1")
        
        res.json({ status: "online", database: "connected", game: "peak panic"})
    } catch (error) {
        console.error(error)

        res.status(500).json({ status: "error", database: "not connected"})
    }
})

async function startServer() {
    try {
        await startDatabase()

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`api running on port ${PORT}`)
        })
    } catch (error) {
        console.error("failed to start server: ", error)
        process.exit(1)
    }
}

const scoreLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {error: "too many requests, try again later."}
})

app.post("/api/scores", scoreLimiter, async (req, res) => {
    try {
        // Express 5 leaves req.body undefined when the request has no JSON body
        const { username, score, altitude, peaches} = req.body ?? {}

        if ( typeof username !== "string" || !/^[a-zA-Z0-9_]{3,20}$/.test(username)) { // i hate regex
            return res.status(400).json({ error: "username must be 3-20 characters and contain only letters, nummbers or underscores."})
        }

        const values = [score, altitude, peaches]

        if (!values.every(Number.isSafeInteger)) {
            return res.status(400).json({error: "score, altitude, peaches must all be integers."})
        }

        if (score < 0 || score > 10000000 || altitude < 0 || altitude > 100000 || peaches < 0 || peaches > 100000) {
            return res.status(400).json({error: "values are outside of the allowed range"})
        }

        const result = await pool.query(
            `INSERT INTO scores (username, peaches, altitude, score)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, score, altitude, peaches, created_at`,
            [username, score, altitude, peaches]
        )

        res.status(201).json({
            message: "score submitted successfully :)",
            result: result.rows[0]
        })
    } catch (error) {
        console.error("score failed to submit:", error)
        res.status(500).json({error: "unable to submit score, check error logs"})
    }
})

app.get("/api/leaderboard", async (req, res) => {
    try {
        const requestedLimit = Number(req.query.limit ?? 10)

        if (!Number.isInteger(requestedLimit) || requestedLimit < 1 || requestedLimit > 50) {
            return res.status(400).json({error: "limit must be between 1 and 50"})
        }

        const result = await pool.query(
            `SELECT username, score, altitude, peaches, created_at
            FROM (SELECT DISTINCT ON (LOWER(username)) username, score, altitude, peaches, created_at
            FROM scores
            ORDER BY LOWER(username), score DESC, created_at ASC) AS best_scores ORDER BY score DESC, created_at ASC LIMIT $1`,
            [requestedLimit]
        ) // retrieves every players score and then orders them, this is removes any duplicates users so its fair

        res.json({leaderboard: result.rows, count: result.rowCount})
    } catch (error) {
        console.error("cannot retrieve leaderboard", error)
        res.status(500).json({error: "cannot retrieve leaderboard, check logs"})
    }
})

app.get("/api/players/:username/best", async (req, res) => {
    try {
        const { username } = req.params

        if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
            return res.status(400).json({error: "invalid username"})
        }

        const result = await pool.query(
            `SELECT username, score, altitude, peaches, created_at
            FROM scores
            WHERE LOWER(username) = LOWER($1)
            ORDER BY score DESC, created_at ASC
            LIMIT 1`,
            [username]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({error: "player has no record of scores"})
        }

        res.json({personalBest: result.rows[0]})
    } catch (error) {
        console.error("cannot retrieve player data", error)
        res.status(500).json({error: "cannot retrieve player data, check logs"})
    }
})

app.use(express.static(distPath))
app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distPath, "index.html"))
})
startServer()