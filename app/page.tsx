import {getCustomer} from '../lib/customer-auth';
import Workspace from '../components/zevo/workspace';
import Login from '../components/zevo/login';
export const dynamic='force-dynamic';
export default async function Page(){const user=await getCustomer();return user?<Workspace displayName={user.fullName} email={user.email} signOut="/api/auth/logout"/>:<Login/>}
