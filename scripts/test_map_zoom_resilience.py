import sys
import time
from playwright.sync_api import sync_playwright

def run_test_for_browser(browser_name, p):
    print(f"\n==================================================")
    print(f"  TESTING MAP RESILIENCE & HIGH ZOOM ON {browser_name.upper()}")
    print(f"==================================================")

    browser_type = getattr(p, browser_name)
    browser = browser_type.launch(headless=True)
    page = browser.new_page()

    console_errors = []
    page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type == "error" else None)

    page_errors = []
    page.on("pageerror", lambda err: page_errors.append(str(err)))

    print("Step 1: Navigating to http://localhost:3000...")
    page.goto("http://localhost:3000", wait_until="domcontentloaded")
    page.wait_for_timeout(2000)

    # Login
    if page.locator("input[name='username'], input[type='text']").count() > 0:
        print("Step 2: Logging in as Revenue Officer...")
        page.fill("input[name='username'], input[type='text']", "officer")
        page.fill("input[name='password'], input[type='password']", "officer123")
        page.click("button[type='submit']")
        page.wait_for_timeout(2000)

    # Open GIS Map
    print("Step 3: Opening Bhu-Naksha GIS Map...")
    map_btn = page.locator("button:has-text('Bhu-Naksha'), a:has-text('Bhu-Naksha'), div:has-text('Bhu-Naksha GIS Map')").first
    if map_btn.count() > 0:
        map_btn.click()
        page.wait_for_timeout(2000)

    # Zoom in to max zoom step by step
    print("Step 4: Zooming in step by step to max zoom...")
    zoom_in = page.locator(".leaflet-control-zoom-in")
    for step in range(1, 10):
        if zoom_in.count() > 0 and zoom_in.is_visible():
            if "leaflet-disabled" in (zoom_in.get_attribute("class") or ""):
                print(f"Reached Leaflet maxZoom limit at step {step}")
                break
            zoom_in.click(force=True)
            page.wait_for_timeout(500)
            print(f"  Zoom step {step} complete")

    # Pan the map
    print("Step 5: Panning map across viewport...")
    map_container = page.locator(".leaflet-container")
    if map_container.count() > 0:
        box = map_container.bounding_box()
        if box:
            center_x = box["x"] + box["width"] / 2
            center_y = box["y"] + box["height"] / 2
            page.mouse.move(center_x, center_y)
            page.mouse.down()
            page.mouse.move(center_x + 100, center_y + 100, steps=5)
            page.mouse.up()
            page.wait_for_timeout(800)

    # Click on map / parcel
    print("Step 6: Clicking land parcel polygon on map...")
    if map_container.count() > 0:
        box = map_container.bounding_box()
        if box:
            page.mouse.click(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
            page.wait_for_timeout(1000)

    # Capture screenshot
    screenshot_path = f"screen_map_max_zoom_{browser_name}.png"
    page.screenshot(path=screenshot_path)
    print(f"✓ Saved screenshot: {screenshot_path}")

    # Assertions
    assert len(page_errors) == 0, f"Uncaught page errors on {browser_name}: {page_errors}"
    assert len(console_errors) == 0, f"Console error logs on {browser_name}: {console_errors}"
    assert map_container.is_visible(), f"Map container disappeared on {browser_name}"

    print(f"✓ ALL MAP RESILIENCE TESTS PASSED 100% ON {browser_name.upper()}!")
    browser.close()

def main():
    with sync_playwright() as p:
        run_test_for_browser("chromium", p)
        run_test_for_browser("webkit", p)

if __name__ == "__main__":
    main()
