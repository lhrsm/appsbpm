import sys

content = open("src/index.css").read()

# 1. Fix .auth-card
old_auth_card = """  .auth-card {
    background: rgba(255, 255, 255, 0.72) !important;
    backdrop-filter: blur(9px) saturate(118%) !important;
    -webkit-backdrop-filter: blur(9px) saturate(118%) !important;
    border: 1.5px solid rgba(22, 163, 74, 0.68) !important;
    box-shadow: 0 18px 42px rgba(15, 23, 42, 0.14) !important;
    border-radius: 28px !important;
    padding: 16px 12px !important;
    position: relative;
    z-index: 10;
    width: 388px;
    max-width: calc(100% - 24px);
    margin-inline: auto;
    color: #1f2937 !important;

    height: auto;
    min-height: unset;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: visible !important;
    box-sizing: border-box;
  }"""

new_auth_card = """  .auth-card {
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

if old_auth_card in content:
    content = content.replace(old_auth_card, new_auth_card)
else:
    print("Could not find auth-card block exactly.")

# 2. Fix .portal-choice
old_portal_choice = """  .portal-choice {
    background: rgba(255, 255, 255, 0.94) !important;
    border: 1.25px solid rgba(22, 163, 74, 0.50) !important;
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

new_portal_choice = """  .portal-choice {
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

if old_portal_choice in content:
    content = content.replace(old_portal_choice, new_portal_choice)
else:
    print("Could not find portal-choice block exactly.")

# 3. Add .public-portal-light styles
new_public_portal_light = """
  .public-portal-light input,
  .public-portal-light textarea,
  .public-portal-light select,
  .public-portal-light [role="combobox"] {
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

  /* Autofill Android for .public-portal-light */
  .public-portal-light input:-webkit-autofill,
  .public-portal-light input:-webkit-autofill:hover,
  .public-portal-light input:-webkit-autofill:focus {
    -webkit-text-fill-color: #1f2937 !important;
    -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
    caret-color: #1f2937;
  }
"""

if "@media (max-width: 1023px) {" in content:
     content = content.replace("@media (max-width: 1023px) {", "@media (max-width: 1023px) {" + new_public_portal_light)

with open("src/index.css", "w") as f:
    f.write(content)
