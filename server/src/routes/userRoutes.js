const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const user = require('../controllers/userController');
const { profileSchema, changePasswordSchema } = require('../validation/schemas');

router.use(requireAuth);
router.put('/me', validate(profileSchema), asyncHandler(user.updateProfile));
router.put('/me/password', validate(changePasswordSchema), asyncHandler(user.changePassword));
module.exports = router;
