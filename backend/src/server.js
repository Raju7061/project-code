require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pgPool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

// Check DB connection on startup
(async () => {
  try {
    await pgPool.query("SELECT NOW()");
    console.log("✅ Connected to PostgreSQL");
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err.message);
  }
})();
// ------------------------------------------------------------------
// Health
// ------------------------------------------------------------------
app.get("/health", async (req, res) => {
  try {
    await pgPool.query("SELECT 1");
    res.json({
      status: "UP",
      database: "CONNECTED",
    });
  } catch (err) {
    res.status(500).json({
      status: "DOWN",
      database: err.message,
    });
  }
});

// ------------------------------------------------------------------
// Get all Todos
// ------------------------------------------------------------------
app.get("/api/todos", async (req, res) => {
  try {
    const result = await pgPool.query(
      "SELECT * FROM todos ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------------------
// Search Todos
// ------------------------------------------------------------------
app.get("/api/todos/search", async (req, res) => {
  const q = req.query.q || "";

  try {
    let result;

    if (q.trim()) {
      result = await pgPool.query(
        `SELECT *
         FROM todos
         WHERE title ILIKE $1
            OR description ILIKE $1
         ORDER BY id DESC`,
        [`%${q}%`]
      );
    } else {
      result = await pgPool.query(
        "SELECT * FROM todos ORDER BY id DESC"
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------------------
// Insert Todo
// ------------------------------------------------------------------
app.post("/api/todos", async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({
      error: "Title is required",
    });
  }

  try {
    const result = await pgPool.query(
      `INSERT INTO todos
      (title, description)
      VALUES ($1, $2)
      RETURNING *`,
      [title, description || ""]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------------------
// Update Todo
// ------------------------------------------------------------------
app.put("/api/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  try {
    const result = await pgPool.query(
      `UPDATE todos
       SET completed = $1
       WHERE id = $2
       RETURNING *`,
      [completed, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Todo not found",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------------------
// Delete Todo
// ------------------------------------------------------------------
app.delete("/api/todos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pgPool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Todo not found",
      });
    }

    res.json({
      success: true,
      deleted: result.rows[0],
    });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Backend server running with port ${PORT}`);
});
