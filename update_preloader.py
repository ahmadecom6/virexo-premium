with open('src/components/VanillaInteractions.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("if (document.readyState === 'complete') hide(); else window.addEventListener('load', hide, { once: true })", "hide()")

with open('src/components/VanillaInteractions.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
