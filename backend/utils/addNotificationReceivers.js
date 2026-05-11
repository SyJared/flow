// utils/addNotificationReceivers.js

const addNotificationReceivers = (db, notificationId, workspace_id, actor_id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO notification_users (notification_id, user_id)
      SELECT ?, user_id
      FROM workspace_members
      WHERE workspace_id = ? AND user_id != ?
    `;

    db.query(sql, [notificationId, workspace_id, actor_id], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

module.exports = addNotificationReceivers;