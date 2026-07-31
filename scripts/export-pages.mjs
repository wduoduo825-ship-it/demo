import {
  copyFile,
  cp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";

const clientAssets = new URL("../dist/client/assets/", import.meta.url);
const pagesRoot = new URL("../pages/", import.meta.url);

/** 转义静态骨架中的指标文本，避免配置内容被解释为 HTML。 */
function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** 从现有指标配置生成与客户端首帧一致的静态 HTML。 */
async function renderMetricsSkeleton() {
  const source = await readFile(
    new URL("../app/foherb-content.ts", import.meta.url),
    "utf8",
  );
  const block = source.match(/export const metrics = \[([\s\S]*?)\] as const;/);
  if (!block) throw new Error("无法读取核心指标配置");

  const entries = [...block[1].matchAll(/\["([^"]+)", "([^"]+)", "([^"]+)"\]/g)];
  if (!entries.length) throw new Error("核心指标配置为空");

  const cards = entries.map(([, icon, value, label]) => {
    const numeric = value.match(/^([\d,]+(?:\.(\d+))?)(.*)$/);
    const initialValue = numeric
      ? `${numeric[2] ? `0.${"0".repeat(numeric[2].length)}` : "0"}${numeric[3]}`
      : value;
    return `<article class="metric-card"><div class="metric-value"><span class="metric-icon">${escapeHtml(icon)}</span><strong class="metric-number" aria-label="${escapeHtml(value)}"><span class="metric-number-space" aria-hidden="true">${escapeHtml(value)}</span><span class="metric-number-live" aria-hidden="true">${escapeHtml(initialValue)}</span></strong></div><p>${escapeHtml(label)}</p><span class="metric-glow"></span></article>`;
  });

  return `<section class="metrics" aria-label="核心指标">${cards.join("")}</section>`;
}

/**
 * 用已验证的静态页面骨架更新构建资源，返回值写入 pages/index.html。
 * 这样可避开 vinext 当前 SSR 导出器对浏览器预加载代码的误执行。
 */
async function exportGitHubPages() {
  const manifest = JSON.parse(
    await readFile(
      new URL("../dist/client/.vite/manifest.json", import.meta.url),
      "utf8",
    ),
  );
  const assetFiles = await readdir(clientAssets);
  const cssFile = assetFiles.find((file) => /^index-.+\.css$/.test(file));
  const chunkFiles = {
    framework: manifest["_framework-DjPHiq1u.js"].file.split("/").pop(),
    runtime: manifest["_rolldown-runtime-S-ySWqyJ.js"].file.split("/").pop(),
    entry: manifest["virtual:vinext-app-browser-entry"].file.split("/").pop(),
    page: manifest["app/page.tsx"].file.split("/").pop(),
    layout:
      manifest["node_modules/vinext/dist/shims/layout-segment-context.js"].file
        .split("/")
        .pop(),
  };

  let html = await readFile(new URL("index.html", pagesRoot), "utf8");
  const metricsSkeleton = await renderMetricsSkeleton();

  // 同步当前指标骨架并保留客户端水合资源，避免 GitHub 首屏短暂显示旧数据。
  html = html
    .replace(
      /<section class="metrics" aria-label="核心指标">[\s\S]*?<\/section><section class="main-grid">/,
      `${metricsSkeleton}<section class="main-grid">`,
    )
    .replace(/framework-[\w-]+\.js/g, chunkFiles.framework)
    .replace(/rolldown-runtime-[\w-]+\.js/g, chunkFiles.runtime)
    .replace(/layout-segment-context-[\w-]+\.js/g, chunkFiles.layout)
    .replace(/page-[\w-]+\.js/g, chunkFiles.page)
    .replace(/index-[\w-]+\.js/g, chunkFiles.entry)
    .replace(/index-[\w-]+\.css/g, cssFile)
    .replace(
      /<time class="clock"><strong>.*?<\/strong><span>.*?<\/span><\/time>/,
      '<time class="clock"><strong>---- -- -- --:--:--</strong><span>星期-</span></time>',
    )
    .replace(/(["'])\/assets\//g, "$1/demo/assets/")
    .replace(
      /(?:https:\/\/wduoduo825-ship-it\.github\.io|http:\/\/localhost)\/og\.png/g,
      "https://wduoduo825-ship-it.github.io/demo/og.png",
    );

  await mkdir(pagesRoot, { recursive: true });
  await rm(new URL("assets/", pagesRoot), { recursive: true, force: true });
  await cp(clientAssets, new URL("assets/", pagesRoot), { recursive: true });
  await writeFile(new URL("index.html", pagesRoot), html, "utf8");
  await writeFile(new URL(".nojekyll", pagesRoot), "", "utf8");
  await copyFile(
    new URL("../public/earth-night.jpg", import.meta.url),
    new URL("earth-night.jpg", pagesRoot),
  );
  // 将已授权的企业本地素材一并导出，GitHub Pages 不依赖官网热链。
  await rm(new URL("foherb/", pagesRoot), { recursive: true, force: true });
  await cp(
    new URL("../public/foherb/", import.meta.url),
    new URL("foherb/", pagesRoot),
    { recursive: true },
  );
  try {
    await copyFile(
      new URL("../public/og.png", import.meta.url),
      new URL("og.png", pagesRoot),
    );
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    // 远端精简源码不携带大图时，保留一个有效 PNG，避免分享图片地址返回 404。
    const fallbackPng =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
    await writeFile(
      new URL("og.png", pagesRoot),
      Buffer.from(fallbackPng, "base64"),
    );
  }
}

await exportGitHubPages();
