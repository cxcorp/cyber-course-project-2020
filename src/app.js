const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("flash");
const path = require("path");
const SQL = require("sql-template-strings");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const requireLoggedIn = (req, res, next) => {
  if (!req.user) {
    req.flash("error", "You must be logged in to do that");
    return res.redirect("/");
  }
  next();
};

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

  app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
  });

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

    res.render("index", { threads });
  });

  app.get("/profile/:uid", requireLoggedIn, async (req, res, next) => {
    const { uid } = req.params;
    const userId = parseInt(uid, 10);
    if (isNaN(userId)) {
      return next();
    }

    const user = await db.get(SQL`
      SELECT
        u.*,
        ap.author_posts AS post_count
      FROM users u
        INNER JOIN (
          SELECT author_id, COUNT(author_id) AS author_posts
          FROM thread_replies
          GROUP BY author_id
        ) ap
          ON ap.author_id = u.id
      WHERE u.id = ${userId}
    `);

    if (!user) {
      return next();
    }

    res.render("profile", { user });
  });

  app.post("/profile/:uid/update", requireLoggedIn, async (req, res, next) => {
    const { uid } = req.params;
    const userId = parseInt(uid, 10);
    if (isNaN(userId)) {
      return next();
    }

    const user = await db.get(SQL`
        SELECT * FROM users
        WHERE id = ${userId}
      `);

    if (!user) {
      return next();
    }

    const { username, password } = req.body;
    await db.run(SQL`
      UPDATE users
      SET
        username = ${username},
        password = ${password}
      WHERE id = ${userId}
    `);

    req.flash("success", "Your profile has been updated!");
    res.redirect(`/profile/${userId}`);
  });

  app.get("/login", (req, res) => {
    if (req.user) {
      return res.redirect("/");
    }
    res.render("login");
  });

  app.post(
    "/login",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true,
    })
  );

  app.post("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  app.get("/register", async (req, res) => {
    if (req.user) {
      return res.redirect("/");
    }
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

  app.get("/topics/new", requireLoggedIn, async (req, res) => {
    res.render("threads/new");
  });

  app.post("/topics/new", requireLoggedIn, async (req, res) => {
    const { title, post } = req.body;

    if (!title) {
      req.flash("error", "Title is required!");
      return res.redirect("/topics/new");
    }

    if (!post) {
      req.flash("error", "Post content is required!");
      return res.redirect("/topics/new");
    }

    const postDate = new Date();

    const { lastID: threadId } = await db.run(SQL`
      INSERT INTO threads (author_id, create_date, title) VALUES
        (
          ${req.user.id},
          ${postDate},
          ${title}
        )
    `);

    await db.run(SQL`
      INSERT INTO thread_replies (thread_id, author_id, reply_date, content) VALUES
        (
          ${threadId},
          ${req.user.id},
          ${postDate},
          ${post}
        )
    `);

    req.flash("success", "Topic created!");
    res.redirect(`/topics/${threadId}`);
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

    res.render("threads/index", { thread, posts });
  });

  app.post(
    "/topics/:topic_id/reply",
    requireLoggedIn,
    async (req, res, next) => {
      const { topic_id } = req.params;
      const threadId = parseInt(topic_id, 10);

      if (isNaN(threadId)) {
        return next();
      }

      const thread = await db.get(
        SQL`SELECT * FROM threads WHERE id = ${threadId}`
      );
      if (!thread) {
        return next();
      }

      const { reply } = req.body;
      if (!reply) {
        req.flash("error", "Please enter your message!");
        return res.redirect(`/topics/${threadId}`);
      }

      await db.run(SQL`
        INSERT INTO thread_replies (thread_id, author_id, reply_date, content) VALUES
          (
            ${threadId},
            ${req.user.id},
            ${new Date()},
            ${reply}
          )
      `);

      req.flash("success", "Reply posted!");
      res.redirect(`/topics/${threadId}`);
    }
  );

  app.use("*", (req, res) => {
    res.status(404).render("404");
  });

  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).render("500", { error });
  });
};

module.exports = attachApp;
