import sys
import time
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

def audit_routes(browser_type_name="webkit"):
    print(f"\n============================================================")
    print(f"STEP 1 AUDIT: TESTING ALL SIDEBAR ROUTES IN [{browser_type_name.upper()}]")
    print(f"============================================================")

    results = []

    with sync_playwright() as p:
        browser_cls = getattr(p, browser_type_name)
        browser = browser_cls.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        console_errors = []
        failed_requests = []

        page.on("console", lambda msg: console_errors.append(f"{msg.text}") if msg.type in ["error"] else None)
        page.on("requestfailed", lambda req: failed_requests.append(f"{req.url} - {req.failure}"))

        # Navigate & Login
        page.goto("http://127.0.0.1:3000", wait_until="networkidle")
        time.sleep(1)

        login_btn = page.query_selector("button:has-text('Log In')") or page.query_selector("button[type='submit']")
        if login_btn:
          login_btn.click()
          time.sleep(2)

        # Get all sidebar buttons
        sidebar_buttons = page.query_selector_all("aside button, nav button, [role='navigation'] button")
        print(f"Total Sidebar Buttons Found: {len(sidebar_buttons)}")

        # Collect text of buttons
        button_texts = []
        for btn in sidebar_buttons:
          txt = btn.inner_text().strip().replace("\n", " ")
          if txt and len(txt) < 40 and txt not in button_texts:
            button_texts.append(txt)

        print(f"Discovered Sidebar Tab Labels: {button_texts}")

        # Iterate each tab
        for tab_label in button_texts:
          console_errors.clear()
          failed_requests.clear()

          # Click tab
          try:
            target_btn = page.query_selector(f"button:has-text('{tab_label}')")
            if target_btn:
              target_btn.click()
              time.sleep(1.2)
          except Exception as e:
            print(f"Error clicking {tab_label}: {e}")

          # Inspect main content area
          main_elem = page.query_selector("main")
          if not main_elem:
            main_elem = page.query_selector(".flex-1.overflow-y-auto")

          main_text = main_elem.inner_text().strip() if main_elem else ""
          visible = len(main_text) > 10
          is_blank = len(main_text) == 0

          res = {
            "tab": tab_label,
            "renders": visible and not is_blank,
            "text_length": len(main_text),
            "text_preview": main_text[:80].replace("\n", " ") if main_text else "[EMPTY/BLANK]",
            "console_errors": list(console_errors),
            "failed_requests": list(failed_requests)
          }
          results.append(res)
          print(f"Tab: '{tab_label}' | Renders: {res['renders']} | Text Length: {len(main_text)} | Errors: {len(console_errors)}")

        browser.close()

    return results

if __name__ == "__main__":
    audit_data = audit_routes("webkit")
    with open("audit_results.json", "w") as f:
      json.dump(audit_data, f, indent=2)
