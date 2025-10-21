import { Pool } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Set CORS headers to allow requests from any origin
  // In a real production environment, you might want to restrict this to your domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const { rows } = await pool.query("SELECT * FROM cars WHERE status = 'Available' ORDER BY created_at DESC");
    await pool.end(); // Close the connection
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}