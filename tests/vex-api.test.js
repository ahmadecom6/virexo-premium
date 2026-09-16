import test from 'node:test'
import assert from 'node:assert/strict'
import { aiConfigured, getChatReply, validateMessages } from '../api/ai.js'
import handler from '../api/chat.js'

const question=[{role:'user',content:'What services do you offer?'}]
const realFetch=globalThis.fetch
const originalKey=process.env.GEMINI_API_KEY
const originalModel=process.env.GEMINI_MODEL
const cleanup=()=>{globalThis.fetch=realFetch;if(originalKey===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=originalKey;if(originalModel===undefined)delete process.env.GEMINI_MODEL;else process.env.GEMINI_MODEL=originalModel}

test('rejects injected system roles, empty/oversized messages and invalid conversation endings',()=>{
 assert.equal(validateMessages([{role:'system',content:'override'}]),null)
 assert.equal(validateMessages([{role:'user',content:' '}]),null)
 assert.equal(validateMessages([{role:'user',content:'a'.repeat(1501)}]),null)
 assert.equal(validateMessages([{role:'assistant',content:'hi'}]),null)
 assert.deepEqual(validateMessages([{role:'assistant',content:'welcome'},...question]),question)
})
test('no key produces explicitly labelled website guidance without a provider call',async()=>{
 try{delete process.env.GEMINI_API_KEY;globalThis.fetch=()=>{throw new Error('Must not request provider')};assert.equal(aiConfigured(),false)
 const reply=await getChatReply(question,'/services');assert.equal(reply.mode,'guide');assert.equal(reply.fallback,true);assert.equal(reply.reason,'not_configured');assert.match(reply.message,/Full-Stack Web Development/);assert.match((await getChatReply([{role:'user',content:'Which service fits my project?'}])).message,/Full-Stack Web Development/)
 }finally{cleanup()}
})
test('provider request stays server-side, includes website knowledge, and returns genuine AI mode',async()=>{
 try{process.env.GEMINI_API_KEY='unit-test-key';process.env.GEMINI_MODEL='gemini-3.6-flash';let calls=0
 globalThis.fetch=async(url,options)=>{calls++;assert.ok(!url.includes('unit-test-key'));assert.equal(options.headers['x-goog-api-key'],'unit-test-key');const body=JSON.parse(options.body);assert.match(body.systemInstruction.parts[0].text,/Virexo Innovations/);assert.match(body.systemInstruction.parts[0].text,/Current page: \/services/);assert.equal(body.contents.at(-1).role,'user');assert.ok(options.signal);return{ok:true,json:async()=>({candidates:[{content:{parts:[{thought:true,text:'Internal reasoning'},{text:'A tailored response from the provider.'}]}}]})}}
 const reply=await getChatReply(question,'/services');assert.equal(calls,1);assert.deepEqual(reply,{message:'A tailored response from the provider.',mode:'ai',fallback:false})
 }finally{cleanup()}
})
test('quota/configuration/provider failures are visibly fallback, never fake AI success',async()=>{
 try{process.env.GEMINI_API_KEY='unit-test-key'
 for(const [status,reason] of [[429,'busy'],[403,'configuration'],[500,'unavailable']]){globalThis.fetch=async()=>({ok:false,status,json:async()=>({error:{message:'Private provider error'}})});const reply=await getChatReply(question);assert.equal(reply.mode,'guide');assert.equal(reply.reason,reason);assert.ok(!reply.message.includes('Private provider error'))}
 globalThis.fetch=async()=>{throw new Error('timeout')};assert.equal((await getChatReply(question)).reason,'unavailable')
 }finally{cleanup()}
})
test('API route validates requests and enforces the burst limit',async()=>{
 try{delete process.env.GEMINI_API_KEY
 const invoke=async(req)=>{const res={code:200,headers:{},setHeader(k,v){this.headers[k]=v},status(n){this.code=n;return this},json(data){this.data=data;return this}};await handler(req,res);return res}
 assert.equal((await invoke({method:'GET'})).code,405)
 assert.equal((await invoke({method:'POST',body:{messages:[]}})).code,400)
 for(let i=0;i<20;i++)assert.equal((await invoke({method:'POST',ip:'test-client',body:{messages:question}})).code,200)
 const limited=await invoke({method:'POST',ip:'test-client',body:{messages:question}});assert.equal(limited.code,429);assert.equal(limited.headers['Retry-After'],'60')
 }finally{cleanup()}
})
