CREATE TABLE IF NOT EXISTS robo_assistant_actions (
 id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL,
 channel TEXT NOT NULL,
 contact_id TEXT NOT NULL,
 body TEXT NOT NULL,
 subject TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'pending',
 created INTEGER NOT NULL,
 expires INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS robo_assistant_actions_user ON robo_assistant_actions(user_id, status, expires);
CREATE TABLE IF NOT EXISTS robo_tasks (
 id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL,
 title TEXT NOT NULL,
 due_at TEXT,
 status TEXT NOT NULL DEFAULT 'open',
 created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS robo_tasks_user ON robo_tasks(user_id,status,due_at);
