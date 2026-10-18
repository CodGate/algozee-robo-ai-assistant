import {env} from 'cloudflare:workers';
import {getCustomer} from './customer-auth';
export async function isAdmin(){const user=await getCustomer();return user?.role==='admin';}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');return !origin||origin===new URL(req.url).origin;}
