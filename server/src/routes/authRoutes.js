const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const auth = require('../controllers/authController');
const { registerSchema, loginSchema } = require('../validation/schemas');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false, message: { message: 'Zbyt wiele prób. Spróbuj ponownie później.' } });
router.post('/register', authLimiter, validate(registerSchema), asyncHandler(auth.register));
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(auth.login));
router.post('/logout', auth.logout);
router.get('/me', requireAuth, asyncHandler(auth.me));
module.exports = router;
