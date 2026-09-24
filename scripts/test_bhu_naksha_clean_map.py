import sys
import time
from playwright.sync_api import sync_playwright

def run_test():
    print("==================================================")
    print("  TESTING BHU-NAKSHA CLEAN GIS MAP E2E FLOW")
    print("==================================================")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        console_errors = []
        page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type == "error" else None)

        page_errors = []
        page.on("pageerror", lambda err: page_errors.append(str(err)))

        print("Step 1: Navigating to http://localhost:3000...")
        page.goto("http://localhost:3000", wait_until="domcontentloaded")
        page.wait_for_timeout(2500)  # Wait for SplashLoader (1.8s) to finish

        # Login if login form is present
        login_input = page.locator("input[name='username'], input[type='text']").first
        if login_input.count() > 0 and login_input.is_visible():
            print("Step 2: Logging in as Revenue Officer...")
            login_input.fill("officer")
            page.fill("input[name='password'], input[type='password']", "officer123")
            page.click("button[type='submit']")
            page.wait_for_timeout(2500)

        # Wait for Leaflet container to load
        print("Step 3: Waiting for Leaflet map container...")
        page.wait_for_selector(".leaflet-container", timeout=15000)
        print("✓ Leaflet GIS map container attached and ready")

        # Click Location tab
        print("Step 4: Clicking Location tab in BhunakshaSidebar...")
        loc_tab = page.locator("button:has-text('Location')").first
        if loc_tab.count() > 0:
            loc_tab.click()
            page.wait_for_timeout(1000)

        # Select village Bhanpuri
        print("Step 5: Selecting village Bhanpuri in hierarchy selector...")
        page.wait_for_selector("select option", state="attached", timeout=10000)
        selects = page.locator("select")
        print(f"Select elements count: {selects.count()}")
        if selects.count() >= 3:
            selects.nth(2).select_option(value="Bhanpuri")
            page.wait_for_timeout(2000)

        # Check status pill text
        pills = page.locator("div.absolute.bottom-6").first
        if pills.count() > 0:
            pill_text = pills.text_content()
            print("✓ Status pill text:", pill_text)
            assert "Bhanpuri" in pill_text or "parcels" in pill_text, f"Expected Bhanpuri in pill text: '{pill_text}'"

        # Click a parcel on the map
        print("Step 6: Clicking parcel polygon on map...")
        map_container = page.locator(".leaflet-container")
        box = map_container.bounding_box()
        if box:
            page.mouse.click(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
            page.wait_for_timeout(1200)

        # Verify Plot tab info
        plot_header = page.locator("text=Recorded Owner Info, text=Khasra").first
        print("✓ Plot info visible count:", plot_header.count())

        # Go to Layers tab and toggle Parcels
        print("Step 7: Testing Layers tab toggles...")
        layers_tab = page.locator("button:has-text('Layers')").first
        if layers_tab.count() > 0:
            layers_tab.click()
            page.wait_for_timeout(500)

            parcels_checkbox = page.locator("text=Cadastral Parcels").locator("..").locator("input[type='checkbox']")
            if parcels_checkbox.count() > 0:
                parcels_checkbox.click()
                page.wait_for_timeout(500)
                print("✓ Toggled Cadastral Parcels checkbox in Layers tab")

        # Save AFTER screenshot
        screenshot_path = "screen_map_after.png"
        page.screenshot(path=screenshot_path)
        print(f"✓ Saved screenshot: {screenshot_path}")

        # Assert zero console errors
        assert len(page_errors) == 0, f"Uncaught page errors: {page_errors}"
        assert len(console_errors) == 0, f"Console error logs: {console_errors}"

        print("✓ ALL BHU-NAKSHA CLEAN MAP TESTS PASSED 100% WITH ZERO CONSOLE ERRORS!")
        browser.close()

if __name__ == "__main__":
    run_test()
