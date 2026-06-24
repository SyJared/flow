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

  const [rows] = await db.execute(`SELECT t.id AS task_id, t.assigned_to, DATEDIFF(t.due_date, t.created_at) AS planned_days, t.priority,SUM(COALESCE(u.hours_spent,0)) AS total_hours, COUNT(u.id) AS num_updates,t.days_late,t.on_time_completion FROM tasks t JOIN task_updates u ON u.task_id = t.id WHERE t.status = 'done' AND t.workspace_id = 6
 GROUP BY t.id, t.assigned_to, t.priority, t.days_late, t.on_time_completion;`);

  await db.end();

  if (rows.length === 0) {
    console.log("No training data found.");
    return;
  }

  const header = "task_id,assigned_to,planned_days,priority,total_hours,num_updates,days_late,on_time_completion";
  const csvRows = rows.map(row =>
    `${row.task_id},${row.assigned_to},${row.planned_days},${row.priority},${row.total_hours},${row.num_updates},${row.days_late},${row.on_time_completion}`
  );

  const outputPath = path.join("/ml-service", "training_data.csv");
  fs.writeFileSync(outputPath, [header, ...csvRows].join("\n"));
  console.log(`Exported ${rows.length} rows to ${outputPath}`);
}

module.exports = exportTrainingData;

exportTrainingData().catch(console.error);