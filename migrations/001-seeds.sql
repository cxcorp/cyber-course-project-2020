--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS seeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS seeds_filename ON seeds(filename);


--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP INDEX seeds_filename;
DROP TABLE seeds;