import re

with open("src/index.css", "r") as f:
    content = f.read()

# 1. Padronizar .portal-choice com fundo e borda institucional v8
portal_choice_pattern = re.compile(r'\.portal-choice \{[^{}]*\}', re.DOTALL)
new_portal_choice = """.portal-choice {
    background: rgba(255, 255, 255, 0.96) !important;
    border: 1.25px solid rgba(22, 163, 74, 0.40) !important;
    box-shadow: 0 7px 18px rgba(15, 23, 42, 0.08) !important;
    transition: all 200ms ease-in-out !important;
    border-radius: 18px !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    margin-inline: auto !important;
    min-height: auto !important;
    height: auto !important;
    padding: 16px 18px !important;
    display: grid !important;
    grid-template-columns: auto minmax(0, 1fr) auto !important;
    align-items: center !important;
    gap: 14px !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }"""
content = portal_choice_pattern.sub(new_portal_choice, content)

# 2. Assegurar isolamento de inputs brancos no mobile v8
if '.public-portal-light input' not in content:
    content += """
@media (max-width: 1023px) {
  .public-portal-light input,
  .public-portal-light textarea,
  .public-portal-light select,
  .public-portal-light [role="combobox"],
  .public-auth-theme input,
  .auth-card input {
    background-color: #ffffff !important;
    color: #1f2937 !important;
    -webkit-text-fill-color: #1f2937 !important;
    border: 1.5px solid rgba(22, 138, 73, 0.58) !important;
    color-scheme: light !important;
  }
}
"""

with open("src/index.css", "w") as f:
    f.write(content)
