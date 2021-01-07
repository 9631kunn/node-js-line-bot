require("dotenv").config();
const env = process.env;
const { Pool } = require("pg");

exports.pool = new Pool({
  host: env.POSTGRES_HOST,
  database: env.POSTGRES_DB,
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  port: 5432,
});
