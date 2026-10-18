import {env} from './runtime-env';
import {getCustomer} from './customer-auth';
export async function isAdmin(){const user=await getCustomer();return user?.role==='admin';}
/** Require same-origin mutations, accounting for the public URL behind Netlify's proxy. */
export function sameOrigin(req:Request){
  const origin=req.headers.get('origin');
  if(!origin)return true; // Non-browser clients may omit Origin; session/authorization still required.
  let submitted:URL;
  try{submitted=new URL(origin);if(submitted.origin!==origin)return false;}catch{return false;}
  const allowed=new Set<string>();
  const add=(value:unknown)=>{if(typeof value!=='string'||!value)return;try{const url=new URL(value);if(url.protocol==='https:'||(url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)))allowed.add(url.origin);}catch{}};
  add(req.url);
  add(env.SITE_URL);
  add(env.URL); // Netlify's public production site URL
  add(env.DEPLOY_PRIME_URL); // Netlify deploy preview / branch URL
  add(env.DEPLOY_URL);
  return allowed.has(submitted.origin);
}
