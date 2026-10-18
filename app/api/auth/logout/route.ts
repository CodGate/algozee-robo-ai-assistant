import {cookies} from 'next/headers';
import {database,digest} from '../../../../lib/customer-auth';
import {sameOrigin} from '../../../../lib/admin';
export async function POST(req:Request){if(!sameOrigin(req))return Response.json({error:'Invalid origin'},{status:403});const token=(await cookies()).get('robo_session')?.value;if(token)await database().prepare('DELETE FROM robo_sessions WHERE token_hash=?').bind(await digest(token)).run();return Response.json({ok:true},{headers:{'Set-Cookie':'robo_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'}})}
