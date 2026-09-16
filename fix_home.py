import re

with open('src/pages/Home.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

bad_stats_band = """          <div>
            <span>04</span>
            <strong>∞</strong>
            <p>Room to evolve</p>
            <div className="hero-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link className="button-primary btn-glow-ring" to="/contact" onClick={() => soundEngine.playClick()}>
                Start Project <FiArrowUpRight />
              </Link>
              <Link className="button-ghost btn-glow-ring" to="/portal" onClick={() => soundEngine.playClick()}>
                <FiCpu /> Launch Portal
              </Link>
            </div>
          </div>
        </section>"""

good_stats_band = """          <div>
            <span>04</span>
            <strong>∞</strong>
            <p>Room to evolve</p>
          </div>
        </section>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', margin: '3rem auto' }}>
          <Link className="button-primary btn-glow-ring" to="/contact" onClick={() => soundEngine.playClick()}>
            Start Project <FiArrowUpRight />
          </Link>
          <Link className="button-ghost btn-glow-ring" to="/portal" onClick={() => soundEngine.playClick()}>
            <FiCpu /> Launch Portal
          </Link>
        </div>"""

code = code.replace(bad_stats_band, good_stats_band)

with open('src/pages/Home.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Home fixed")
