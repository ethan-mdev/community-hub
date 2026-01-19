import pg from 'pg';
import { DATABASE_URL } from '$env/static/private';

const { Pool } = pg;

export const pool = new Pool({
    connectionString: DATABASE_URL
});

// Set search path to forum schema by default
pool.on('connect', (client) => {
    client.query('SET search_path TO forum, public');
});
