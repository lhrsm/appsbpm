import re

with open("src/index.css", "r") as f:
    content = f.read()

# 1. Update .auth-card
# Use a regex that matches the current block and replaces it with the clean version
auth_card_pattern = re.compile(r'\.auth-card \{[^{}]*\}', re.DOTALL)
new_auth_card = """.auth-card {
    background: var(--portal-modal-bg-light) !important;
    backdrop-filter: blur(var(--portal-modal-blur)) saturate(115%) !important;
    -webkit-backdrop-filter: blur(var(--portal-modal-blur)) saturate(115%) !important;
    border: var(--portal-modal-border-light) !important;
    box-shadow: var(--portal-modal-shadow-light) !important;
    border-radius: var(--portal-modal-radius) !important;
    padding: 16px 12px !important;
    position: relative;
    z-index: 10;
    width: 388px;
    max-width: calc(100% - 24px);
    margin-inline: auto;
    color: #172033 !important;
    height: auto;
    min-height: unset;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: visible !important;
    box-sizing: border-box;
  }"""
content = auth_card_pattern.sub(new_auth_card, content)

# 2. Update .portal-choice
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

# 3. Add .public-portal-light styles inside the mobile media query
# First, clean up existing .public-portal-light and media queries that might be duplicated
content = re.sub(r'@media \(max-width: 1023px\) \{[^{}]*\}\n\s*@media \(min-width: 1280px\) \{', r'@media (min-width: 1280px) {', content) # example cleanup

# Ensure we have the .public-portal-light styles
if '.public-portal-light' not in content:
    content += """
@media (max-width: 1023px) {
  .public-portal-light input,
  .public-portal-light textarea,
  .public-portal-light select,
  .public-portal-light [role="combobox"],
  .public-auth-theme input {
    background-color: #ffffff !important;
    color: #1f2937 !important;
    -webkit-text-fill-color: #1f2937 !important;
    border: 1.5px solid rgba(22, 138, 73, 0.58) !important;
    color-scheme: light !important;
  }
  .public-portal-light input::placeholder {
    color: #8491a3 !important;
    -webkit-text-fill-color: #8491a3 !important;
    opacity: 1;
  }
}
"""

with open("src/index.css", "w") as f:
    f.write(content)
