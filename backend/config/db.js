const mysql = require("mysql2");
const fs = require("node:fs");

const caSetting = process.env.DB_SSL_CA?.trim();
const ssl = process.env.DB_SSL === "true"
  ? {
      rejectUnauthorized: true,
      ...(caSetting
        ? { ca: caSetting.includes("-----BEGIN CERTIFICATE-----") ? caSetting : fs.readFileSync(caSetting, "utf8") }
        : {}),
    }
  : undefined;

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ...(ssl ? { ssl } : {}),
  waitForConnections: true,
  connectionLimit: 5,
  connectTimeout: 20000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

db.getConnection((err, conn) => {
  if (err) {
    console.error("DB connection failed:", err);
  } else {
    console.log("DB connected successfully");
    conn.release();
  }
});

module.exports = db;