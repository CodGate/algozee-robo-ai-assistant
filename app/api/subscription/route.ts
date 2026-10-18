import {getCustomer,subscription} from '../../../lib/customer-auth';
export async function GET(){const u=await getCustomer();if(!u)return Response.json({error:'Please sign in.'},{status:401});const s=await subscription(u.userId);return Response.json({subscription:s||null,administrator:u.role==='admin',now:Date.now()})}
