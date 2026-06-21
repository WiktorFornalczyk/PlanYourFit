const app = require('./app');
const pool = require('./database/pool');
const { port, nodeEnv, jwtSecret } = require('./config');

if (nodeEnv === 'production' && jwtSecret.includes('development-only')) {
  throw new Error('Ustaw bezpieczny JWT_SECRET przed uruchomieniem produkcyjnym.');
}

const server = app.listen(port, () => console.log(`PlanYourFit API działa na http://localhost:${port}`));

async function shutdown() {
  server.close(async () => { await pool.end(); process.exit(0); });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
