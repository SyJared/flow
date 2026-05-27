const express = require('express');
const router = express.Router();
const { login , registerUser} = require('../controller/loginController');
const validate = require("../middleware/validationMiddleware");
const { registerSchema } = require('../validations/registerSchema');

router.post('/login', login);

router.post('/register',validate(registerSchema), registerUser);

module.exports = router;