--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS threads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL REFERENCES users(id),
    create_date DATETIME NOT NULL,
    title TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS threads_author_id ON threads(author_id);

CREATE TABLE IF NOT EXISTS thread_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id INTEGER NOT NULL REFERENCES threads(id),
    author_id INTEGER NOT NULL REFERENCES users(id),
    reply_date DATETIME NOT NULL,
    content TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS thread_replies_thread_id ON thread_replies(thread_id);
CREATE INDEX IF NOT EXISTS thread_replies_author_id ON thread_replies(author_id);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP INDEX threads_author_id;
DROP TABLE threads;

DROP INDEX thread_replies_thread_id;
DROP INDEX thread_replies;