const http = require('http');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      timestamp TEXT,
      name TEXT,
      practice TEXT,
      custom_behaviors TEXT,
      q1 TEXT,
      q2 TEXT,
      q3 TEXT,
      extra TEXT
    )
  `);
  console.log('Database ready');
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // Serve index.html
  if (req.method === 'GET' && req.url === '/') {
    const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html); return;
  }

  // GET /responses
  if (req.method === 'GET' && req.url === '/responses') {
    try {
      const result = await pool.query('SELECT * FROM responses ORDER BY id ASC');
      const rows = result.rows.map(r => ({
        timestamp: r.timestamp,
        name: r.name,
        practice: r.practice ? r.practice.split(' | ') : [],
        customBehaviors: r.custom_behaviors ? r.custom_behaviors.split(' | ') : [],
        openAnswers: [r.q1 || '', r.q2 || '', r.q3 || ''],
        extraAnswers: r.extra ? r.extra.split(' | ') : [],
      }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(rows));
    } catch (e) {
      console.error(e);
      res.writeHead(500); res.end('DB error');
    }
    return;
  }

  // POST /submit
  if (req.method === 'POST' && req.url === '/submit') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const d = JSON.parse(body);
        await pool.query(
          `INSERT INTO responses (timestamp, name, practice, custom_behaviors, q1, q2, q3, extra)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            d.timestamp || new Date().toISOString(),
            d.name || '',
            (d.practice || []).join(' | '),
            (d.customBehaviors || []).join(' | '),
            d.openAnswers?.[0] || '',
            d.openAnswers?.[1] || '',
            d.openAnswers?.[2] || '',
            (d.extraAnswers || []).join(' | '),
          ]
        );
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        console.error(e);
        res.writeHead(400); res.end('Bad request');
      }
    }); return;
  }

  // DELETE /response/:id
  if (req.method === 'DELETE' && req.url.startsWith('/response/')) {
    const id = req.url.split('/response/')[1];
    try {
      await pool.query('DELETE FROM responses WHERE id = $1', [id]);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch (e) {
      console.error(e);
      res.writeHead(500); res.end('DB error');
    }
    return;
  }

  res.writeHead(404); res.end('Not found');
});

initDb().then(() => {
  server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}).catch(err => {
  console.error('Failed to init DB:', err);
  process.exit(1);
});
