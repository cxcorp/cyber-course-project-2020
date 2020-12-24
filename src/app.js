const express = require("express");
const path = require("path");
const SQL = require("sql-template-strings");

const attachApp = (app, db) => {
  app.use("/static", express.static(path.join(__dirname, "../public")));

  app.get("/", async (req, res) => {
    const threads = await db.all(`
      SELECT
        t.*,
        u.username AS author_name
      FROM threads t
        INNER JOIN users u
          ON u.id = t.author_id
      ORDER BY t.create_date DESC
    `);
    console.log(threads);
    res.render("index", { threads });
  });

  app.get("/topics/:topic_id", async (req, res, next) => {
    const { topic_id } = req.params;
    const threadId = parseInt(topic_id, 10);

    if (isNaN(threadId)) {
      return next();
    }

    const thread = await db.get(SQL`
      SELECT
        t.*,
        u.username AS author_Name
      FROM threads t
        INNER JOIN users u
          ON u.id = t.author_id
      WHERE t.id = ${threadId}
    `);

    if (typeof thread === "undefined") {
      return next();
    }

    /*
        CREATE TABLE IF NOT EXISTS thread_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id INTEGER NOT NULL REFERENCES threads(id),
    author_id INTEGER NOT NULL REFERENCES users(id),
    reply_date DATETIME NOT NULL,
    content TEXT NOT NULL
); */

    const posts = await db.all(SQL`
      SELECT
        tr.*,
        u.username AS author_name
      FROM thread_replies tr
          INNER JOIN users u
            ON tr.author_id = u.id
      WHERE tr.thread_id = ${threadId}
      ORDER BY tr.id ASC
    `);

    console.log(posts)

    res.render("threads/index", { thread, posts });
  });

  app.use("*", (req, res) => {
    res.status(404).render("404");
  });

  app.use((error, req, res, next) => {
    console.error(error)
    res.status(500).render("500", { error });
  });
};

module.exports = attachApp;
