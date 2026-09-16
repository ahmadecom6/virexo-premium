import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowUpRight, FiSend, FiX, FiRefreshCw, FiVolume2, FiVolumeX, FiSquare, FiMic, FiSliders } from 'react-icons/fi'
import { VexContext } from './vex-context'
import { services } from '../data/services'
import { projects } from '../data/projects'

export function VexFace({ mood='idle' }) {
  return <svg className={`vx-vex-face is-${mood}`} viewBox="0 0 80 80" aria-hidden="true"><path d="M40 13V5" stroke="#80e5e9" strokeWidth="3"/><circle cx="40" cy="5" r="3" fill="#8df3ef"/><rect x="7" y="28" width="8" height="20" rx="4" fill="#56cfdc"/><rect x="65" y="28" width="8" height="20" rx="4" fill="#56cfdc"/><rect x="13" y="15" width="54" height="47" rx="17" fill="#b6d0dd" stroke="#4c758b" strokeWidth="2"/><rect x="19" y="24" width="42" height="28" rx="10" fill="#0a1a28"/><g className="vx-vex-eyes" fill="#84f4ee"><rect x="26" y="33" width="9" height="6" rx="2"/><rect x="45" y="33" width="9" height="6" rx="2"/></g><path className="vx-vex-mouth" d="M33 44Q40 48 47 44" fill="none" stroke="#69e2e7" strokeWidth="2"/><path d="M29 66H51" stroke="#304f64" strokeWidth="6" strokeLinecap="round"/></svg>
}
const welcome = {role:'assistant',content:'Hi, I’m Vex, your Virexo guide. Tell me what you want to build, or explore our services and projects.'}
const actions=[['Services','/services'],['Projects','/projects'],['Contact','/contact'],['Careers','/#careers']]
const suggestions=['Which service fits my project?','Tell me about your projects','How do I get started?']
const localGuideReply = input => {
  const q=input.toLowerCase()
  const urdu=/\b(mujhe|mera|meri|chahiye|karna|batao|konsa|konsi|kitn|paisa|dikhao|kholo|banao)\b/.test(q)
  if(/price|cost|budget|rate|qeemat|kitn|paisa|estimate/.test(q))return urdu?'Exact cost scope par depend karti hai. Contact form mein Under $5k, $5k–$15k, $15k–$30k aur $30k+ planning ranges hain. Apna project type, features aur timeline bata dein, main sahi service suggest kar dunga.':'Exact cost depends on scope. The contact form uses Under $5k, $5k–$15k, $15k–$30k and $30k+ planning ranges. Tell me the project type, key features and timeline for a better recommendation.'
  if(/shop|store|e.?commerce|woocommerce/.test(q))return urdu?'Aap ke online store ke liye E-commerce Development best fit hai. Products, payments, delivery areas aur required launch date bata dein.':'E-commerce Development is the closest fit for an online store. Share the products, payment needs, delivery regions and target launch date.'
  if(/ui|ux|figma|redesign|design/.test(q))return urdu?'UI/UX and Product Design best fit hai. Bata dein naya product hai ya existing website ka redesign.':'UI/UX and Product Design is the closest fit. Tell me whether this is a new product or a redesign.'
  if(/automat|workflow|chatbot|ai agent|rag/.test(q))return urdu?'AI and Business Automation best fit hai. Jo manual process automate karna hai uske steps bata dein.':'AI and Business Automation is the closest fit. Describe the manual workflow you want to automate.'
  if(/api|integration|connect/.test(q))return urdu?'API Development and Integration best fit hai. Kin systems ko connect karna hai, unke naam bata dein.':'API Development and Integration is the closest fit. Tell me which systems need to connect.'
  if(/maintain|support|bug|update/.test(q))return urdu?'Website Maintenance best fit hai. Current website aur issue share karein.':'Website Maintenance is the closest fit. Share the current website and the issue you need fixed.'
  if(/career|resume|cv|job|intern/.test(q))return urdu?'Homepage ke “Work with Virexo” section se specialization select karke PDF, DOC ya DOCX CV upload karein.':'Use the “Work with Virexo” section on the homepage to select your specialization and upload a PDF, DOC, or DOCX resume up to 5 MB.'
  if(/contact|email|quote|start|shuru/.test(q))return urdu?'Shuru karne ke liye project, audience aur timeline ka short brief dein. Contact page khol sakte hain ya virexoinnovations@gmail.com par email karein.':'Start with what you want to build, who it is for, and your preferred timeline. Open Contact or email virexoinnovations@gmail.com.'
  if(/service|offer|build|website|kya/.test(q))return urdu?`Virexo ${services.map(service=>service.title).join(', ')} offer karta hai. Apna idea bata dein, main best fit suggest karunga.`:`Virexo offers ${services.map(service=>service.title).join(', ')}. Tell me about your project and I’ll point you to the closest fit.`
  if(/project|portfolio|work/.test(q))return `You can explore ${projects.map(project=>project.title).join(', ')}. Open Projects to view the details.`
  if(/login|password|sign in|account/.test(q))return 'Use the sign-in page to access your workspace. For a local preview, choose Executive Demo or Talent Lead Demo. Never share your password in chat.'
  return 'I can guide you through Virexo’s services, projects, careers and contact options using the information built into this website. What would you like to explore?'
}
const routeCommand = input => {
  const q=input.toLowerCase()
  const urdu=/\b(dikhao|kholo|chalo|mujhe)\b/.test(q)
  if(!/(open|show|go to|take me|dikhao|kholo|chalo)/.test(q))return null
  if(/service/.test(q))return ['/services',urdu?'Services khol raha hoon.':'Opening Services.']
  if(/project|portfolio/.test(q))return ['/projects',urdu?'Projects khol raha hoon.':'Opening Projects.']
  if(/contact|quote|enquiry/.test(q))return ['/contact',urdu?'Contact page khol raha hoon.':'Opening Contact.']
  if(/career|resume|cv|job/.test(q))return ['/#careers',urdu?'Careers section khol raha hoon.':'Opening the careers section.']
  if(/home|homepage/.test(q))return ['/',urdu?'Home page khol raha hoon.':'Opening Home.']
  if(/faq|question/.test(q))return ['/faq',urdu?'FAQs khol raha hoon.':'Opening FAQs.']
  return null
}

export default function VexProvider({children}) {
  const [open,setOpen]=useState(false),[messages,setMessages]=useState(()=>{try{const saved=JSON.parse(localStorage.getItem('virexo-vex-chat')||'[]');return Array.isArray(saved)&&saved.length?saved.slice(-30):[welcome]}catch{return [welcome]}}),[input,setInput]=useState('')
  const [loading,setLoading]=useState(false),[error,setError]=useState(''),[mode,setMode]=useState('guide'),[reason,setReason]=useState('local')
  const [voice,setVoice]=useState(()=>localStorage.getItem('virexo-vex-voice')==='true'),[speaking,setSpeaking]=useState(false)
  const [listening,setListening]=useState(false),[listeningStatus,setListeningStatus]=useState(''),[voiceSettings,setVoiceSettings]=useState(false),[voices,setVoices]=useState([])
  const [voiceName,setVoiceName]=useState(()=>localStorage.getItem('virexo-vex-voice-name')||''),[speechRate,setSpeechRate]=useState(()=>Number(localStorage.getItem('virexo-vex-rate'))||1)
  const request=useRef(null),recognition=useRef(null),voiceRef=useRef(voice),pending=useRef(false),opener=useRef(null),panel=useRef(null),inputRef=useRef(null),log=useRef(null)
  voiceRef.current=voice
  const openRef=useRef(open);openRef.current=open
  const navigate=useNavigate()
  const stopVoice=useCallback(()=>{window.speechSynthesis?.cancel();setSpeaking(false)},[])
  useEffect(()=>{
    setMode('guide');setReason('local')
    return()=>{request.current?.abort();window.speechSynthesis?.cancel()}
  },[])
  useEffect(()=>{localStorage.setItem('virexo-vex-chat',JSON.stringify(messages.slice(-30)))},[messages])
  useEffect(()=>{localStorage.setItem('virexo-vex-voice',String(voice));localStorage.setItem('virexo-vex-voice-name',voiceName);localStorage.setItem('virexo-vex-rate',String(speechRate))},[voice,voiceName,speechRate])
  useEffect(()=>{
    if(!('speechSynthesis' in window))return
    const load=()=>setVoices(window.speechSynthesis.getVoices())
    load();window.speechSynthesis.addEventListener?.('voiceschanged',load)
    return()=>window.speechSynthesis.removeEventListener?.('voiceschanged',load)
  },[])
  const openAssistant=useCallback(event=>{opener.current=event?.currentTarget || document.activeElement;setOpen(true)},[])
  const close=useCallback(()=>{setOpen(false);stopVoice()},[stopVoice])
  useEffect(()=>{
    if(!open){if(opener.current){const target=opener.current.isConnected&&opener.current!==document.body?opener.current:document.querySelector('.vx-vex-launcher');target?.focus()}return}
    const timer=setTimeout(()=>inputRef.current?.focus(),70)
    const overflow=document.body.style.overflow;document.body.style.overflow='hidden'
    const escape=e=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();close()}}
    document.addEventListener('keydown',escape)
    return()=>{clearTimeout(timer);document.body.style.overflow=overflow;document.removeEventListener('keydown',escape)}
  },[open,close])
  useEffect(()=>{if(log.current)log.current.scrollTop=log.current.scrollHeight},[messages,loading,open,error])
  const say=text=>{
    if(!voiceRef.current || !openRef.current || !('speechSynthesis' in window))return
    window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text)
    utterance.rate=speechRate;const selected=voices.find(item=>item.name===voiceName);if(selected)utterance.voice=selected
    utterance.onstart=()=>setSpeaking(true);utterance.onend=utterance.onerror=()=>setSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }
  const startListening=async(retried=false)=>{
    const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition
    if(!SpeechRecognition){setError('Voice input needs Chrome or Edge. This browser does not provide speech recognition.');return}
    if(listening&&!retried){recognition.current?.stop();setListeningStatus('Stopped');return}
    try{
      if(navigator.mediaDevices?.getUserMedia){const stream=await navigator.mediaDevices.getUserMedia({audio:true});stream.getTracks().forEach(track=>track.stop())}
    }catch(error){
      setListening(false);setListeningStatus('')
      setError(error?.name==='NotAllowedError'?'Microphone permission is blocked. Click the lock icon beside the website address, allow Microphone, then try again.':'No working microphone was found. Check the Windows input device and try again.')
      return
    }
    const instance=new SpeechRecognition();recognition.current=instance;instance.lang='en-US';instance.interimResults=true;instance.continuous=false;instance.maxAlternatives=1
    voiceRef.current=true;setVoice(true)
    let retryScheduled=false,commandSent=false
    instance.onstart=()=>{setListening(true);setListeningStatus('Listening — speak now');setError('')}
    instance.onspeechstart=()=>setListeningStatus('Hearing you…')
    instance.onresult=event=>{
      let transcript='',isFinal=false
      for(let index=event.resultIndex;index<event.results.length;index++){transcript+=event.results[index][0].transcript;isFinal=isFinal||event.results[index].isFinal}
      const clean=transcript.trim();if(clean)setInput(clean)
      if(isFinal&&clean&&!commandSent){commandSent=true;setListeningStatus('Command received');window.setTimeout(()=>send(clean),120)}
    }
    instance.onerror=event=>{
      if(event.error==='aborted')return
      if(event.error==='no-speech'&&!retried){retryScheduled=true;setListeningStatus('No speech detected — retrying…');window.setTimeout(()=>startListening(true),350);return}
      setListeningStatus('')
      const message={'not-allowed':'Microphone permission is blocked. Allow it from the lock icon beside the website address.','audio-capture':'Windows could not provide a microphone. Check Settings → Sound → Input.',network:'Browser speech recognition could not connect. Use Chrome or Edge with internet access, or type the command.','no-speech':'No voice was detected. Press the microphone and speak immediately after it turns red.'}[event.error]||`Voice recognition stopped (${event.error}). Please try again.`
      setError(message)
    }
    instance.onend=()=>{setListening(false);if(!retryScheduled&&!commandSent)setListeningStatus('')}
    try{instance.start()}catch{setListening(false);setListeningStatus('');setError('The microphone is already active. Wait a moment and try again.')}
  }
  const send=async(text=input)=>{
    const content=text.trim();if(!content||pending.current||content.length>1500)return
    stopVoice();setError('');setInput('');setOpen(true);inputRef.current?.focus()
    const next=[...messages,{role:'user',content}].slice(-30);setMessages(next);setLoading(true);pending.current=true
    const command=routeCommand(content)
    if(command){const [to,reply]=command;setMode('guide');setReason('local');setMessages([...next,{role:'assistant',content:reply,mode:'guide'}]);setLoading(false);pending.current=false;say(reply);navigate(to);return}
    const controller=new AbortController();request.current=controller
    try{
      await new Promise((resolve,reject)=>{const timer=window.setTimeout(resolve,320);controller.signal.addEventListener('abort',()=>{window.clearTimeout(timer);reject(new Error('stopped'))},{once:true})})
      const reply=localGuideReply(content)
      setMode('guide');setReason('local')
      setMessages(current=>[...current,{role:'assistant',content:reply,mode:'guide'}]);say(reply)
    }catch{
      if(controller.signal.aborted && controller.signal.reason==='reset')return
      if(controller.signal.aborted && controller.signal.reason==='user'){
        setError('The response was stopped. You can edit your message and try again.')
        setInput(content)
      }
    }finally{pending.current=false;setLoading(false);request.current=null}
  }
  const reset=()=>{request.current?.abort('reset');recognition.current?.abort();stopVoice();setMessages([welcome]);setError('');setInput('');setListening(false);setListeningStatus('');localStorage.removeItem('virexo-vex-chat')}
  const trap=e=>{
    if(e.key==='Escape'){e.preventDefault();close()}
    if(e.key!=='Tab')return
    const nodes=[...panel.current.querySelectorAll('button:not(:disabled),a[href],textarea:not(:disabled)')].filter(n=>n.getClientRects().length)
    const first=nodes[0],last=nodes.at(-1)
    if(e.shiftKey && document.activeElement===first){e.preventDefault();last?.focus()}
    else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first?.focus()}
  }
  const mood=loading?'thinking':speaking?'speaking':open?'active':'idle'
  return <VexContext.Provider value={{openAssistant,loading,speaking,mood}}>
    <div className="vx-app-content" inert={open?true:undefined}>{children}</div>
    {!open && <button className="vx-vex-launcher" type="button" onClick={openAssistant} aria-label="Open Vex AI assistant" aria-haspopup="dialog"><VexFace mood={mood}/><span><strong>Ask Vex</strong><small>Your project co-pilot</small></span><i/></button>}
    {open && <div className="vx-chat-overlay" onClick={e=>{if(e.target===e.currentTarget)close()}}>
      <section ref={panel} className="vx-chat-panel" role="dialog" aria-modal="true" aria-labelledby="vx-chat-title" onKeyDown={trap}>
        <header className="vx-chat-header"><VexFace mood={mood}/><div><h2 id="vx-chat-title">Meet Vex.</h2><p>{loading?'Thinking about your project…':speaking?'Speaking…':'A little guidance. A clear next step.'}</p></div><button type="button" onClick={close} aria-label="Close Vex assistant"><FiX/></button></header>
        <div className="vx-chat-toolbar"><span className={`vx-chat-mode is-${mode}`}><i/>{mode==='ai'?'AI assistant':'Website guide'}</span><div><button type="button" onClick={reset} aria-label="Start a new chat" disabled={loading}><FiRefreshCw/></button>{'speechSynthesis' in window&&<><button type="button" onClick={()=>setVoiceSettings(v=>!v)} aria-label="Voice settings" aria-expanded={voiceSettings}><FiSliders/></button><button type="button" onClick={()=>{stopVoice();setVoice(v=>!v)}} aria-label={voice?'Turn voice replies off':'Turn voice replies on'} aria-pressed={voice}>{voice?<FiVolume2/>:<FiVolumeX/>}</button></>}</div></div>
        {voiceSettings&&<div className="vx-voice-settings"><label>Reply voice<select value={voiceName} onChange={e=>setVoiceName(e.target.value)}><option value="">Browser default</option>{voices.map(item=><option value={item.name} key={`${item.name}-${item.lang}`}>{item.name} · {item.lang}</option>)}</select></label><label>Speed <span>{speechRate.toFixed(1)}×</span><input type="range" min="0.7" max="1.3" step="0.1" value={speechRate} onChange={e=>setSpeechRate(Number(e.target.value))}/></label></div>}
        <div ref={log} className="vx-chat-log" role="log" aria-live="polite" aria-relevant="additions text">
          {messages.map((m,i)=><article key={i} className={`vx-chat-message is-${m.role}`}><small>{m.role==='user'?'YOU':m.mode==='guide'?'VEX · WEBSITE INFORMATION':'VEX'}</small><p>{m.content}</p></article>)}
          {loading&&<div className="vx-chat-thinking" role="status"><i/><i/><i/><span>Vex is thinking</span></div>}
        </div>
        {mode==='guide' && <p className="vx-chat-notice">{reason&&!['not_configured','local'].includes(reason)?'AI is temporarily unavailable. These replies use our website information.':'Guided replies from our website information.'}</p>}
        {error&&<p className="vx-chat-error" role="alert">{error}</p>}
        {listeningStatus&&<p className="vx-listening-status" role="status"><i/>{listeningStatus}</p>}
        <div className="vx-chat-suggestions">{suggestions.map(s=><button type="button" key={s} disabled={loading} onClick={()=>send(s)}>{s}<FiArrowUpRight/></button>)}</div>
        <form className="vx-chat-form" onSubmit={e=>{e.preventDefault();send()}}><label className="sr-only" htmlFor="vx-chat-input">Message Vex</label><textarea ref={inputRef} id="vx-chat-input" rows={2} maxLength={1500} value={input} onChange={e=>setInput(e.target.value)} placeholder={listening?'Listening…':'Type or speak to Vex…'} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}}/><button type="button" className={listening?'is-listening':''} onClick={startListening} disabled={loading} aria-label={listening?'Stop listening':'Speak to Vex'} aria-pressed={listening}><FiMic/></button>{loading?<button type="button" onClick={()=>request.current?.abort('user')} aria-label="Stop response"><FiSquare/></button>:<button type="submit" disabled={!input.trim()} aria-label="Send message to Vex"><FiSend/></button>}</form>
        <nav className="vx-chat-links" aria-label="Vex website shortcuts">{actions.map(([label,to])=><Link key={to} to={to} onClick={close}>{label}<FiArrowUpRight/></Link>)}</nav>
        <p className="vx-chat-footer">Vex can make mistakes. Confirm project details with our team.</p>
      </section>
    </div>}
  </VexContext.Provider>
}
