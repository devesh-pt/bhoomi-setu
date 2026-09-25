import os
import time
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = "/Users/deveshpatel/.gemini/antigravity/brain/a086f619-1a90-43ff-92d4-142095168979"
LIVE_URL = "https://devesh-pt.github.io/bhoomi-setu/"

def verify_live():
    with sync_playwright() as p:
        print("--- VERIFYING LIVE SITE ON MOBILE (iPhone 13) ---")
        browser = p.chromium.launch(headless=True)
        device = p.devices['iPhone 13']
        # Hard refresh / bypass cache
        context = browser.new_context(**device, ignore_https_errors=True)
        page = context.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        page.goto(LIVE_URL, wait_until="networkidle")
        time.sleep(3)

        # Bottom sheet check
        sidebar_locator = page.locator("div.fixed.bottom-0")
        if sidebar_locator.count() > 0:
            box = sidebar_locator.bounding_box()
            print(f"Live Mobile Bottom Sheet Box: {box}")

        # Map Canvas touch interaction
        map_canvas = page.locator(".leaflet-container")
        if map_canvas.count() > 0:
            canvas_box = map_canvas.bounding_box()
            print(f"Live Map Canvas Box: {canvas_box}")

        mobile_img_path = os.path.join(ARTIFACT_DIR, "screen_live_mobile_iphone.png")
        page.screenshot(path=mobile_img_path)
        print(f"Saved mobile screenshot: {mobile_img_path}")
        browser.close()

        print("--- VERIFYING LIVE SITE ON DESKTOP ---")
        browser_desktop = p.chromium.launch(headless=True)
        context_desktop = browser_desktop.new_context(viewport={"width": 1280, "height": 800}, ignore_https_errors=True)
        page_desktop = context_desktop.new_page()

        page_desktop.goto(LIVE_URL, wait_until="networkidle")
        time.sleep(3)

        sidebar_logo = page_desktop.locator("aside img")
        if sidebar_logo.count() > 0:
            print(f"Live Desktop Logo src: {sidebar_logo.get_attribute('src')}")

        desktop_img_path = os.path.join(ARTIFACT_DIR, "screen_live_desktop.png")
        page_desktop.screenshot(path=desktop_img_path)
        print(f"Saved desktop screenshot: {desktop_img_path}")
        browser_desktop.close()

        print(f"Live Console Errors: {len(console_errors)}")

if __name__ == "__main__":
    verify_live()
