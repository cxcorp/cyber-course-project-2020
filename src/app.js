const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("flash");
const path = require("path");
const SQL = require("sql-template-strings");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const attachApp = (app, db) => {
  app.use("/static", express.static(path.join(__dirname, "../public")));

  app.use(cookieParser());
  app.use(express.urlencoded({ extended: false }));
  app.use(
    session({ secret: "keyboard cat", resave: false, saveUninitialized: true })
  );
  app.use(flash());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        if (!username) {
          return done(null, false, { message: "Invalid username" });
        }
        if (!password) {
          return done(null, false, { message: "Invalid password" });
        }

        const user = await db.get(SQL`
        SELECT * FROM users
        WHERE username = ${username}
      `);

        if (!user) {
          return done(null, false, { message: "Invalid username" });
        }

        if (user.password !== password) {
          return done(null, false, { message: "Invalid password" });
        }

        return done(null, user);
      } catch (e) {
        done(e);
      }
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async (userId, done) => {
    const user = await db.get(SQL`
      SELECT * FROM users
      WHERE id = ${userId}
    `);
    done(null, user);
  });

  app.use(passport.initialize());
  app.use(passport.session());

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

  app.get("/register", async (req, res) => {
    res.render("register");
  });

  app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username) {
      req.flash("error", "Invalid username");
      return res.redirect("/register");
    }
    if (!password) {
      req.flash("error", "Invalid password");
      return res.redirect("/register");
    }

    const { count: usernameTaken } = await db.get(SQL`
      SELECT COUNT(*) AS count FROM users
      WHERE username = ${username}
    `);
    console.log("usernameTaken", usernameTaken);
    if (usernameTaken > 0) {
      req.flash("error", "Username is already taken.");
      return res.redirect("/register");
    }

    const { lastID } = await db.run(SQL`
      INSERT INTO users (username, password) VALUES
        (${username}, ${password})
    `);
    const user = await db.get(SQL`
      SELECT * FROM users
      WHERE id = ${lastID}
    `);

    req.login(user, (err) => {
      if (err) {
        req.flash("error", "An error occurred. Please try again later.");
        return next(err);
      }

      req.flash(
        "success",
        `Your account is now registered! Welcome to the forums ${user.username}!`
      );
      res.redirect("/");
    });
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
        u.username AS author_name,
        ap.author_posts AS author_posts
      FROM thread_replies tr
          INNER JOIN users u
            ON tr.author_id = u.id
          INNER JOIN (
            SELECT author_id, COUNT(author_id) AS author_posts
            FROM thread_replies
            GROUP BY author_id
          ) ap
            ON ap.author_id = u.id
      WHERE tr.thread_id = ${threadId}
      ORDER BY tr.id ASC
    `);

    console.log(posts);

    res.render("threads/index", { thread, posts });
  });

  app.use("*", (req, res) => {
    res.status(404).render("404");
  });

  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).render("500", { error });
  });
};

module.exports = attachApp;
