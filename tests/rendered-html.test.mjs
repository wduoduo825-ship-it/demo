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
  assert.match(html, /研发与科技实力/);
  assert.match(html, /产品矩阵/);
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
});
