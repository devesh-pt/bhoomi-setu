import sys
import time
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = Path(__file__).resolve().parent.parent / "artifacts_preview"
ARTIFACT_DIR.mkdir(exist_ok=True)

def run_smoke_test(browser_type_name="webkit", base_url="http://127.0.0.1:3000"):
    print(f"\n============================================================")
    print(f"PLAYWRIGHT SMOKE TEST FOR ALL TABS [{browser_type_name.upper()}] @ {base_url}")
    print(f"============================================================")

    console_errors = []
    page_errors = []
    failed_requests = []
    tab_results = []

    with sync_playwright() as p:
        browser_cls = getattr(p, browser_type_name)
        browser = browser_cls.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ["error"] else None)
        page.on("pageerror", lambda err: page_errors.append(str(err)))
        page.on("requestfailed", lambda req: failed_requests.append(f"{req.method} {req.url} - {req.failure}"))

        print(f"Navigating to {base_url}...")
        page.goto(base_url, wait_until="networkidle")
        time.sleep(1)

        # Submit Login
        login_btn = page.query_selector("button:has-text('Log In')") or page.query_selector("button[type='submit']")
        if login_btn:
            print("Logging in...")
            login_btn.click()
            time.sleep(2)

        # Get all sidebar tab buttons
        sidebar_buttons = page.query_selector_all("aside button, nav button")
        tab_names = []
        for btn in sidebar_buttons:
            txt = btn.inner_text().strip().replace("\n", " ")
            if txt and len(txt) < 35 and txt not in tab_names:
                tab_names.append(txt)

        print(f"Discovered {len(tab_names)} Sidebar Tabs: {tab_names}")

        all_passed = True
        for name in tab_names:
            console_errors.clear()
            failed_requests.clear()

            # Click tab
            try:
                target_btn = page.query_selector(f"button:has-text('{name}')")
                if target_btn:
                    target_btn.click()
                    time.sleep(1.2)
            except Exception as e:
                print(f"[WARN] Failed to click {name}: {e}")

            # Inspect main element
            main_elem = page.query_selector("main")
            main_text = main_elem.inner_text().strip() if main_elem else ""

            # Check for invisible overlay
            opacity_check = page.evaluate("""() => {
                const el = document.querySelector('main');
                if (!el) return false;
                const style = window.getComputedStyle(el);
                return style.opacity === '0' || style.display === 'none' || style.visibility === 'hidden';
            }""")

            rendered = len(main_text) > 15 and not opacity_check
            has_errors = len(console_errors) > 0 or len(page_errors) > 0

            status_str = "PASSED ✅" if (rendered and not has_errors) else "FAILED ❌"
            if not (rendered and not has_errors):
                all_passed = False

            tab_results.append({
                "tab": name,
                "status": status_str,
                "text_length": len(main_text),
                "text_preview": main_text[:60].replace("\n", " "),
                "console_errors": list(console_errors),
                "page_errors": list(page_errors)
            })

            print(f"Tab [{name}] -> {status_str} (Text Length: {len(main_text)}, Errors: {len(console_errors)})")
            
            # Take screenshot per tab
            clean_name = name.lower().replace(" ", "_").replace("&", "and")
            screenshot_file = ARTIFACT_DIR / f"tab_{clean_name}_{browser_type_name}.png"
            page.screenshot(path=str(screenshot_file))

        browser.close()

    print(f"\n============================================================")
    print(f"SMOKE TEST SUMMARY FOR [{browser_type_name.upper()}]: {'ALL PASSED 100% ✅' if all_passed else 'SOME FAILED ❌'}")
    print(f"============================================================")

    return all_passed

if __name__ == "__main__":
    b_type = sys.argv[1] if len(sys.argv) > 1 else "webkit"
    port_url = sys.argv[2] if len(sys.argv) > 2 else "http://127.0.0.1:3000"
    success = run_smoke_test(b_type, port_url)
    sys.exit(0 if success else 1)
