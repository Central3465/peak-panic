import express from "express"
import pool, { startDatabase } from "./db.js"

const app = express()
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

startServer()