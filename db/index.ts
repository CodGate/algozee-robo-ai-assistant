import { d1Database } from '../lib/d1-http';
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  // Remote Cloudflare D1 over the HTTP API, invoked by Netlify server functions.
  return drizzle(d1Database as any, { schema });
}
