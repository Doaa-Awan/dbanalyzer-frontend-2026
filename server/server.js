//.env config
require('dotenv').config();
const express = require('express');

const {
  createPostgresClient,
} = require("./db/postgres");

const app = express();

//cors
const cors = require('cors');
const corsOptions = {
  origin: ['http://localhost:5173'], 
//   methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
//   allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
};

app.use(cors(corsOptions));
app.use(express.json());

// Create pool ONCE at startup
const dbPool = createPostgresClient({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Optional: test connection on startup
dbPool.query("SELECT 1")
  .then(() => console.log("✅ Connected to Postgres"))
  .catch(err => {
    console.error("❌ Postgres connection failed", err);
    process.exit(1);
  });

const PORT = process.env.VITE_PORT || 5000;

app.get("/api", (req, res) => {
  res.json({ message: "Hello from the server!" });
});

app.get("/health/db", async (req, res) => {
  try {
    const result = await dbPool.query("SELECT NOW()");
    res.json({
      status: "ok",
      time: result.rows[0].now,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const { getSchema } = require("./db/postgres");

app.get("/db/schema", async (req, res) => {
  try {
    const schema = await getSchema(dbPool);
    res.json(schema);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});