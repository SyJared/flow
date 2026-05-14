

const createNotification = (db, { actor_id, task_id, workspace_id, type, message }) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO notifications (actor_id, task_id, workspace_id, type, message)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [actor_id, task_id, workspace_id, type, message], (err, result) => {
      if (err) return reject(err);

      resolve(result.insertId); // return notification id
    });
  });
};

module.exports = createNotification;