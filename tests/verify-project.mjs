import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import ts from '/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url));
const files=['lib/agent.ts','lib/assistant-actions.ts','app/api/chat/route.ts'];
for(const f of files){const transpiled=ts.transpileModule(read(f).toString(),{fileName:f,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}});assert.deepEqual(transpiled.diagnostics,[],`Syntax issue: ${f}`)}
const workspace=read('components/zevo/workspace.tsx');const contacts=read('components/zevo/contacts.tsx');
assert.ok(workspace.length>10000);assert.ok(contacts.length>1000);
const migration=read('drizzle/0006_robo_assistant_actions.sql').toString();assert.match(migration,/CREATE TABLE IF NOT EXISTS robo_tasks/);
assert.match(read('lib/assistant-actions.ts').toString(),/CONFIRM SEND/);
assert.match(read('lib/assistant-actions.ts').toString(),/status='processing'/);
console.log('PASS: action-module TypeScript syntax, pending-confirmation workflow and migration.');
console.log('UI sha256 workspace:',crypto.createHash('sha256').update(workspace).digest('hex'));
console.log('UI sha256 contacts:',crypto.createHash('sha256').update(contacts).digest('hex'));
