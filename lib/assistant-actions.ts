import {database,type Customer} from './customer-auth';
import {POST as sendCommunication} from '../app/api/communications/route';

type FnCall={name:string;args:Record<string,unknown>};
const isEmail=(x:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);
const str=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max):'';
export const roboTools=[{functionDeclarations:[
 {name:'search_contacts',description:'Search private saved contacts by name, without sending messages.',parameters:{type:'OBJECT',properties:{query:{type:'STRING',description:'Contact name to search'}},required:['query']}},
 {name:'prepare_message',description:'Prepare a WhatsApp or email message to an existing contact; NEVER send without explicit subsequent confirmation.',parameters:{type:'OBJECT',properties:{contact_id:{type:'STRING'},channel:{type:'STRING',enum:['email','whatsapp']},message:{type:'STRING'},subject:{type:'STRING'}},required:['contact_id','channel','message']}},
 {name:'create_task',description:'Save a personal task or reminder. due_at must be an ISO8601 date-time with timezone; ask for clarification when date/time is unclear. Tasks are saved but no automatic notification is sent.',parameters:{type:'OBJECT',properties:{title:{type:'STRING'},due_at:{type:'STRING'}},required:['title']}},
 {name:'list_tasks',description:'List private saved tasks/reminders; no external calendar integration.',parameters:{type:'OBJECT',properties:{status:{type:'STRING',enum:['open','done','all']}}}},
 {name:'complete_task',description:'Mark an existing user task complete.',parameters:{type:'OBJECT',properties:{task_id:{type:'STRING'}}},required:['task_id']}
]}];
export async function executeRoboTool(user:Customer,call:FnCall){const a=call.args||{};const db=database();try{
 if(call.name==='search_contacts'){
  const query=str(a.query,100);if(!query)return {error:'Provide a contact name.'};
  const rows=await db.prepare('SELECT id,name,phone,email FROM robo_contacts WHERE user_id=? AND lower(name) LIKE ? ORDER BY name LIMIT 15').bind(user.userId,'%'+query.toLowerCase().replace(/[%_]/g,'')+'%').all();return {contacts:rows.results};
 }
 if(call.name==='prepare_message'){
  const id=str(a.contact_id,80),channel=str(a.channel,16),body=str(a.message,4000),subject=str(a.subject,160);
  if(!['email','whatsapp'].includes(channel)||!body||body.length>4000)return {error:'Invalid message.'};
  const contact=await db.prepare('SELECT id,name,phone,email FROM robo_contacts WHERE id=? AND user_id=?').bind(id,user.userId).first<any>();if(!contact)return {error:'Contact not found. Search contacts first.'};
  if(channel==='email'&&!isEmail(contact.email||''))return {error:'Contact has no valid email.'};
  if(channel==='whatsapp'&&!contact.phone)return {error:'Contact has no phone.'};
  const actionId=crypto.randomUUID();await db.prepare('INSERT INTO robo_assistant_actions(id,user_id,channel,contact_id,body,subject,created,expires) VALUES(?,?,?,?,?,?,?,?)').bind(actionId,user.userId,channel,id,body,subject,Date.now(),Date.now()+15*60*1000).run();
  return {status:'pending_confirmation',recipient:contact.name,destination:channel==='email'?contact.email:contact.phone,channel,message:body,subject,action_id:actionId,instruction:`Show recipient and complete message. Ask user to reply exactly CONFIRM SEND ${actionId} within 15 minutes; no message has been sent. For WhatsApp, sending additionally requires an eligible recent customer service window.`};
 }
 if(call.name==='create_task'){
  const title=str(a.title,220),due=str(a.due_at,64);if(!title)return {error:'Task title required.'};
  if(due&&(!/\d{4}-\d\d-\d\dT/.test(due)||!Number.isFinite(Date.parse(due))||!/Z$|[+-]\d\d:\d\d$/.test(due)))return {error:'Use ISO date with explicit timezone.'};
  const id=crypto.randomUUID();await db.prepare('INSERT INTO robo_tasks(id,user_id,title,due_at,created) VALUES(?,?,?,?,?)').bind(id,user.userId,title,due||null,Date.now()).run();return {saved:true,id,title,due_at:due||null,notice:'Task saved. Automatic notifications are not configured.'};
 }
 if(call.name==='list_tasks'){
  const status=str(a.status,10)||'open';if(!['open','done','all'].includes(status))return {error:'Invalid status.'};
  const query=status==='all'?'SELECT id,title,due_at,status FROM robo_tasks WHERE user_id=? ORDER BY due_at LIMIT 50':'SELECT id,title,due_at,status FROM robo_tasks WHERE user_id=? AND status=? ORDER BY due_at LIMIT 50';
  return {tasks:(await db.prepare(query).bind(...(status==='all'?[user.userId]:[user.userId,status])).all()).results};
 }
 if(call.name==='complete_task'){
  const result=await db.prepare("UPDATE robo_tasks SET status='done' WHERE id=? AND user_id=? AND status='open'").bind(str(a.task_id,80),user.userId).run();return {updated:Boolean(result.meta.changes)};
 }
 return {error:'Unsupported function'};
 }catch{return {error:'Action storage is unavailable. Apply migration 0006 and check D1 configuration.'}}}
export async function confirmRoboAction(user:Customer,code:string,original:Request,windowConfirmed:boolean){const db=database();const row=await db.prepare('SELECT * FROM robo_assistant_actions WHERE id=? AND user_id=?').bind(code,user.userId).first<any>();if(!row)return {reply:'No matching pending message. Prepare a new draft.'};if(row.status!=='pending')return {reply:'This request has already been processed. No duplicate message was sent.'};if(row.expires<Date.now())return {reply:'This message approval expired. Prepare a new draft.'};
 if(row.channel==='whatsapp'&&!windowConfirmed)return {reply:'WhatsApp requires an active 24-hour customer service window. If the contact messaged your business number within the last 24 hours and expects a reply, type CONFIRM WINDOW '+code+'. Otherwise use an approved WhatsApp template or send using the Contacts panel.'};
 const marked=await db.prepare("UPDATE robo_assistant_actions SET status='processing' WHERE id=? AND user_id=? AND status='pending'").bind(code,user.userId).run();if(!marked.meta.changes)return {reply:'This message is already being processed.'};
 const headers=new Headers(original.headers);headers.set('content-type','application/json');const request=new Request(original.url,{method:'POST',headers,body:JSON.stringify({contactId:row.contact_id,channel:row.channel,text:row.body,subject:row.subject,requestId:row.id,confirmed:true,windowConfirmed})});
 try{const response=await sendCommunication(request);const result=await response.json() as any;await db.prepare('UPDATE robo_assistant_actions SET status=? WHERE id=? AND user_id=?').bind(response.ok&&result.status==='accepted'?'submitted':'failed',code,user.userId).run();return {reply:response.ok?(result.notice||'Provider request completed; inspect status for acceptance.'):(result.error||'Unable to send. Verify provider setup.')};}
 catch{await db.prepare("UPDATE robo_assistant_actions SET status='unknown' WHERE id=? AND user_id=?").bind(code,user.userId).run();return {reply:'Provider outcome uncertain. Check its logs before trying again.'}}
}
