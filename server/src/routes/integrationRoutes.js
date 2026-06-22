const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const requireAuth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const integrations = require('../controllers/integrationController');
const routeGenerationLimit = rateLimit({ windowMs:3000, limit:1, standardHeaders:'draft-7', legacyHeaders:false, message:{ message:'Nową trasę możesz wygenerować raz na 3 sekundy.' } });

router.get('/geocoding/reverse', asyncHandler(integrations.reverseLocation));
router.get('/geocoding/search', asyncHandler(integrations.searchLocation));
router.get('/timezone', asyncHandler(integrations.localTime));
router.post('/routes/running', routeGenerationLimit, asyncHandler(integrations.runningRoute));
router.use(requireAuth);
router.get('/weather', asyncHandler(integrations.weather));
router.get('/places', asyncHandler(integrations.places));
router.post('/recommendations/evaluate', integrations.recommendation);
module.exports = router;
