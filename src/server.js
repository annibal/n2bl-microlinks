import express from 'express';
import postgres from 'pg';
import crypto from 'crypto';
import path from 'path';
import cors from 'cors';

const __dirname = path.resolve();

// Extract database connection info from env var or use defaults
const dbUrl = process.env.DATABASE_URL || 'postgresql://linksman:WARMACHINEROX@database:5432/microlinks_db_001';
const port = process.env.PORT || 3069;
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;

// Create Express app
const app = express();

// Database connection
const pool = new postgres.Pool({
  connectionString: dbUrl,
});

// Connect to database and log success/failure
pool
  .connect()
  .then(() => console.log('⧃〉Connected to PostgreSQL database'))
  .catch((err) => console.error('⧃〉Database connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Generate a short code (micro)
function generateMicro(length = 6) {
  return crypto
    .randomBytes(Math.ceil((length * 3) / 4))
    .toString('base64')
    .slice(0, length)
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Validate URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

// API endpoint to create a micro link
app.post('/api/micro', async (req, res) => {
  const { link, label, passcode } = req.body;

  if (!link || !isValidUrl(link)) {
    return res.status(401).json({ error: 'Invalid URL' });
  }

  try {
    // Generate unique micro code (retry up to 3 times if collision)
    let micro;
    let retries = 0;
    let inserted = false;

    while (!inserted && retries < 3) {
      micro = generateMicro();

      try {
        const query = `
          INSERT INTO micro_link_registry (link, micro, label, passcode, info) 
          VALUES ($1, $2, $3, $4, $5) 
          RETURNING micro
        `;

        const clientInfo = JSON.stringify({
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date(),
        });

        await pool.query(query, [link, micro, label || null, passcode || null, clientInfo]);
        inserted = true;
      } catch (err) {
        if (err.code === '23505') {
          // Unique violation
          retries++;
        } else {
          throw err;
        }
      }
    }

    if (!inserted) {
      throw new Error('Failed to generate unique micro code');
    }

    res.json({
      micro,
      microUrl: `${baseUrl}/${micro}`,
    });
  } catch (error) {
    console.error('Error creating micro link:', error);
    res.status(500).json({ error: 'Failed to create micro link' });
  }
});

// Redirect endpoint
app.get('/:micro', async (req, res) => {
  const { micro } = req.params;

  try {
    // First, look up the original URL
    const lookupQuery = `
      SELECT link FROM micro_link_registry 
      WHERE micro = $1
    `;

    const result = await pool.query(lookupQuery, [micro]);

    if (result.rows.length === 0) {
      return res.status(404).send('Micro link not found');
    }

    const link = result.rows[0].link;

    // Log access
    const clientInfo = JSON.stringify({
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referrer') || null,
    });

    const logQuery = `
      INSERT INTO micro_accesses (micro, info)
      VALUES ($1, $2)
    `;

    // Fire and forget the log insertion (don't await)
    pool.query(logQuery, [micro, clientInfo]).catch((err) => console.error('Error logging access:', err));

    // Redirect user to the original link
    res.redirect(link);
  } catch (error) {
    console.error('Error handling redirect:', error);
    res.status(500).send('Server error');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start the server
app.listen(port, () => {
  console.log(`⧃〉Server running at ${baseUrl}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  pool.end().then(() => {
    console.log('⧃〉Database pool closed');
    process.exit(0);
  });
});

export default app