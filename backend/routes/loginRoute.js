const express = require('express');
const router = express.Router();
const { login , registerUser} = require('../controller/loginController');
const validate = require("../middleware/validationMiddleware");
const { registerSchema } = require('../validations/registerSchema');
const authMiddleware = require('../middleware/authMiddleware');
const { updateProfilePicture } = require('../controller/profileController');

router.post('/login', login);

router.post('/register',validate(registerSchema), registerUser);
router.put('/profile-picture', authMiddleware, updateProfilePicture);

module.exports = router;
