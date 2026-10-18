import {isAdmin,sameOrigin} from '../../../../lib/admin';
import {dispatchOrder} from '../../../../lib/automation';
import {getDb} from '../../../../db';
import {orders} from '../../../../db/schema';
import {eq} from 'drizzle-orm';
export async function POST(req:Request){if(!await isAdmin())return Response.json({error:'Unauthorized'},{status:403});if(!sameOrigin(req))return Response.json({error:'Invalid origin'},{status:403});const b:any=await req.json();const [o]=await getDb().select().from(orders).where(eq(orders.id,String(b.id)));if(!o)return Response.json({error:'Not found'},{status:404});if(o.automation==='acknowledged')return Response.json({automation:'acknowledged'});return Response.json({automation:await dispatchOrder(o)});}
