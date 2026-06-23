const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function exportTrainingData() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [rows] = await db.execute(`
    SELECT 
      t.assigned_to,
      t.id AS task_id,
      t.priority,
      u.hours_spent,
      u.progress
    FROM tasks t
    JOIN task_updates u ON u.task_id = t.id
    WHERE t.status = 'done'
  `);

  await db.end();

  if (rows.length === 0) {
    console.log("No training data found.");
    return;
  }

  const header = "assigned_to,task_id,priority,hours_spent,progress";
  const csvRows = rows.map(row =>
    `${row.assigned_to},${row.task_id},${row.priority},${row.hours_spent},${row.progress}`
  );

  const outputPath = path.join("/ml-service", "training_data.csv");
  fs.writeFileSync(outputPath, [header, ...csvRows].join("\n"));
  console.log(`Exported ${rows.length} rows to ${outputPath}`);
}

module.exports = exportTrainingData;

exportTrainingData().catch(console.error);