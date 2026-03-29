require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./pool');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getAppliedMigrations() {
  const [rows] = await pool.query('SELECT name FROM _migrations ORDER BY id');
  return rows.map((row) => row.name);
}

function getMigrationFiles(suffix) {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(suffix))
    .sort();
}

function migrationName(filename) {
  return filename.replace(/\.(up|down)\.sql$/, '');
}

async function up() {
  await ensureMigrationsTable();

  const applied = await getAppliedMigrations();
  const files = getMigrationFiles('.up.sql');
  const pending = files.filter((f) => !applied.includes(migrationName(f)));

  if (pending.length === 0) {
    console.log('No pending migrations.');
    return;
  }

  for (const file of pending) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    const name = migrationName(file);
    console.log(`Applying: ${name}`);
    await pool.query(sql);
    await pool.query('INSERT INTO _migrations (name) VALUES (?)', [name]);
    console.log(`Applied:  ${name}`);
  }
}

async function down() {
  await ensureMigrationsTable();

  const [rows] = await pool.query(
    'SELECT id, name FROM _migrations ORDER BY id DESC LIMIT 1'
  );

  if (rows.length === 0) {
    console.log('No migrations to revert.');
    return;
  }

  const { id, name } = rows[0];
  const downFile = `${name}.down.sql`;
  const downPath = path.join(MIGRATIONS_DIR, downFile);

  if (fs.existsSync(downPath)) {
    const sql = fs.readFileSync(downPath, 'utf8');
    console.log(`Reverting: ${name}`);
    await pool.query(sql);
  } else {
    console.warn(`Warning: ${downFile} not found, removing tracking row only.`);
  }

  await pool.query('DELETE FROM _migrations WHERE id = ?', [id]);
  console.log(`Reverted: ${name}`);
}

async function main() {
  const command = process.argv[2];

  try {
    if (command === 'up') {
      await up();
    } else if (command === 'down') {
      await down();
    } else {
      console.error('Usage: node db/migrate.js <up|down>');
      process.exit(1);
    }
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
