import sys
import time
from playwright.sync_api import sync_playwright

def run_tests():
    with sync_playwright() as p:
        for browser_type_name in ["chromium", "webkit"]:
            print(f"\n==========================================")
            print(f"  RUNNING MODAL TESTS ON {browser_type_name.upper()}")
            print(f"==========================================")
            
            browser_type = getattr(p, browser_type_name)
            browser = browser_type.launch(headless=True)
            context = browser.new_context(viewport={'width': 1280, 'height': 800})
            page = context.new_page()

            # Listen for console errors
            console_errors = []
            page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

            print(f"Navigating to http://localhost:3000...")
            page.goto("http://localhost:3000", wait_until="networkidle")
            page.wait_for_timeout(2000)

            # Check if splash or landing or login screen is shown
            # Set localStorage user to bypass login
            page.evaluate("""() => {
                localStorage.setItem('access_token', 'demo_token');
                localStorage.setItem('user', JSON.stringify({
                    id: '1', name: 'Demo Officer', role: 'official', district: 'Raipur'
                }));
            }""")
            page.reload(wait_until="networkidle")
            page.wait_for_timeout(1500)

            # Click Land Map tab if not already active
            map_tab = page.query_selector("button:has-text('Bhu-Naksha GIS Map'), button:has-text('Bhu-Naksha Map'), button:has-text('Land Map')")
            if map_tab:
                map_tab.click()
                page.wait_for_timeout(1000)

            # Ensure Plot Info tab is selected in BhunakshaSidebar
            plot_tab = page.query_selector("button:has-text('Plot Info')")
            if plot_tab:
                plot_tab.click()
                page.wait_for_timeout(500)

            # Check if a parcel is selected or click pilot village button
            khasra_btn = page.query_selector("button:has-text('Khasra Vivran')")
            if not khasra_btn:
                # Switch to Location tab in sidebar to click Semra pilot village button
                loc_tab = page.query_selector("button:has-text('Location')")
                if loc_tab:
                    loc_tab.click()
                    page.wait_for_timeout(500)
                
                semra_btn = page.query_selector("button:has-text('Load Semra Pilot Village')")
                if semra_btn:
                    semra_btn.click()
                    page.wait_for_timeout(800)

                if plot_tab:
                    plot_tab.click()
                    page.wait_for_timeout(500)

                khasra_btn = page.query_selector("button:has-text('Khasra Vivran')")

            if not khasra_btn:
                print("Simulating parcel selection via map click...")
                canvas = page.query_selector(".leaflet-container")
                if canvas:
                    box = canvas.bounding_box()
                    page.mouse.click(box['x'] + box['width'] / 2, box['y'] + box['height'] / 2)
                    page.wait_for_timeout(1000)

                if plot_tab:
                    plot_tab.click()
                    page.wait_for_timeout(500)
                khasra_btn = page.query_selector("button:has-text('Khasra Vivran')")

            assert khasra_btn is not None, "Khasra Vivran button should be visible"
            print("✓ Found 'Khasra Vivran' button.")

            # TEST 1: Open modal & check X button
            khasra_btn.click()
            page.wait_for_timeout(500)

            # Verify dialog is open
            modal = page.query_selector("div[role='dialog']")
            assert modal is not None, "Modal with role='dialog' should be open"
            print("✓ Modal opened successfully.")

            # Verify DEMO DATA badge inside modal
            demo_badge = page.query_selector("text=DEMO DATA")
            assert demo_badge is not None, "DEMO DATA ribbon/badge should be visible inside modal"
            print("✓ DEMO DATA badge is present.")

            # Save screenshot of modal with X button visible
            screenshot_path = f"modal_x_button_{browser_type_name}.png"
            page.screenshot(path=screenshot_path)
            print(f"✓ Saved screenshot to {screenshot_path}")

            # Verify top-right X button exists and has aria-label="Close record"
            x_btn = page.query_selector("button[aria-label='Close record']")
            assert x_btn is not None, "Top-right X close button with aria-label='Close record' should exist"
            print("✓ Found top-right X close button.")

            # Click X button to close modal
            x_btn.click()
            page.wait_for_timeout(300)
            modal = page.query_selector("div[role='dialog']")
            assert modal is None, "Modal should close after clicking X button"
            print("✓ TEST 1 PASSED: Modal closed via X button.")

            # Verify background body overflow is restored
            overflow_style = page.evaluate("document.body.style.overflow")
            assert overflow_style != "hidden", "Body overflow lock should be removed on close"
            print("✓ Body scroll lock restored.")

            # TEST 2: Open again -> press Esc -> modal closes
            khasra_btn = page.query_selector("button:has-text('Khasra Vivran')")
            khasra_btn.click()
            page.wait_for_timeout(300)
            modal = page.query_selector("div[role='dialog']")
            assert modal is not None, "Modal should reopen"

            page.keyboard.press("Escape")
            page.wait_for_timeout(300)
            modal = page.query_selector("div[role='dialog']")
            assert modal is None, "Modal should close after pressing Esc key"
            print("✓ TEST 2 PASSED: Modal closed via Esc key.")

            # TEST 3: Open again -> click backdrop -> modal closes
            khasra_btn = page.query_selector("button:has-text('Khasra Vivran')")
            khasra_btn.click()
            page.wait_for_timeout(300)
            modal = page.query_selector("div[role='dialog']")
            assert modal is not None, "Modal should reopen"

            # Click on backdrop overlay
            backdrop = page.query_selector("div[role='presentation']")
            if backdrop:
                backdrop.click(position={'x': 10, 'y': 10})
            else:
                page.mouse.click(10, 10)
            
            page.wait_for_timeout(300)
            modal = page.query_selector("div[role='dialog']")
            assert modal is None, "Modal should close after clicking backdrop"
            print("✓ TEST 3 PASSED: Modal closed via dark backdrop click.")

            # TEST 4: Open again -> click secondary footer Close button -> modal closes
            khasra_btn = page.query_selector("button:has-text('Khasra Vivran')")
            khasra_btn.click()
            page.wait_for_timeout(300)

            footer_close_btn = page.query_selector("button:has-text('बंद करें / Close')")
            assert footer_close_btn is not None, "Secondary footer Close button should exist"
            footer_close_btn.click()
            page.wait_for_timeout(300)
            modal = page.query_selector("div[role='dialog']")
            assert modal is None, "Modal should close after clicking secondary footer close button"
            print("✓ TEST 4 PASSED: Modal closed via secondary footer Close button.")

            # Verify no console errors
            assert len(console_errors) == 0, f"Console errors: {console_errors}"
            print(f"✓ ALL TESTS PASSED WITH 0 CONSOLE ERRORS ON {browser_type_name.upper()}.")

            browser.close()

if __name__ == "__main__":
    run_tests()
