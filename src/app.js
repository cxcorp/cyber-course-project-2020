const express = require("express");
const path = require("path");
const SQL = require("sql-template-strings");

const attachApp = (app, db) => {
  app.use("/static", express.static(path.join(__dirname, "../public")));

  if (process.env.NODE_ENV !== "production") {
    app.use((req, res, next) => {
      res.locals = { debug: true };
      next();
    });
  }

  app.get("/", async (req, res) => {
    const threads = await db.all("SELECT * FROM threads");
    res.render("index", { threads });
  });

  app.use("*", (req, res) => {
    res.status(404).render("404");
  });

  app.use((error, req, res, next) => {
    res.status(500).render("500", { error });
  });
};

module.exports = attachApp;
