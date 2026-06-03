// import { Pool } from "pg";

// export const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "immoagency",
//   password: "Bigbelly@1997",
//   port: 5432,
// });

import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});