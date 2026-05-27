const loginService = require('../services/loginService');

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { user, token } = await loginService.loginUser(email, password);
    return res.status(200).json({
      token,
      message: "Login successful",
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
  });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.message
    });
  }
}

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const result = await loginService.registerUser(name, email, password);
    return res.status(201).json({
      success: true,
      message: result.message
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
}

module.exports = { login, registerUser}