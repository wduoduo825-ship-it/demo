import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

test("renders the exported health industry dashboard", async () => {
  // 直接验证 GitHub Pages 实际部署的静态产物。
  const html = await readFile(
    new URL("../pages/index.html", import.meta.url),
    "utf8",
  );
  assert.match(html, /<title>和治友德全球健康产业实力数据中心<\/title>/i);
  assert.match(html, /全球市场版图/);
  assert.match(html, /class="globe-canvas"/);
  assert.match(html, /智能制造与生产基地/);
  assert.match(html, /产品矩阵/);
  assert.match(html, /class="metric-number-live"/);
  const metricSection = html.match(
    /<section class="metrics"[\s\S]*?<\/section>/,
  )?.[0];
  assert.ok(metricSection, "missing exported metric section");
  assert.equal(
    (metricSection.match(/class="metric-card"/g) ?? []).length,
    7,
  );
  assert.doesNotMatch(metricSection, /产学研合作院校|2,007年/);
  assert.match(html, /\/demo\/assets\/page-[\w-]+\.js/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);

  const foherbAssets = await readdir(
    new URL("../pages/foherb/", import.meta.url),
  );
  for (const asset of [
    "logo.png",
    "hq.webp",
    "factory-line.webp",
    "factory-robot.webp",
    "product-zinc.webp",
    "honor-wef.webp",
    "charity-2020.webp",
  ]) {
    assert.ok(foherbAssets.includes(asset), `missing exported asset: ${asset}`);
  }

  // 验证客户端实际渲染的新布局，避免旧静态骨架掩盖模块替换结果。
  const pageAssets = await readdir(new URL("../pages/assets/", import.meta.url));
  const pageBundle = pageAssets.find((asset) => /^page-.+\.js$/.test(asset));
  assert.ok(pageBundle, "missing exported page bundle");
  const pageCode = await readFile(
    new URL(`../pages/assets/${pageBundle}`, import.meta.url),
    "utf8",
  );
  assert.match(pageCode, /智能制造与生产基地/);
  assert.match(pageCode, /生产流程/);
  assert.match(pageCode, /metric-number-live/);
  assert.match(pageCode, /prefers-reduced-motion: reduce/);
  assert.match(pageCode, /32,970\.6㎡/);
  assert.match(pageCode, /useGrouping/);
  assert.doesNotMatch(pageCode, /产学研合作院校/);
  assert.doesNotMatch(pageCode, /欧洲区域|美洲区域|亚洲区域|非洲区域/);
  assert.doesNotMatch(pageCode, /研发与科技实力|企业荣誉与科技资质/);
});
