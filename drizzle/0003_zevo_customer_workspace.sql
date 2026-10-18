CREATE TABLE IF NOT EXISTS business_profiles (user_id TEXT PRIMARY KEY NOT NULL,name TEXT NOT NULL DEFAULT '',industry TEXT NOT NULL DEFAULT '',website TEXT NOT NULL DEFAULT '',knowledge TEXT NOT NULL DEFAULT '',updated TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS customer_conversations (id TEXT PRIMARY KEY NOT NULL,user_id TEXT NOT NULL,title TEXT NOT NULL,messages TEXT NOT NULL,updated TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS customer_conversations_user_updated ON customer_conversations(user_id,updated);
