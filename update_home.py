import re

with open('src/pages/Home.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

if 'import Scene' not in code:
    code = code.replace("import { Link } from 'react-router-dom'", "import { Link } from 'react-router-dom'\nimport Scene from '../components/canvas/Scene'")

old_hero_pattern = re.compile(r'<section className="page-hero".*?</section>', re.DOTALL)

new_hero = """<section className="page-hero hud-hero" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', alignItems: 'center', gap: '2rem', minHeight: '70vh', textAlign: 'left', padding: '0 24px', maxWidth: '1440px', margin: '0 auto' }}>
        <div className="hero-content">
          <span className="hud-page-kicker">WEB DEVELOPMENT | AI SOLUTIONS | DIGITAL EXPERIENCES</span>
          <h1 className="hud-glow-text" style={{ fontSize: '4.5rem', fontWeight: 900, marginBottom: '1.5rem', marginTop: '1rem', fontStyle: 'normal', lineHeight: '1.1' }}>
            We Build What's Next.
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '600px', marginBottom: '2.5rem' }}>
            We engineer responsive digital platforms, automate business workflows, and craft intelligent AI solutions that turn complexity into clear momentum.
          </p>
          <div className="hero-actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link className="button-primary btn-glow-ring" to="/contact" onClick={() => soundEngine.playClick()}>
              Start Your Project <FiArrowUpRight />
            </Link>
            <Link className="button-ghost btn-glow-ring" to="/services" onClick={() => soundEngine.playClick()}>
              Explore Services <FiArrowUpRight />
            </Link>
          </div>
        </div>
        <div className="hero-visual" style={{ position: 'relative', width: '100%', height: '500px', borderRadius: '50%', overflow: 'hidden' }}>
          <Scene />
        </div>
      </section>"""

code = old_hero_pattern.sub(new_hero, code, count=1)

with open('src/pages/Home.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Home.jsx updated")
