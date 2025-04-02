import postgres from 'pg';

const dbUrl = process.env.DATABASE_URL || 'postgresql://linksman:WARMACHINEROX@database:5432/microlinks_db_001';
const port = process.env.PORT || 3069;
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;

const pool = new postgres.Pool({
  connectionString: dbUrl,
});

pool
  .connect()
  .then(() => console.log('⧃〉Connected to PostgreSQL database'))
  .catch((err) => console.error('⧃〉Database connection error:', err));

export { pool, baseUrl };