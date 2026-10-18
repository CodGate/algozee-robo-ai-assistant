import {env} from 'cloudflare:workers';
import {cookies} from 'next/headers';
export type Customer={userId:string;email:string;fullName:string;role:string};
export const database=()=> (env as any).DB as D1Database;
const hex=(v:ArrayBuffer)=>Array.from(new Uint8Array(v),b=>b.toString(16).padStart(2,'0')).join('');
export async function digest(s:string){return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))}
export async function hashPassword(password:string,salt=hex(crypto.getRandomValues(new Uint8Array(16)).buffer)){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);return salt+':'+hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:new TextEncoder().encode(salt),iterations:100000},key,256))}
export async function verifyPassword(password:string,stored:string){if(!/^[a-f0-9]{32}:[a-f0-9]{64}$/.test(stored))return false;const computed=await hashPassword(password,stored.split(':')[0]);let diff=0;for(let i=0;i<stored.length;i++)diff|=stored.charCodeAt(i)^computed.charCodeAt(i);return diff===0}
export async function getCustomer():Promise<Customer|null>{try{const token=(await cookies()).get('robo_session')?.value;if(!token)return null;return await database().prepare('SELECT u.id AS userId,u.email,u.name AS fullName,u.role FROM robo_sessions s JOIN robo_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires>? AND u.disabled=0').bind(await digest(token),Date.now()).first<Customer>()}catch{return null}}
export async function subscription(userId:string){return database().prepare('SELECT plan,expires,message_limit,message_count,active FROM robo_subscriptions WHERE user_id=?').bind(userId).first<any>()}
export async function reserveMessage(user:Customer){if(user.role==='admin')return true;const r=await database().prepare('UPDATE robo_subscriptions SET message_count=message_count+1 WHERE user_id=? AND active=1 AND expires>? AND message_count<message_limit').bind(user.userId,Date.now()).run();return Boolean(r.meta.changes)}
export async function refundMessage(user:Customer){if(user.role!=='admin')await database().prepare('UPDATE robo_subscriptions SET message_count=MAX(0,message_count-1) WHERE user_id=?').bind(user.userId).run()}
