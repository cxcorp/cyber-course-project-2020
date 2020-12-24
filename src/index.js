const path = require("path");
const express = require("express");
require("express-async-errors");
const exhbs = require("express-handlebars");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const fs = require("fs");

const runSeeds = require("./db-seeder");
const attachApp = require("./app");
const viewHelpers = require("./view-helpers");

const DB_FILE_NAME = "db.sqlite";
const MIGRATIONS_PATH = path.join(__dirname, "../migrations");
const SEEDS_PATH = path.join(__dirname, "../seeds");

const app = express();
app.set("views", path.join(__dirname, "./views"));
app.engine(
  "handlebars",
  exhbs({
    helpers: viewHelpers,
  })
);
app.set("view engine", "handlebars");

const { APP_PORT, APP_HOST } = process.env;
const PORT = APP_PORT || 3000;
const HOST = APP_HOST || "127.0.0.1";

try {
  fs.unlinkSync(DB_FILE_NAME);
} catch (e) {}

sqlite3.verbose();

sqlite
  .open({
    driver: sqlite3.Database,
    filename: DB_FILE_NAME,
  })
  .then(async (db) => {
    db.on("trace", (d) => console.log(d));

    console.log("Running database migrations...");
    await db.migrate({ migrationsPath: MIGRATIONS_PATH });
    console.log("Running database seeds...");
    await runSeeds(db, SEEDS_PATH);
    return db;
  })
  .then(
    (db) => {
      attachApp(app, db);
      app.listen(PORT, HOST, () => {
        console.log(`Web server listening on http://${HOST}:${PORT}/`);
      });
    },
    (e) => {
      console.error("Failed to run database migrations", e);
      process.exit(1);
    }
  );
