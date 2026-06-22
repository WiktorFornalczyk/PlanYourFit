require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

module.exports = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'development-only-secret-change-before-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME || 'planyourfit',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  },
  googlePlacesKey: process.env.GOOGLE_PLACES_API_KEY || '',
  openRouteServiceKey: process.env.OPENROUTESERVICE_API_KEY || '',
  nominatimUserAgent: process.env.NOMINATIM_USER_AGENT || `PlanYourFit/1.0 (${process.env.CLIENT_URL || 'http://localhost:3000'})`,
};
