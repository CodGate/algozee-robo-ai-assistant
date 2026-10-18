/**
 * Cloudflare D1 REST API adapter for Netlify server-side routes.
 * Preserves the D1 prepare/bind/first/all/run/batch subset used by this project
 * and Drizzle's D1 driver. Uses Cloudflare's authenticated HTTP SQL endpoint.
 * Credentials stay on the server in Netlify environment variables.
 * Requires an existing, migrated Cloudflare D1 database.
 * The HTTP API does not provide cross-request SQL transactions.
 */
import 'server-only';

type Args = Array<string | number | boolean | null | Uint8Array>;
type Statement = {sql:string; params: Args};
function config() {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const db = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const token = process.env.CLOUDFLARE_D1_API_TOKEN;
  if (!account || !db || !token) throw Error('D1 remote database is not configured: add CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID and CLOUDFLARE_D1_API_TOKEN in Netlify environment variables.');
  return {account,db,token};
}
function convertParam(v:Args[number]):unknown {
  if (v instanceof Uint8Array) return Array.from(v);
  if (typeof v === 'boolean') return v ? 1 : 0;
  return v;
}
async function query(statements:Statement[]) {
  const {account, db, token}=config();
  const url=`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/d1/database/${encodeURIComponent(db)}/query`;
  const results=[];
  // Run statements individually: API batch result semantics differ from D1 native batch.
  for (const s of statements) {
    const response=await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({sql:s.sql,params:s.params.map(convertParam)}),cache:'no-store',signal:AbortSignal.timeout(30000)});
    const body=await response.json() as any;
    if(!response.ok || body.success!==true || !Array.isArray(body.result) || !body.result[0]?.success){
      const detail=JSON.stringify(body.errors || body.result?.[0]?.error || `HTTP ${response.status}`);
      throw Error(`D1 query failed: ${detail}`);
    }
    results.push(body.result[0]);
  }
  return results;
}
class Prepared {
  constructor(public sql:string,public params:Args=[]){}
  bind(...params:Args){return new Prepared(this.sql,params);}
  async first<T=Record<string,unknown>>(column?:string):Promise<T|null>{const r=await this.all();const item=r.results[0];return column?(item?.[column]??null) as T:(item??null) as T;}
  async all<T=Record<string,unknown>>():Promise<{results:T[];success:boolean;meta:any}>{const [r]=await query([{sql:this.sql,params:this.params}]);return {results:r.results??[],success:r.success,meta:r.meta??{}};}
  async run():Promise<{results:any[];success:boolean;meta:any}>{return this.all();}
  async raw<T=unknown[]>(options?:{columnNames?:boolean}):Promise<T[]>{const r=await this.all<Record<string,unknown>>();if(options?.columnNames){const keys=Object.keys(r.results[0]??{});return [keys,...r.results.map(Object.values)] as T[];}return r.results.map(Object.values) as T[];}
}
export const d1Database = {
  prepare(sql:string){return new Prepared(sql);},
  async batch(statements:Prepared[]){const responses=await query(statements.map(s=>({sql:s.sql,params:s.params})));return responses.map(r=>({results:r.results??[],success:r.success,meta:r.meta??{}}));},
  async exec(sql:string){const statements=sql.split(';').map(s=>s.trim()).filter(Boolean);await query(statements.map(sql=>({sql,params:[]})));return {count:statements.length,duration:0};}
};
