const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // ビューポートサイズを設定
  await page.setViewportSize({ width: 1920, height: 1080 });

  // ページに移動
  await page.goto('http://localhost:3000');

  // ページが完全に読み込まれるまで待つ
  await page.waitForTimeout(2000);

  // スクリーンショットを撮影
  await page.screenshot({
    path: 'dashboard-screenshot.png',
    fullPage: true
  });

  console.log('Screenshot saved as dashboard-screenshot.png');

  await browser.close();
})();
