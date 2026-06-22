const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const integrations = require('../controllers/integrationController');

router.get('/geocoding/reverse', asyncHandler(integrations.reverseLocation));
router.get('/geocoding/search', asyncHandler(integrations.searchLocation));
router.post('/routes/running', asyncHandler(integrations.runningRoute));
router.use(requireAuth);
router.get('/weather', asyncHandler(integrations.weather));
router.get('/places', asyncHandler(integrations.places));
router.post('/recommendations/evaluate', integrations.recommendation);
module.exports = router;
