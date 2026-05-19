const db = require("../config/db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const loginUser = async (email, password) => {
  return new Promise((resolve, reject) => {

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, results) => {
      if (err) return reject(err);

      if (results.length === 0) {
        return reject(new Error("User not found"));
      }

      const user = results[0];

      const isMatch = await bcrypt.compare(
        password,
        user.password
      );

      if (!isMatch) {
        return reject(new Error("Invalid credentials"));
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      resolve({ user, token });
    });
  });
};

module.exports = {loginUser}