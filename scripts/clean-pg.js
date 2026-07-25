const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    // Add SSL to ensure connection succeeds
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  
  const res = await client.query('SELECT username, role, email FROM "User"');
  console.log('All Users:', res.rows);
  
  const mockUsernames = ['CodeMasterX', 'AlphaCodes', 'NinjaVendor'];
  const delRes = await client.query('DELETE FROM "User" WHERE username = ANY($1)', [mockUsernames]);
  console.log(`Deleted ${delRes.rowCount} mock users.`);
  
  await client.end();
}

main().catch(console.error);
