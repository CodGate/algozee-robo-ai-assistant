import {env} from './runtime-env';
import {getDb} from '../db';
import {integrationSettings} from '../db/schema';
import {eq} from 'drizzle-orm';
export type Connections={GEMINI_API_KEY?:string;GEMINI_MODEL?:string;N8N_WEBHOOK_URL?:string;N8N_WEBHOOK_SECRET?:string};
function bytes(s:string){return Uint8Array.from(atob(s),c=>c.charCodeAt(0))}
function base64(a:Uint8Array){return btoa(String.fromCharCode(...a))}
async function key(){const secret=(env as any).CONFIG_ENCRYPTION_KEY;if(!secret)throw Error('Secure configuration unavailable');return crypto.subtle.importKey('raw',bytes(secret),{name:'AES-GCM'},false,['encrypt','decrypt'])}
export async function readConnections():Promise<Connections>{const e=env as any;const fallback={GEMINI_API_KEY:e.GEMINI_API_KEY,GEMINI_MODEL:e.GEMINI_MODEL||'gemini-2.5-flash',N8N_WEBHOOK_URL:e.N8N_WEBHOOK_URL,N8N_WEBHOOK_SECRET:e.N8N_WEBHOOK_SECRET};const [record]=await getDb().select().from(integrationSettings).where(eq(integrationSettings.id,'connections'));if(!record)return fallback;const [iv,cipher]=record.ciphertext.split('.');const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(iv)},await key(),bytes(cipher));return {...fallback,...JSON.parse(new TextDecoder().decode(plain))};}
export async function saveConnections(c:Connections){const iv=crypto.getRandomValues(new Uint8Array(12));const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(),new TextEncoder().encode(JSON.stringify(c)));const ciphertext=base64(iv)+'.'+base64(new Uint8Array(cipher));await getDb().insert(integrationSettings).values({id:'connections',ciphertext,updated:new Date().toISOString()}).onConflictDoUpdate({target:integrationSettings.id,set:{ciphertext,updated:new Date().toISOString()}});}
