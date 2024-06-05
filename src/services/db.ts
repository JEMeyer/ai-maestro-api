import { createPool, Pool } from 'mariadb';

export const pool: Pool = createPool({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  password: process.env.SQL_PW,
  database: process.env.SQL_DB,
});
