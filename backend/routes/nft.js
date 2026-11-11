import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
// this is for the ai image hash check
const router = express.Router();

// Use environment variables for PostgreSQL connection
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5432,
});

// Initialize AI image hashes table
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_image_hashes (
        id SERIAL PRIMARY KEY,
        image_hash VARCHAR(255) UNIQUE NOT NULL,
        prompt TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        image_url TEXT,
        metadata JSONB
      );
      
      CREATE INDEX IF NOT EXISTS idx_image_hash ON ai_image_hashes(image_hash);
    `);
    console.log('AI image hashes table initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

initDB();

// Public routes for AI image hash checks
router.get('/public/ai-hash/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const result = await pool.query(
      'SELECT EXISTS(SELECT 1 FROM ai_image_hashes WHERE image_hash = $1)',
      [hash]
    );
    res.json({ exists: result.rows[0].exists });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/public/ai-hash', async (req, res) => {
  try {
    const { imageHash, prompt, imageUrl, metadata = {} } = req.body;
    await pool.query(
      'INSERT INTO ai_image_hashes (image_hash, prompt, image_url, metadata) VALUES ($1, $2, $3, $4)',
      [imageHash, prompt, imageUrl, metadata]
    );
    res.json({ success: true });
  } catch (error) {
    if (error.code === '23505') { // PostgreSQL unique violation code
      res.status(409).json({ error: 'Image hash already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});
// Generate an AI image using Pollinations
router.post('/public/generate-image', async (req, res) => {
  try {
    const { prompt, style = '' } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'A prompt is required.' });
    }

    const apiKey = process.env.POLLINATIONS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'Pollinations API key is not configured on the server.'
      });
    }

    const finalPrompt = style
      ? `${prompt.trim()}, ${style} style`
      : prompt.trim();

    const imageUrl =
      `https://gen.pollinations.ai/image/${encodeURIComponent(finalPrompt)}` +
      '?model=flux&width=1024&height=1024';

    const response = await fetch(imageUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      signal: AbortSignal.timeout(120000)
    });

    if (!response.ok) {
      const details = await response.text();
      console.error('Pollinations image error:', response.status, details);

      return res.status(response.status).json({
        error: `Image provider returned status ${response.status}.`
      });
    }

    const contentType = response.headers.get('content-type') || '';

    if (!contentType.startsWith('image/')) {
      return res.status(502).json({
        error: 'The image provider returned an invalid response.'
      });
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());

    const imageDataUrl =
      `data:${contentType};base64,${imageBuffer.toString('base64')}`;

    res.json({ imageUrl: imageDataUrl });
  } catch (error) {
    console.error('Image generation failed:', error.message);

    res.status(500).json({
      error: error.name === 'TimeoutError'
        ? 'Image generation timed out. Please try again.'
        : 'Image generation failed. Please try again.'
    });
  }
});
export default router; 