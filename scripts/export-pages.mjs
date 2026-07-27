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

  // 保留客户端水合资源，使 WebGL 地球在 GitHub Pages 上仍可旋转和拖拽。
  html = html
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
