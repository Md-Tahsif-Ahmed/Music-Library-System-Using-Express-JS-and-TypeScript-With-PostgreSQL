import dotenv from "dotenv";
import { Knex } from "knex";

dotenv.config();

const config: Knex.Config = {
  client: "pg",
  connection: {
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "music_library",
  },
  migrations: {
    tableName: "knex_migrations",
    directory: "./src/db/migrations",
  },
  seeds: {
    directory: "./src/db/seeds",
  },
};

export default config;
