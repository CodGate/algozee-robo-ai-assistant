import Dashboard from './dashboard';
import {isAdmin} from '../../lib/admin';

export const dynamic='force-dynamic';
export default async function Admin(){if(!await isAdmin())return <div style={{padding:60,fontFamily:'sans-serif'}}><h1>AlgoZee · Private workspace</h1><p>Only the configured administrator can access customer records.</p><a href="/" target="_top">Sign in as administrator</a><p><a href="/">Return to customer demo</a></p></div>;return <><a href="/admin/subscriptions" style={{display:'block',padding:16}}>Customer accounts & manual subscriptions →</a><Dashboard/></>}
