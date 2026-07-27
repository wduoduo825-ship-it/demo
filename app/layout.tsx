import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

/** 根据当前请求域名生成分享图片的绝对地址，并返回站点元数据。 */
export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto");
  const protocol =
    forwardedProtocol ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;

  return {
    title: "和治友德全球健康产业实力数据中心",
    description: "全球健康产业实力、市场、研发、生产与服务数据展示大屏。",
    openGraph: {
      title: "和治友德全球健康产业实力数据中心",
      description: "全球健康产业实力、市场、研发、生产与服务数据展示大屏。",
      images: [{ url: imageUrl, width: 1672, height: 939 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "和治友德全球健康产业实力数据中心",
      description: "全球健康产业实力、市场、研发、生产与服务数据展示大屏。",
      images: [imageUrl],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
