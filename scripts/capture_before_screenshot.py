from playwright.sync_api import sync_playwright

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:3000", wait_until="domcontentloaded")
        page.wait_for_timeout(2000)

        if page.locator("input[name='username']").count() > 0:
            page.fill("input[name='username']", "officer")
            page.fill("input[name='password']", "officer123")
            page.click("button[type='submit']")
            page.wait_for_timeout(2000)

        # Open GIS Map
        map_btn = page.locator("button:has-text('Bhu-Naksha'), a:has-text('Bhu-Naksha')").first
        if map_btn.count() > 0:
            map_btn.click()
            page.wait_for_timeout(2500)

        page.screenshot(path="screen_map_before.png")
        print("✓ Saved screen_map_before.png")
        browser.close()

if __name__ == "__main__":
    main()
