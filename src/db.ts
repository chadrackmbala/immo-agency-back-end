import { Pool } from "pg";

// export const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "restapi",
//   password: "Bigbelly@1997",
//   port: 5432,
// });

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "immoagency",
  password: "Bigbelly@1997",
  port: 5432,
});