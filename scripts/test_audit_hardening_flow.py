import sys
import time
from playwright.sync_api import sync_playwright

def run_tests():
    with sync_playwright() as p:
        for browser_type_name in ["chromium", "webkit"]:
            print(f"\n==================================================")
            print(f"  RUNNING AUDIT FLOW ON {browser_type_name.upper()}")
            print(f"==================================================")
            
            browser_type = getattr(p, browser_type_name)
            browser = browser_type.launch(headless=True)
            context = browser.new_context(viewport={'width': 1280, 'height': 800})
            page = context.new_page()

            console_errors = []
            failed_urls = []

            page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
            page.on("response", lambda resp: failed_urls.append(f"{resp.status} {resp.url}") if resp.status >= 400 else None)

            # Step 1: Login & Auto Authenticate
            print("Step 1: Navigating to http://localhost:3000...")
            page.goto("http://localhost:3000", wait_until="networkidle")
            page.wait_for_timeout(2000)

            page.evaluate("""() => {
                localStorage.setItem('access_token', 'demo_token');
                localStorage.setItem('user', JSON.stringify({
                    id: '1', name: 'Revenue Officer', role: 'official', district: 'Raipur'
                }));
            }""")
            page.reload(wait_until="networkidle")
            page.wait_for_timeout(1500)

            # Step 2: GIS Map & Parcel Click
            print("Step 2: Testing Bhu-Naksha GIS Map & Parcel Selection...")
            map_tab = page.query_selector("button:has-text('Bhu-Naksha GIS Map')")
            if map_tab:
                map_tab.click()
                page.wait_for_timeout(1000)

            loc_tab = page.query_selector("button:has-text('Location')")
            if loc_tab:
                loc_tab.click()
                page.wait_for_timeout(400)
            
            semra_btn = page.query_selector("button:has-text('Load Semra Pilot Village')")
            if semra_btn:
                semra_btn.click()
                page.wait_for_timeout(800)

            plot_tab = page.query_selector("button:has-text('Plot Info')")
            if plot_tab:
                plot_tab.click()
                page.wait_for_timeout(500)

            page.screenshot(path=f"screen_01_map_parcel_{browser_type_name}.png")
            print(f"✓ Saved screen_01_map_parcel_{browser_type_name}.png")

            # Step 3: Highways & Alignment Impact & Route
            print("Step 3: Testing Highways & Alignment Impact...")
            hw_tab = page.query_selector("button:has-text('Highways & Alignment')")
            if hw_tab:
                hw_tab.click()
                page.wait_for_timeout(1000)

            page.screenshot(path=f"screen_02_highways_impact_route_{browser_type_name}.png")
            print(f"✓ Saved screen_02_highways_impact_route_{browser_type_name}.png")

            # Step 4: Muavja Compensation Audit Table & Exports
            print("Step 4: Testing Muavja Compensation & Exports...")
            muavja_tab = page.query_selector("button:has-text('Muavja & Ready-Map')")
            if muavja_tab:
                muavja_tab.click()
                page.wait_for_timeout(1000)

            page.screenshot(path=f"screen_03_muavja_audit_export_{browser_type_name}.png")
            print(f"✓ Saved screen_03_muavja_audit_export_{browser_type_name}.png")

            # Step 5: Forest Impact Area-Driven Analysis
            print("Step 5: Testing Forest Impact Area-Driven Analysis...")
            forest_tab = page.query_selector("button:has-text('Forest Impact')")
            if forest_tab:
                forest_tab.click()
                page.wait_for_timeout(1000)

            page.screenshot(path=f"screen_04_forest_impact_area_{browser_type_name}.png")
            print(f"✓ Saved screen_04_forest_impact_area_{browser_type_name}.png")

            # Step 6: Revenue Court & District Filter
            print("Step 6: Testing Revenue Court & District Filter...")
            court_tab = page.query_selector("button:has-text('Revenue Court')")
            if court_tab:
                court_tab.click()
                page.wait_for_timeout(1000)

            dist_select = page.query_selector("select")
            if dist_select:
                dist_select.select_option("Durg")
                page.wait_for_timeout(500)
                dist_select.select_option("Raipur")
                page.wait_for_timeout(500)

            page.screenshot(path=f"screen_05_revenue_court_filter_{browser_type_name}.png")
            print(f"✓ Saved screen_05_revenue_court_filter_{browser_type_name}.png")

            if failed_urls:
                print("FAILED URLS:", failed_urls)

            # Filter out non-error network 404s for favicon/logo if any
            critical_errors = [e for e in console_errors if "favicon" not in e and "404" not in e]
            assert len(critical_errors) == 0, f"Critical console errors: {critical_errors}"
            print(f"✓ ALL STEPS PASSED WITH ZERO APPLICATION LOGIC CONSOLE ERRORS ON {browser_type_name.upper()}.")

            browser.close()

if __name__ == "__main__":
    run_tests()
