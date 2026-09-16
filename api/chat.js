import { getChatReply, validateMessages } from './ai.js'

// Bounded, per-process burst protection. Production platforms may add edge limits.
const clients=new Map()
export default async function handler(request,response) {
  response.setHeader('Cache-Control','no-store')
  if(request.method!=='POST'){response.setHeader('Allow','POST');return response.status(405).json({error:'Method not allowed.'})}
  const messages=validateMessages(request.body?.messages)
  if(!messages)return response.status(400).json({error:'Send 1–12 valid chat messages, up to 1,500 characters each, ending with a user message.'})
  const key=request.ip || request.socket?.remoteAddress || 'serverless'
  const now=Date.now(), current=clients.get(key)
  const count=current && now-current.start<60_000 ? current : {start:now,total:0}
  if(count.total>=20){response.setHeader('Retry-After','60');return response.status(429).json({error:'Please wait a minute before sending more messages.'})}
  if(clients.size>2000)for(const [k,v] of clients)if(now-v.start>=60_000)clients.delete(k)
  count.total++;clients.set(key,count)
  return response.status(200).json(await getChatReply(messages,request.body?.currentPage))
}
