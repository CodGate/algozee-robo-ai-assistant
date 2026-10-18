import {isAdmin} from '../../../lib/admin';
import Customers from './customers';
export const dynamic='force-dynamic';
export default async function Page(){return await isAdmin()?<Customers/>:<div style={{padding:40}}>Administrator access required. <a href="/">Sign in</a></div>}
