import re

with open('src/components/VanillaInteractions.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Update header
code = re.sub(
    r'<h3>VEX v1\.0 - VIREXO COPILOT // ONLINE</h3>',
    r'<h3>VIREXO AI // ONLINE</h3>',
    code
)

# Update placeholder
code = re.sub(
    r'Ask VEX anything about Virexo...',
    r'Ask Virexo AI...',
    code
)

# Update Greeting
code = re.sub(
    r'Greetings, human\. I am VEX, Virexo\'s autonomous AI copilot\.',
    r'Greetings. I am Virexo AI, your autonomous copilot.',
    code
)

# Update Menu
code = re.sub(
    r"const menu = \[\s*\['SERVICES', 'services'\],\s*\['TECH STACK', 'automation'\],\s*\['PROJECTS', 'engineering'\],\s*\['CONTACT', 'quote'\]\s*\]",
    r"const menu = [\n      ['Explore Services', 'services'],\n      ['Discuss My Project', 'quote'],\n      ['Contact Virexo', 'contact']\n    ]",
    code
)

with open('src/components/VanillaInteractions.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("AI updated")
