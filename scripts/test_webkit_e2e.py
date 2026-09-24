import sys
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = Path(__file__).resolve().parent.parent / "artifacts_preview"
ARTIFACT_DIR.mkdir(exist_ok=True)

def run_browser_test(browser_type_name="webkit"):
    print(f"\n============================================================")
    print(f"RUNNING PLAYWRIGHT E2E TEST IN [{browser_type_name.upper()}]")
    print(f"============================================================")

    console_errors = []
    page_errors = []
    failed_requests = []

    with sync_playwright() as p:
        browser_cls = getattr(p, browser_type_name)
        browser = browser_cls.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        # Listen to console logs
        page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ["error", "warning"] else None)
        page.on("pageerror", lambda err: page_errors.append(str(err)))
        page.on("requestfailed", lambda req: failed_requests.append(f"{req.method} {req.url} - {req.failure}"))

        url = "http://127.0.0.1:3000"
        print(f"Navigating to {url}...")
        try:
            page.goto(url, wait_until="networkidle", timeout=15000)
        except Exception as e:
            print(f"[WARN] Navigation timeout or error: {e}")

        time.sleep(1.5)
        title = page.title()
        print(f"Page Title: '{title}'")

        # Take Login Screenshot
        screenshot_path = ARTIFACT_DIR / f"login_{browser_type_name}.png"
        page.screenshot(path=str(screenshot_path))
        print(f"Saved login screenshot to {screenshot_path}")

        # Check for visible Login Button or form
        login_btn = page.query_selector("button:has-text('Log In')") or page.query_selector("button[type='submit']")
        print(f"Login Button Found: {login_btn is not None}")

        if login_btn:
            print("Submitting login form...")
            login_btn.click()
            time.sleep(2.0)

            # Map screenshot after login
            map_screenshot_path = ARTIFACT_DIR / f"map_{browser_type_name}.png"
            page.screenshot(path=str(map_screenshot_path))
            print(f"Saved map screenshot to {map_screenshot_path}")

        browser.close()

    print(f"\n--- {browser_type_name.upper()} DIAGNOSTIC SUMMARY ---")
    print(f"Page Errors Count: {len(page_errors)}")
    for pe in page_errors:
        print(f"  ❌ {pe}")

    print(f"Console Errors/Warnings Count: {len(console_errors)}")
    for ce in console_errors[:10]:
        print(f"  ⚠️ {ce}")

    print(f"Failed Requests Count: {len(failed_requests)}")
    for fr in failed_requests:
        print(f"  ⛔ {fr}")

    return len(page_errors) == 0

if __name__ == "__main__":
    b_type = sys.argv[1] if len(sys.argv) > 1 else "webkit"
    success = run_browser_test(b_type)
    sys.exit(0 if success else 1)
