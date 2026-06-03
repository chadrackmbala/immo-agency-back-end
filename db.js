import { Pool } from "pg";
export const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "restapi",
    password: "TON_MOT_DE_PASSE",
    port: 5432,
});
//# sourceMappingURL=db.js.map