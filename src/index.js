const path = require("path");
const express = require("express");
const exhbs = require("express-handlebars");

const app = express();
app.set("views", path.join(__dirname, "./views"));
app.engine("handlebars", exhbs());
app.set("view engine", "handlebars");

app.use("/static", express.static(path.join(__dirname, "../public")));

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    res.locals = { debug: true };
    next();
  });
}

app.get("/", (req, res) => {
  res.render("index");
});

app.use("*", (req, res) => {
  res.status(404).render("404");
});

app.use((error, req, res, next) => {
  res.status(500).render("500", { error });
});

const { APP_PORT, APP_HOST } = process.env;
const PORT = APP_PORT || 3000;
const HOST = APP_HOST || "127.0.0.1";

app.listen(PORT, HOST, () => {
  console.log(`Web server listening on http://${HOST}:${PORT}/`);
});
