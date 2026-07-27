import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";

const projectRoot = new URL("../", import.meta.url);
const clientAssets = new URL("../dist/client/assets/", import.meta.url);
const pagesRoot = new URL("../pages/", import.meta.url);

/**
 * 将服务端渲染结果转换成不依赖运行时的 GitHub Pages 页面。
 * 输入来自当前 dist 构建，返回值写入 pages/index.html。
 */
async function exportGitHubPages() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("export", Date.now().toString());
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("https://wduoduo825-ship-it.github.io/"),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  if (!response.ok) {
    throw new Error(`静态页面渲染失败：${response.status}`);
  }

  const assetFiles = await readdir(clientAssets);
  const cssFile = assetFiles.find((file) => file.endsWith(".css"));
  if (!cssFile) {
    throw new Error("未找到构建后的样式文件");
  }

  const css = await readFile(new URL(cssFile, clientAssets), "utf8");
  let html = await response.text();

  // GitHub Pages 版本直接内联样式与缩放脚本，避免依赖服务端和 React 水合资源。
  html = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<link\b[^>]*rel=["'](?:stylesheet|modulepreload)["'][^>]*>/gi, "")
    .replace(
      /(?:https:\/\/wduoduo825-ship-it\.github\.io|http:\/\/localhost)\/og\.png/g,
      "https://wduoduo825-ship-it.github.io/demo/og.png",
    )
    .replace("</head>", `<style>${css}</style></head>`)
    .replace(
      "</body>",
      `<script>
(() => {
  const width = 2048;
  const height = 1875;
  const viewport = document.querySelector(".viewport");
  const dashboard = document.querySelector(".dashboard");
  const clock = document.querySelector(".clock");

  function updateScale() {
    const scale = Math.max(Math.min(innerWidth / width, innerHeight / height), 0.12);
    viewport.style.width = width * scale + "px";
    viewport.style.height = height * scale + "px";
    dashboard.style.transform = "scale(" + scale + ")";
  }

  function updateClock() {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    const date = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
    const time = pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
    const week = "星期" + "日一二三四五六"[now.getDay()];
    clock.innerHTML = "<strong>" + date + " " + time + "</strong><span>" + week + "</span>";
  }

  updateScale();
  updateClock();
  addEventListener("resize", updateScale);
  setInterval(updateClock, 1000);
})();
</script></body>`,
    );

  await mkdir(pagesRoot, { recursive: true });
  await writeFile(new URL("index.html", pagesRoot), html, "utf8");
  await writeFile(new URL(".nojekyll", pagesRoot), "", "utf8");
  await copyFile(
    new URL("../public/og.png", import.meta.url),
    new URL("og.png", pagesRoot),
  );
}

await exportGitHubPages();
