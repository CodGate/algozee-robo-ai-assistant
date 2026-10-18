import {getCustomer} from '../lib/customer-auth';
import Workspace from '../components/zevo/workspace';

// Show the approved Robo workspace immediately. Protected API routes still
// enforce customer sessions and subscription permissions on the server.
export const dynamic = 'force-dynamic';
export default async function Page() {
  const user = await getCustomer();
  return <Workspace
    displayName={user?.fullName || 'Guest'}
    email={user?.email || ''}
    signOut="/api/auth/logout"
  />;
}
