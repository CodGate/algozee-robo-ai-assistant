CREATE TABLE IF NOT EXISTS robo_contacts (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,name TEXT NOT NULL,phone TEXT NOT NULL,email TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS robo_contacts_owner ON robo_contacts(user_id);
CREATE TABLE IF NOT EXISTS robo_outbox (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,channel TEXT NOT NULL,status TEXT NOT NULL,created INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS robo_outbox_owner_date ON robo_outbox(user_id,created);
