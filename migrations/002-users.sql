--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS users_username ON users(username);


--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP INDEX users_username;
DROP TABLE users;