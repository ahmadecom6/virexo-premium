import re

with open('src/styles/hud-redesign.scss', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace the entire Glow Ring Effect section
new_css = '''
/* Glow Ring Effect for Components */
.btn-glow-ring {
  position: relative;
  overflow: hidden;
  z-index: 1;
  background: transparent !important;
}

.btn-glow-ring > * {
  position: relative;
  z-index: 2;
}

.btn-glow-ring::before {
  content: "";
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  background: conic-gradient(
    transparent,
    transparent,
    transparent,
    #00E5FF
  );
  animation: glow-spin-rotate 3s linear infinite;
  z-index: -2;
}

.btn-glow-ring::after {
  content: "";
  position: absolute;
  inset: 1.5px;
  background: #0b1828;
  border-radius: inherit;
  z-index: -1;
}

.nav-contact-btn.btn-glow-ring::after {
  background: #050709;
}
.nav-link-item.btn-glow-ring::after {
  background: transparent;
}
.nav-link-item.btn-glow-ring:hover::after {
  background: rgba(11, 24, 40, 0.8);
}

@keyframes glow-spin-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Make nav items look like proper pills with the ring effect */
.nav-link-item.btn-glow-ring {
  padding: 6px 16px !important;
  border-radius: 999px;
  overflow: hidden;
  color: #fff !important;
}

/* Specific fix to ensure baseline alignment */
.site-nav-container {
  display: flex !important;
  align-items: center !important;
}

@media (max-width: 1200px) {
  .site-nav-container .nav-links:not(.is-open) {
    display: none !important;
  }
}
'''

# Remove everything after /* Glow Ring Effect for Components */
idx = content.find('/* Glow Ring Effect for Components */')
if idx != -1:
    content = content[:idx] + new_css
else:
    content += new_css

with open('src/styles/hud-redesign.scss', 'w', encoding='utf-8') as f:
    f.write(content)

