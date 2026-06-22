const db = require("../config/db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const appError = require("../utils/appError")

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


const registerUser = async (name, email, password) => {
  return new Promise(async (resolve, reject) => {
    const hashed = await bcrypt.hash(password, 10);
    const checkSql = "SELECT * FROM users WHERE email = ?";
    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(checkSql, [email], (err, results) => {
      if (err) return reject(err);

      if (results.length > 0) {
       return reject(new appError("Email already in use", 400));
      }

      db.query(sql, [name, email, hashed], (err, results) => {
        if (err) return reject(err);

        resolve({ message: "User registered successfully"});
      })
    })
  })
}
module.exports = {loginUser, registerUser}