import sys
import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}"))
        
        page_errors = []
        page.on("pageerror", lambda err: page_errors.append(str(err)))

        print("Navigating to http://localhost:3000...")
        page.goto("http://localhost:3000", wait_until="domcontentloaded")
        page.wait_for_timeout(2000)

        # Login
        if page.locator("input[name='username'], input[type='text']").count() > 0:
            print("Filling login form...")
            page.fill("input[name='username'], input[type='text']", "officer")
            page.fill("input[name='password'], input[type='password']", "officer123")
            page.click("button[type='submit']")
            page.wait_for_timeout(2000)

        # Go to GIS Map
        print("Clicking Bhu-Naksha GIS Map...")
        map_btn = page.locator("button:has-text('Bhu-Naksha'), a:has-text('Bhu-Naksha'), div:has-text('Bhu-Naksha GIS Map')").first
        if map_btn.count() > 0:
            map_btn.click()
            page.wait_for_timeout(2000)

        print("Current page title/text:", page.title())

        # Find Leaflet zoom in button
        zoom_in = page.locator(".leaflet-control-zoom-in")
        print("Zoom in button count:", zoom_in.count())
        
        for i in range(1, 10):
            if zoom_in.count() > 0 and zoom_in.is_visible():
                zoom_in.click()
                page.wait_for_timeout(600)
                print(f"Zoom level click {i}")
                if len(page_errors) > 0 or page.locator("text=Application Recovery").count() > 0:
                    print("!!! CRASH DETECTED !!!")
                    break

        print("\n--- UNCAUGHT PAGE ERRORS ---")
        for err in page_errors:
            print(err)

        print("\n--- CONSOLE ERRORS ---")
        for err in [c for c in console_errors if "error" in c.lower() or "uncaught" in c.lower() or "iterable" in c.lower()]:
            print(err)

        browser.close()

if __name__ == "__main__":
    run()
