import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiArrowRight, FiArrowUpRight, FiPause, FiPlay, FiCode, FiCpu, FiLayers, FiZap } from 'react-icons/fi'
import { services } from '../data/services'
import { projects } from '../data/projects'
import useMotionPreference from '../hooks/useMotionPreference'

const principles = [
  ['Responsive by design', 'Considered layouts, from the smallest screen to the widest workspace.', FiLayers],
  ['Connected systems', 'Bring your interface, business logic and integrations together.', FiCpu],
  ['Clarity in every detail', 'Useful interactions. Readable content. A purposeful experience.', FiZap],
  ['Built to evolve', 'Reusable components and maintainable code for the next iteration.', FiCode],
  ['Human ideas. Smart tools.', 'Thoughtful design and practical AI, working together.', FiCpu],
  ['From idea to launch', 'Discovery, design, development and support in one workflow.', FiZap],
]
const cards = [
  ...services.map((s,i) => ({ id: s.id, title: s.title, text: s.short, tag: 'CAPABILITY', to: `/services?service=${s.id}`, icon: [FiCode,FiCpu,FiLayers][i%3] })),
  ...projects.map(p => ({ id: p.id, title: p.title, text: p.description, tag: 'SELECTED PROJECT', to: `/projects/${p.id}`, icon: FiLayers })),
  ...principles.map(([title,text,icon],i) => ({ id: `principle-${i}`, title,text,icon,tag:'OUR APPROACH',to:'/about' })),
]
const step = 360 / cards.length
const wrap = n => ((n % cards.length) + cards.length) % cards.length

export default function CircularCardSlider() {
  const section = useRef(null), rotor = useRef(null), cardRefs = useRef([])
  const drag = useRef(null), angle = useRef(0), goal = useRef(null), visible = useRef(false)
  const selected = useRef(0), state = useRef({ paused:false, reduced:false, hover:false })
  const [paused,setPaused] = useState(false), [active,setActive] = useState(0), [dragging,setDragging] = useState(false)
  const reduced = useMotionPreference()
  const [scale,setScale] = useState(1)
  state.current.paused=paused;state.current.reduced=reduced
  const paint = () => {
    if (!rotor.current) return
    rotor.current.style.transform = `translateZ(-490px) rotateX(-11deg) rotateY(${angle.current}deg)`
    cardRefs.current.forEach((el,i) => {
      if(!el)return
      const global=angle.current+i*step
      // Billboarding keeps both sides of the cylinder readable; edge cards retain depth.
      const tilt=Math.sin(global*Math.PI/180)*48
      el.style.transform=`rotateY(${-global+tilt}deg)`
    })
    const index=wrap(Math.round(-angle.current/step))
    if(index!==selected.current){selected.current=index;setActive(index)}
  }
  useEffect(() => {
    const observer = new IntersectionObserver(([e])=>{visible.current=e.isIntersecting},{threshold:.1})
    observer.observe(section.current)
    const resize = new ResizeObserver(([e])=>setScale(Math.min(1,e.contentRect.width/1160)))
    resize.observe(section.current)
    let frame,last=0
    const tick=t=>{
      const dt=Math.min((t-last)/1000 || 0,.05);last=t
      if(visible.current && !document.hidden){
        if(goal.current!==null){
          const diff=goal.current-angle.current
          angle.current += state.current.reduced ? diff : diff*Math.min(1,dt*9)
          if(Math.abs(diff)<.02){angle.current=goal.current;goal.current=null}
        }else if(!state.current.paused && !state.current.reduced && !state.current.hover && !drag.current){angle.current-=dt*6}
        paint()
      }
      frame=requestAnimationFrame(tick)
    }
    paint();frame=requestAnimationFrame(tick)
    return()=>{cancelAnimationFrame(frame);observer.disconnect();resize.disconnect()}
  },[])
  const select = index => {
    setPaused(true)
    const target=-index*step
    goal.current=angle.current+(((target-angle.current+180)%360+360)%360-180)
  }
  const move = direction => select(wrap(selected.current+direction))
  const pointerDown = e => {
    if(e.button!==0 || reduced)return
    drag.current={x:e.clientX,angle:angle.current,moved:false,index:e.target.closest('[data-card-index]')?.dataset.cardIndex};goal.current=null
    e.currentTarget.setPointerCapture(e.pointerId);setDragging(true)
  }
  const pointerMove = e => {
    if(!drag.current)return
    const delta=e.clientX-drag.current.x
    if(Math.abs(delta)>5)drag.current.moved=true
    if(drag.current.moved){angle.current=drag.current.angle+delta*.16/Math.max(scale,.45);paint()}
  }
  const pointerUp = e => {
    if(!drag.current)return
    const moved=drag.current.moved, index=drag.current.index
    drag.current=null;setDragging(false)
    if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)
    if(moved){setPaused(true);goal.current=Math.round(angle.current/step)*step}
    else if(index!==undefined)select(Number(index))
  }
  const item=cards[active]
  return <section className="vx-carousel" ref={section} aria-roledescription="carousel" aria-label="Virexo capabilities and projects">
    <header className="vx-carousel-heading"><span className="vx-kicker">THE VIREXO UNIVERSE</span><h2>Many possibilities.<br /><em>One connected vision.</em></h2><p>Explore our work, capabilities and the thinking that brings them together.</p></header>
    <div className={`vx-cylinder-viewport ${dragging?'is-dragging':''}`} tabIndex={0} aria-label="Drag the circular cards, or use the left and right arrow keys"
      onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}}}
      onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={()=>{drag.current=null;setDragging(false)}}
      onPointerEnter={()=>{state.current.hover=true}} onPointerLeave={()=>{state.current.hover=false}}
      onFocus={()=>{state.current.hover=true}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))state.current.hover=false}}>
      <div className="vx-cylinder-scale" style={{transform:`translate(-50%, -50%) scale(${scale})`}}>
        <div className="vx-cylinder-camera"><div className="vx-cylinder-rotor" ref={rotor}>
          {cards.map((c,i)=>{const Icon=c.icon;return <div className="vx-cylinder-slot" key={c.id} style={{transform:`rotateY(${i*step}deg) translateZ(490px)`}}>
            <button ref={el=>{cardRefs.current[i]=el}} type="button" className={`vx-cylinder-card ${i%4===2?'is-pearl':''} ${i===active?'is-selected':''}`}
              data-card-index={i} aria-label={`Show ${c.title}`} tabIndex={i===active?0:-1} onClick={()=>select(i)}>
              <span className="vx-cylinder-card-top"><Icon/><small>{String(i+1).padStart(2,'0')}</small></span>
              <span className="vx-cylinder-tag">{c.tag}</span><strong>{c.title}</strong><span className="vx-cylinder-copy">{c.text}</span>
              <span className="vx-cylinder-signature">VIREXO <FiArrowUpRight/></span>
            </button>
          </div>})}
        </div></div>
      </div>
      <div className="vx-cylinder-shadow" aria-hidden="true"/>
    </div>
    <div className="vx-carousel-controlbar">
      <div className="vx-carousel-selected"><span>{item.tag} / {String(active+1).padStart(2,'0')}</span><Link to={item.to}>{item.title}<FiArrowUpRight/></Link></div>
      <div className="vx-carousel-controls"><button type="button" onClick={()=>move(-1)} aria-label="Previous circular card"><FiArrowLeft/></button><span>{String(active+1).padStart(2,'0')} / {cards.length}</span><button type="button" onClick={()=>move(1)} aria-label="Next circular card"><FiArrowRight/></button><button type="button" disabled={reduced} aria-label={paused?'Play circular animation':'Pause circular animation'} aria-pressed={paused} onClick={()=>{goal.current=null;setPaused(v=>!v)}}>{paused||reduced?<FiPlay/>:<FiPause/>}</button></div>
    </div>
    <p className="vx-carousel-hint">Drag to explore · Arrow keys to browse · Select a title to learn more</p>
  </section>
}
