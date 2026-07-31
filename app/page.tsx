"use client";

import { useEffect, useRef, useState } from "react";
import {
  assets,
  cultureItems,
  developmentMilestones,
  factoryFacts,
  honorWallItems,
  metrics,
  overview,
  productGroups,
  trainingItems,
  type DashboardAsset,
} from "./foherb-content";

const DESIGN_WIDTH = 2048;
const DESIGN_HEIGHT = 1875;
const METRIC_ANIMATION_DURATION = 1800;

/** 根据视口计算完整设计画布的缩放比例，返回用于布局的缩放值。 */
function useDashboardScale() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const next = Math.min(
        window.innerWidth / DESIGN_WIDTH,
        window.innerHeight / DESIGN_HEIGHT,
      );
      setScale(Math.max(next, 0.12));
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return scale;
}

/** 将当前时间格式化为参考大屏使用的日期、时间和星期文本。 */
function useClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // 首帧后再读取本地时间，避免服务端与浏览器时区造成水合差异。
    const frame = window.requestAnimationFrame(() => setNow(new Date()));
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };
  }, []);

  if (!now) {
    return { date: "---- -- --", time: "--:--:--", week: "星期-" };
  }

  const pad = (value: number) => String(value).padStart(2, "0");
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const week = `星期${"日一二三四五六"[now.getDay()]}`;
  return { date, time, week };
}

/** 首屏生成统一的数字增长进度；减少动态效果时直接返回完成状态。 */
function useMetricAnimationProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frame = window.requestAnimationFrame(() => setProgress(1));
      return () => window.cancelAnimationFrame(frame);
    }

    let startedAt: number | null = null;
    const animate = (timestamp: number) => {
      startedAt ??= timestamp;
      const linearProgress = Math.min(
        (timestamp - startedAt) / METRIC_ANIMATION_DURATION,
        1,
      );
      // 三次缓出使数字前段增长明显、接近目标时自然减速。
      setProgress(1 - (1 - linearProgress) ** 3);
      if (linearProgress < 1) {
        frame = window.requestAnimationFrame(animate);
      }
    };

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return progress;
}

/** 按原始千分位、小数精度和单位格式化当前动画数值。 */
function formatAnimatedMetric(value: string, progress: number) {
  const match = value.match(/^([\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) return value;

  const [, numericText, suffix] = match;
  const target = Number(numericText.replaceAll(",", ""));
  const decimalPlaces = numericText.split(".")[1]?.length ?? 0;
  const precision = 10 ** decimalPlaces;
  const current =
    progress >= 1
      ? target
      : Math.round(target * progress * precision) / precision;

  return `${current.toLocaleString("zh-CN", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  })}${suffix}`;
}

function AnimatedMetricValue({
  value,
  progress,
}: {
  value: string;
  progress: number;
}) {
  return (
    <strong className="metric-number" aria-label={value}>
      <span className="metric-number-space" aria-hidden="true">{value}</span>
      <span className="metric-number-live" aria-hidden="true">
        {formatAnimatedMetric(value, progress)}
      </span>
    </strong>
  );
}

function Panel({
  title,
  className = "",
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`panel ${className}`}>
      <h2 className="panel-title">{title}</h2>
      <div className="panel-body">{children}</div>
    </section>
  );
}

/** 将已授权的本地素材按固定比例展示，输入素材配置与样式名，无返回数据副作用。 */
function MediaFrame({
  asset,
  className = "",
}: {
  asset: DashboardAsset;
  className?: string;
}) {
  return (
    <figure className={`media-frame ${className}`}>
      <img src={asset.src} alt={asset.alt} />
      <figcaption>{asset.alt}</figcaption>
    </figure>
  );
}

function Donut({ label }: { label: string }) {
  return (
    <div className="donut" aria-label={label}>
      <div className="donut-hole">{label}</div>
    </div>
  );
}

type GlobePoint = {
  lat: number;
  lng: number;
  name: string;
  color: string;
};

type GlobeArc = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string[];
};

type GlobeMarker = {
  lat: number;
  lng: number;
  name: string;
  description: string;
};

type CountryFeature = {
  id?: string | number;
  properties?: { name?: string };
  geometry: object;
};

const globePoints: GlobePoint[] = [
  { lat: 39.08, lng: 117.2, name: "天津总部", color: "#ffd778" },
  { lat: 55.17, lng: 23.88, name: "立陶宛", color: "#33dcff" },
  { lat: 39.5, lng: -98.35, name: "北美洲", color: "#33dcff" },
  { lat: 5.2, lng: 20.1, name: "非洲", color: "#33dcff" },
];

const globeArcs: GlobeArc[] = globePoints.slice(1).map((point) => ({
  startLat: globePoints[0].lat,
  startLng: globePoints[0].lng,
  endLat: point.lat,
  endLng: point.lng,
  color: ["rgba(42, 215, 255, 0.18)", "rgba(42, 215, 255, 0.95)"],
}));

const globeMarkers: GlobeMarker[] = [
  {
    lat: 39.08,
    lng: 117.2,
    name: "天津总部",
    description: "全球运营总部",
  },
  {
    lat: 55.17,
    lng: 23.88,
    name: "立陶宛",
    description: "欧洲业务覆盖",
  },
  {
    lat: 5.2,
    lng: 20.1,
    name: "非洲",
    description: "业务覆盖区域",
  },
  {
    lat: 39.5,
    lng: -98.35,
    name: "北美洲",
    description: "业务覆盖区域",
  },
];

/** 创建带国家边界、夜景纹理和全球飞线的 Three.js 地球，无输入参数与返回值。 */
function GlobeVisualization() {
  const globeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = globeRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let disposed = false;
    let globe: import("globe.gl").GlobeInstance | null = null;

    const initializeGlobe = async () => {
      // 地球引擎和国家数据仅在浏览器端加载，避免静态导出阶段访问 WebGL。
      const [{ default: Globe }, { feature }, atlasModule] = await Promise.all([
        import("globe.gl"),
        import("topojson-client"),
        import("world-atlas/countries-110m.json"),
      ]);
      if (disposed) return;

      const atlas = atlasModule.default;
      const countries = feature(
        atlas as never,
        atlas.objects.countries as never,
      ) as unknown as { features: CountryFeature[] };

      globe = new Globe(container, {
        animateIn: false,
        rendererConfig: { alpha: true, antialias: true },
      })
        .width(780)
        .height(780)
        .backgroundColor("rgba(0, 0, 0, 0)")
        .globeImageUrl("./earth-night.jpg")
        .showGraticules(true)
        .showAtmosphere(true)
        .atmosphereColor("#00b9ff")
        .atmosphereAltitude(0.16)
        .polygonsData(countries.features)
        .polygonCapColor((item) =>
          String((item as CountryFeature).id) === "156"
            ? "rgba(20, 188, 255, 0.48)"
            : "rgba(8, 76, 126, 0.2)",
        )
        .polygonSideColor(() => "rgba(7, 52, 91, 0.18)")
        .polygonStrokeColor(() => "rgba(94, 222, 255, 0.68)")
        .polygonAltitude(0.007)
        .polygonLabel(
          (item) => (item as CountryFeature).properties?.name ?? "国家/地区",
        )
        .polygonsTransitionDuration(0)
        .pointsData(globePoints)
        .pointLat("lat")
        .pointLng("lng")
        .pointColor("color")
        .pointRadius((item) =>
          (item as GlobePoint).name === "天津总部" ? 0.42 : 0.25,
        )
        .pointAltitude(0.025)
        .pointLabel("name")
        .pointsTransitionDuration(0)
        .arcsData(globeArcs)
        .arcStartLat("startLat")
        .arcStartLng("startLng")
        .arcEndLat("endLat")
        .arcEndLng("endLng")
        .arcColor("color")
        .arcStroke(0.52)
        .arcAltitudeAutoScale(0.32)
        .arcDashLength(0.42)
        .arcDashGap(0.18)
        .arcDashAnimateTime(2_200)
        .arcsTransitionDuration(0)
        .htmlElementsData(globeMarkers)
        .htmlLat("lat")
        .htmlLng("lng")
        .htmlAltitude(0.045)
        .htmlElement((item) => {
          const marker = item as GlobeMarker;
          const element = document.createElement("div");
          const dot = document.createElement("i");
          const connector = document.createElement("span");
          const label = document.createElement("strong");
          const description = document.createElement("small");

          // HTML 标注由地球引擎绑定经纬度，旋转时始终贴合对应坐标。
          element.className =
            marker.name === "天津总部"
              ? "globe-marker headquarters"
              : "globe-marker coverage-marker";
          dot.className = "globe-marker-dot";
          connector.className = "globe-marker-connector";
          label.className = "globe-marker-label";
          label.textContent = marker.name;
          description.textContent = marker.description;
          label.append(description);
          element.append(dot, connector, label);
          return element;
        })
        .htmlElementVisibilityModifier((element, isVisible) => {
          element.classList.toggle("is-hidden", !isVisible);
        })
        .htmlTransitionDuration(0)
        // 拉近镜头，让地球成为全球市场版图的视觉主体。
        .pointOfView({ lat: 24, lng: 108, altitude: 1.45 }, 0);

      const controls = globe.controls();
      controls.autoRotate = !reducedMotion;
      controls.autoRotateSpeed = 0.42;
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
    };
    void initializeGlobe();

    return () => {
      disposed = true;
      globe?._destructor();
      container.replaceChildren();
    };
  }, []);

  return (
    <div className="globe-visualization">
      <div
        ref={globeRef}
        className="globe-canvas"
        aria-label="可拖拽旋转的全球市场三维地球"
      />
    </div>
  );
}

/** 渲染可无缝纵向循环的荣誉列表，输入来自公开荣誉配置，无业务数据副作用。 */
function HonorWall() {
  const loopItems = [...honorWallItems, ...honorWallItems];

  return (
    <div className="honor-marquee" aria-label="企业荣誉自动滚动列表">
      <div className="honor-track">
        {loopItems.map(([icon, title, category], index) => (
          <div className="honor-item" key={`${title}-${index}`}>
            <i>{icon}</i>
            <span>{title}</span>
            <b>{category}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const scale = useDashboardScale();
  const clock = useClock();
  const metricProgress = useMetricAnimationProgress();

  return (
    <main
      className="viewport"
      style={{ width: DESIGN_WIDTH * scale, height: DESIGN_HEIGHT * scale }}
    >
      <div
        className="dashboard"
        style={{ transform: `scale(${scale})` }}
      >
        <header className="topbar">
          <div className="brand">
            <img className="brand-logo" src={assets.logo.src} alt={assets.logo.alt} />
          </div>
          <div className="headline">
            <h1>和治友德全球健康产业实力数据中心</h1>
            <p>始于2007 · 服务全球健康市场　 弘扬养生文化，造福人类健康</p>
          </div>
          <time className="clock">
            <strong suppressHydrationWarning>{clock.date} {clock.time}</strong>
            <span suppressHydrationWarning>{clock.week}</span>
          </time>
        </header>

        <section className="metrics" aria-label="核心指标">
          {metrics.map(([icon, value, label]) => (
            <article className="metric-card" key={label}>
              <div className="metric-value">
                <span className="metric-icon">{icon}</span>
                <AnimatedMetricValue value={value} progress={metricProgress} />
              </div>
              <p>{label}</p>
              <span className="metric-glow" />
            </article>
          ))}
        </section>

        <section className="main-grid">
          <div className="left-column">
            <Panel title="企业概况" className="overview-panel">
              <div className="info-list">
                {overview.map(([icon, label, value]) => (
                  <div className="info-row" key={label}>
                    <span className="row-icon">{icon}</span>
                    <b>{label}</b>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="全球运营总部（2021年正式启用）" className="hq-panel">
              <div className="hq-summary">
                <MediaFrame asset={assets.headquarters} />
                <div className="big-number">
                  <span>总部面积</span>
                  <strong>32,970.6<small>㎡</small></strong>
                </div>
              </div>
              <div className="mini-stats">
                <div><span>综合办公区</span><strong>8,800㎡</strong></div>
                <div><span>国际会议中心</span><strong>5,861㎡</strong></div>
                <div><span>智能仓储</span><strong>7,970㎡</strong></div>
              </div>
              <h3 className="subhead">五大中心</h3>
              <div className="center-icons">
                {["研发品控", "客户服务", "人才培训", "物流配送", "金融服务"].map((item) => (
                  <div key={item}><i>◇</i><span>{item}<br />中心</span></div>
                ))}
              </div>
            </Panel>

            <Panel title="企业文化与三大养生学说" className="people-panel">
              <div className="people-wrap">
                <div className="simple-list">
                  {cultureItems.map(([label, value]) => (
                    <div key={label}><span>◉ {label}</span><b>{value}</b></div>
                  ))}
                </div>
                <Donut label={"精 · 气 · 神\n三大养生\n理论体系"} />
              </div>
            </Panel>

            <Panel title="培训赋能体系" className="training-panel">
              <div className="training-grid">
                {trainingItems.map(([title, detail]) => (
                  <div key={title}><i>▣</i><span>{title}</span><b>{detail}</b></div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="center-column">
            <Panel title="全球市场版图" className="market-panel">
              <div className="legend">
                <span><i className="red-dot" />分公司</span>
                <span><i className="gold-dot" />服务中心</span>
                <span><i className="blue-dot" />经销服务网点</span>
              </div>
              <div className="map-stage">
                <GlobeVisualization />
              </div>
              <div className="market-ticker">
                <h3>全球发展节点</h3>
                {developmentMilestones.map(([year, event]) => (
                  <div key={year}><span>{year}</span><b>{event}</b></div>
                ))}
              </div>
              <div className="coverage">
                <strong>全球业务覆盖：<em>4大洲</em></strong>
                <span>产品研发体系　<em>3大系统</em></span>
                <span>产学研合作　<em>3所院校</em></span>
                <span>官网荣誉记录　<em>29项</em></span>
              </div>
            </Panel>

          </div>

          <div className="right-column">
            <Panel title="智能制造与生产基地" className="factory-base-panel">
              <MediaFrame asset={assets.factoryRobot} className="factory-base-photo" />
              <div className="factory-stats">
                {factoryFacts.map(([label, value]) => (
                  <div key={label}><span>{label}</span><b>{value}</b></div>
                ))}
              </div>
              <div className="factory-system">
                <strong>智能制造体系</strong>
                <span>自动化生产</span>
                <span>质量体系把关</span>
                <span>现代仓储物流</span>
              </div>
            </Panel>

            <Panel title="生产流程" className="production-panel">
              <div className="process-flow">
                {["原料检测", "生产制造", "质量控制", "成品检验", "仓储物流"].map((item, index) => (
                  <div className="flow-item" key={item}>
                    <i>⌬</i><span>{item}</span>{index < 4 && <b>→</b>}
                  </div>
                ))}
              </div>
              <div className="factory-images">
                <MediaFrame asset={assets.factoryLine} />
                <MediaFrame asset={assets.factoryRobot} />
                <MediaFrame asset={assets.deviceLine} />
              </div>
              <div className="production-quality">
                <div><b>ISO 9001</b><span>质量管理体系</span></div>
                <div><b>HACCP</b><span>食品安全体系</span></div>
                <div><b>多条</b><span>自动化生产线</span></div>
              </div>
            </Panel>
          </div>
        </section>

        <section className="bottom-grid">
          <Panel title="产品矩阵（4大产品体系）" className="products-panel">
            <div className="product-grid">
              {productGroups.map((group, index) => (
                <article className="product-card" key={group.title}>
                  <h3><i>{["♧", "◇", "♤", "❈"][index]}</i>{group.title}</h3>
                  <div className="product-content">
                    <MediaFrame asset={group.image} />
                    <p><b>{group.summary}</b><br />{group.details.map((detail) => (
                      <span key={detail}>{detail}<br /></span>
                    ))}</p>
                  </div>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title="荣誉墙（官网公开29条记录）" className="honor-panel">
            <HonorWall />
          </Panel>
        </section>

        <footer className="footer">
          <span>资料口径：企业官网及政府公开信息</span>
          <span>注：规划目标不代表已实现成果，产品信息不构成医疗或功效承诺</span>
        </footer>
      </div>
    </main>
  );
}
