import {webcrypto} from 'node:crypto';
import readline from 'node:readline';
if(!process.stdin.isTTY){console.error('Run in an interactive terminal.');process.exit(1)}
process.stdout.write('Administrator password (hidden, minimum 12 characters): ');
readline.emitKeypressEvents(process.stdin);process.stdin.setRawMode(true);let value='';
process.stdin.on('keypress',async(str,key)=>{if(key?.ctrl&&key.name==='c')process.exit(1);if(key?.name==='backspace'){value=value.slice(0,-1);return}if(key?.name!=='return'){if(str&&!key?.ctrl)value+=str;return}process.stdin.setRawMode(false);process.stdin.pause();if(value.length<12||value.length>256){console.error('\nUse 12–256 characters.');process.exit(1)}const salt=Buffer.from(webcrypto.getRandomValues(new Uint8Array(16))).toString('hex');const k=await webcrypto.subtle.importKey('raw',new TextEncoder().encode(value),'PBKDF2',false,['deriveBits']);const bits=await webcrypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:new TextEncoder().encode(salt),iterations:100000},k,256);process.stdout.write('\nROBO_ADMIN_PASSWORD_HASH: '+salt+':'+Buffer.from(bits).toString('hex')+'\n');process.exit(0)});
