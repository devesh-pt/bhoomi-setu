import os
import sys
import time
import subprocess
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = "/Users/deveshpatel/.gemini/antigravity/brain/a086f619-1a90-43ff-92d4-142095168979"
DIST_DIR = os.path.abspath("frontend/dist")

class SPAHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR, **kwargs)

    def do_GET(self):
        # Serve subpath /bhoomi-setu/ from root of DIST_DIR
        if self.path.startswith('/bhoomi-setu/'):
            rel_path = self.path[len('/bhoomi-setu/'):]
            if not rel_path or rel_path == '':
                self.path = '/index.html'
            else:
                self.path = '/' + rel_path
        super().do_GET()

def start_server():
    httpd = HTTPServer(('127.0.0.1', 5173), SPAHandler)
    httpd.serve_forever()

def run_verification():
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(1)

    console_errors = []

    with sync_playwright() as p:
        print("--- RUNNING MOBILE MAP TOUCH VERIFICATION (iPhone 13) ---")
        browser = p.chromium.launch(headless=True)
        device = p.devices['iPhone 13']
        context = browser.new_context(**device)
        page = context.new_page()

        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        page.goto("http://127.0.0.1:5173/bhoomi-setu/")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        # Verify collapsed bottom sheet
        sidebar_box = page.locator("div.fixed.bottom-0").bounding_box()
        print(f"Mobile Bottom Sheet bounding box: {sidebar_box}")

        # Simulate touch swipe on map canvas
        map_canvas = page.locator(".leaflet-container")
        canvas_box = map_canvas.bounding_box()
        print(f"Map Canvas bounding box: {canvas_box}")

        if canvas_box:
            start_x = canvas_box['x'] + canvas_box['width'] / 2
            start_y = canvas_box['y'] + canvas_box['height'] / 3
            # Touch tap on map
            page.touchscreen.tap(start_x, start_y)
            time.sleep(1)

        map_touch_path = os.path.join(ARTIFACT_DIR, "map_mobile_touch.png")
        page.screenshot(path=map_touch_path)
        print(f"Captured mobile touch screenshot: {map_touch_path}")
        browser.close()

        print("--- RUNNING LOGO & FAVICON VERIFICATION (Desktop) ---")
        browser_desktop = p.chromium.launch(headless=True)
        context_desktop = browser_desktop.new_context(viewport={"width": 1280, "height": 800})
        page_desktop = context_desktop.new_page()

        page_desktop.goto("http://127.0.0.1:5173/bhoomi-setu/")
        page_desktop.wait_for_load_state("networkidle")
        time.sleep(2)

        # Check logo image in sidebar header
        sidebar_logo = page_desktop.locator("aside img")
        logo_src = sidebar_logo.get_attribute("src")
        print(f"Sidebar logo src: {logo_src}")

        sidebar_logo_path = os.path.join(ARTIFACT_DIR, "sidebar_logo_theme.png")
        page_desktop.screenshot(path=sidebar_logo_path)
        print(f"Captured sidebar logo screenshot: {sidebar_logo_path}")

        # Favicon verification
        favicons = page_desktop.locator("link[rel*='icon']").all()
        print(f"Found {len(favicons)} favicon link tags")

        favicon_preview_path = os.path.join(ARTIFACT_DIR, "favicon_preview.png")
        page_desktop.screenshot(path=favicon_preview_path)
        print(f"Captured favicon preview screenshot: {favicon_preview_path}")

        browser_desktop.close()

    print(f"Console errors detected: {len(console_errors)}")
    if console_errors:
        print("Console errors:", console_errors)

if __name__ == "__main__":
    run_verification()
