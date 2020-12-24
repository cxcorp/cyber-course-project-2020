const fs = require("fs");
const path = require("path");
const SQL = require("sql-template-strings");

const getSeedFiles = async (dirPath) => {
  const dirents = await fs.promises.readdir(dirPath, { withFileTypes: true });
  return dirents
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name)
    .sort((a, b) => a.localeCompare(b));
};

const seedDb = async (db, seedsPath) => {
  const files = await getSeedFiles(seedsPath);
  for (const file of files) {
    const { count: isAlreadyRun } = await db.get(
      SQL`SELECT COUNT(*) AS count FROM seeds WHERE filename = ${file}`
    );
    if (isAlreadyRun > 0) {
      continue;
    }

    const fullPath = path.join(seedsPath, file);
    const sql = await fs.promises.readFile(fullPath, "utf8");
    if (sql.trim().length === 0) {
      console.log(`Seed ${file} empty, skipping...`);
      continue;
    }
    console.log(`Running seed ${file}`);

    for (const stmt of sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => !!s)) {
      await db.run(stmt + ";");
    }

    await db.run(SQL`INSERT INTO seeds (filename) VALUES (${file})`);
  }
};

module.exports = seedDb;
