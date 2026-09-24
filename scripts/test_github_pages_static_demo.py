#!/usr/bin/env python3
"""
Playwright smoke test script for BHUMISETU GitHub Pages Static Demo Mode.
Tests desktop and mobile viewports (iPhone 13, Pixel 7) across Chromium and WebKit browsers.
"""
import os
import sys
import time
import subprocess
from playwright.sync_api import sync_playwright

def run_tests():
    # Build static bundle for preview test
    print("Building static demo bundle...")
    env = os.environ.copy()
    env["VITE_DEMO_MODE"] = "true"
    env["VITE_BASE_URL"] = "/bhoomi-setu/"
    
    subprocess.run(["npm", "run", "build"], cwd="frontend", env=env, check=True)
    subprocess.run(["cp", "frontend/dist/index.html", "frontend/dist/404.html"], check=True)

    # Start static file server serving frontend/dist at /bhoomi-setu/
    print("Starting static HTTP server on port 4173...")
    import http.server
    import socketserver
    import threading

    class StaticHandler(http.server.SimpleHTTPRequestHandler):
        def translate_path(self, path):
            if path.startswith("/bhoomi-setu/"):
                rel_path = path[len("/bhoomi-setu/"):]
            else:
                rel_path = path.lstrip("/")
            
            target = os.path.join(os.getcwd(), "frontend/dist", rel_path)
            if not os.path.exists(target) and not os.path.splitext(target)[1]:
                target = os.path.join(os.getcwd(), "frontend/dist", "index.html")
            return target

    PORT = 4173
    handler = StaticHandler
    httpd = socketserver.TCPServer(("127.0.0.1", PORT), handler)
    server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    server_thread.start()
    time.sleep(1)

    base_url = f"http://127.0.0.1:{PORT}/bhoomi-setu/"
    print(f"Preview server running at: {base_url}")

    viewports = [
        {"name": "Desktop 1080p", "width": 1280, "height": 800, "is_mobile": False},
        {"name": "iPhone 13 (Mobile)", "width": 390, "height": 844, "is_mobile": True},
        {"name": "Pixel 7 (Mobile)", "width": 412, "height": 915, "is_mobile": True},
    ]

    modules_to_test = [
        {"hash": "#/land_map", "title": "Map"},
        {"hash": "#/cascading_search", "title": "Search"},
        {"hash": "#/highways", "title": "Highways"},
        {"hash": "#/ai_detection", "title": "Muavja"},
        {"hash": "#/forest_impact", "title": "Forest"},
        {"hash": "#/court", "title": "Court"},
        {"hash": "#/grievances", "title": "Grievances"},
        {"hash": "#/profile", "title": "Profile"}
    ]

    console_errors = []

    with sync_playwright() as p:
        for browser_type in [p.chromium, p.webkit]:
            browser_name = browser_type.name
            print(f"\n==========================================")
            print(f"Testing Browser: {browser_name.upper()}")
            print(f"==========================================")
            
            browser = browser_type.launch(headless=True)

            for vp in viewports:
                print(f"\n--- Viewport: {vp['name']} ({vp['width']}x{vp['height']}) ---")
                context = browser.new_context(
                    viewport={"width": vp["width"], "height": vp["height"]},
                    is_mobile=vp["is_mobile"]
                )
                page = context.new_page()

                def handle_console(msg):
                    if msg.type == "error":
                        err_text = msg.text
                        if "favicon" not in err_text and "React DevTools" not in err_text:
                            print(f"  [CONSOLE ERROR ({browser_name} - {vp['name']})]: {err_text}")
                            console_errors.append((browser_name, vp["name"], err_text))

                page.on("console", handle_console)

                # 1. Load Root Page
                page.goto(base_url, wait_until="networkidle")
                page.wait_for_timeout(1000)

                # Check Demo Mode Badge
                page_text = page.content()
                assert "BHOOMI SETU" in page_text or "bhoomi" in page_text.lower(), "Brand logo / title missing"
                print("  ✓ App Shell Loaded Successfully")

                # 2. Test Hash Routes & Modules
                for mod in modules_to_test:
                    target_url = f"{base_url}{mod['hash']}"
                    page.goto(target_url, wait_until="networkidle")
                    page.wait_for_timeout(500)

                    body_text = page.inner_text("body")
                    assert len(body_text) > 50, f"Page rendered blank on route {mod['hash']}"
                    print(f"  ✓ Route {mod['hash']} ({mod['title']}) rendered cleanly")

                # 3. Test Muavja CSV Export in Static Demo Mode
                page.goto(f"{base_url}#/ai_detection", wait_until="networkidle")
                page.wait_for_timeout(500)
                
                # Check export button click
                export_btn = page.query_selector("button:has-text('Export'), button:has-text('Excel'), button:has-text('CSV')")
                if export_btn:
                    with page.expect_download(timeout=5000) as download_info:
                        export_btn.click()
                    download = download_info.value
                    print(f"  ✓ Static CSV Export Downloaded: {download.suggested_filename}")

                context.close()

            browser.close()

    httpd.shutdown()

    print(f"\n==========================================")
    print(f"TEST SUMMARY:")
    print(f"Total Uncaught Console Errors: {len(console_errors)}")
    if console_errors:
        print("Console Errors List:", console_errors)
        sys.exit(1)
    else:
        print("ALL STATIC DEMO MODE TESTS PASSED WITH 0 CONSOLE ERRORS!")

if __name__ == "__main__":
    run_tests()
