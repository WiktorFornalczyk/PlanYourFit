const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { clientUrl } = require('./config');
const { notFound, errorHandler } = require('./middleware/errors');
const requireAuth = require('./middleware/auth');
const asyncHandler = require('./utils/asyncHandler');
const { exportIcs } = require('./controllers/exportController');

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: 180, standardHeaders: 'draft-7', legacyHeaders: false }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'PlanYourFit API' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api', require('./routes/integrationRoutes'));
app.get('/api/export/ics', requireAuth, asyncHandler(exportIcs));
app.use(notFound);
app.use(errorHandler);

module.exports = app;
