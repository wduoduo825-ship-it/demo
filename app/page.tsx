"use client";

import { useEffect, useRef, useState } from "react";
import {
  assets,
  charityMilestones,
  cultureItems,
  developmentMilestones,
  factoryFacts,
  honorItems,
  honorTimeline,
  metrics,
  overview,
  productGroups,
  regions,
  researchItems,
  strategyGoals,
  trainingItems,
  type DashboardAsset,
} from "./foherb-content";

const DESIGN_WIDTH = 2048;
const DESIGN_HEIGHT = 1875;

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
    // 首次挂载后再读取本地时间，避免服务端与浏览器时区造成水合差异。
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
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
  { lat: 50, lng: 15, name: "欧洲业务覆盖", color: "#33dcff" },
  { lat: 12, lng: -78, name: "美洲业务覆盖", color: "#33dcff" },
  { lat: 2, lng: 21, name: "非洲业务覆盖", color: "#33dcff" },
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
        .width(440)
        .height(440)
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

          // HTML 标注由地球引擎绑定经纬度，旋转时始终贴合天津坐标。
          element.className = "globe-marker";
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
        .pointOfView({ lat: 24, lng: 108, altitude: 1.72 }, 0);

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

export default function Home() {
  const scale = useDashboardScale();
  const clock = useClock();

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
                <strong>{value}</strong>
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
                <div className="region-rail region-rail-left">
                  <div className="region-card region-eu">
                    <b>欧洲区域</b><span>{regions.Europe[0]}</span><span>{regions.Europe[1]}</span>
                  </div>
                  <div className="region-card region-am">
                    <b>美洲区域</b><span>{regions.Americas[0]}</span><span>{regions.Americas[1]}</span>
                  </div>
                </div>
                <GlobeVisualization />
                <div className="region-rail region-rail-right">
                  <div className="region-card region-as">
                    <b>亚洲区域</b><span>{regions.Asia[0]}</span><span>{regions.Asia[1]}</span>
                  </div>
                  <div className="region-card region-af">
                    <b>非洲区域</b><span>{regions.Africa[0]}</span><span>{regions.Africa[1]}</span>
                  </div>
                </div>
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

            <Panel title="智能制造与生产基地" className="factory-panel">
              <div className="factory-content">
                <MediaFrame asset={assets.factoryRobot} className="factory-photo" />
                <div className="factory-stats">
                  {factoryFacts.map(([label, value]) => (
                    <div key={label}><span>{label}</span><b>{value}</b></div>
                  ))}
                </div>
                <div className="production">
                  <h3>生产流程</h3>
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
                </div>
              </div>
            </Panel>
          </div>

          <div className="right-column">
            <Panel title="研发与科技实力" className="research-panel">
              <h3 className="subhead">研发体系</h3>
              <div className="research-flow">
                {["综合研发中心", "检测化验中心", "试制中心"].map((item, index) => (
                  <div className="research-node" key={item}>
                    <i>♙</i><span>{item}</span>{index < 2 && <b>→</b>}
                  </div>
                ))}
              </div>
              <div className="core-team">
                <b>核心研发团队</b>
                <p>中医养生专家｜生物学家｜研发工程师</p>
              </div>
              <h3 className="subhead">产学研合作院校</h3>
              <div className="school-row">
                {["白俄罗斯维捷布斯克国立医药大学", "天津科技大学", "天津农学院"].map((item) => (
                  <div key={item}><i>◎</i><span>{item}</span></div>
                ))}
              </div>
              <h3 className="subhead">科技资质</h3>
              <ul className="check-list">
                {researchItems.map((item) => <li key={item}>✓　{item}</li>)}
              </ul>
            </Panel>

            <Panel title="企业荣誉与科技资质" className="patent-panel">
              <div className="patent-top">
                <ul className="patent-list">
                  {honorItems.map((item, index) => (
                    <li key={item}><i style={{ background: `var(--chart-${index + 1})` }} />{item}</li>
                  ))}
                </ul>
                <MediaFrame asset={assets.worldEconomicForumHonor} className="honor-certificate" />
              </div>
              <h3 className="subhead">代表性荣誉节点</h3>
              <div className="honor-timeline">
                {honorTimeline.map(([year, event]) => (
                  <div key={year}>
                    <i />
                    <span>{year}</span>
                    <b>{event}</b>
                  </div>
                ))}
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

          <Panel title="和治友德2035战略规划目标" className="service-panel">
            <div className="service-layout">
              <div className="strategy-list">
                {strategyGoals.map(([stage, goal]) => (
                  <div key={stage}><strong>{stage}</strong><span>{goal}</span></div>
                ))}
              </div>
              <div className="service-icons">
                {["客户服务能力", "研发品控能力", "人才培训能力", "物流配送能力"].map((item) => (
                  <div key={item}><i>♙</i><span>{item}</span><b>提质升级</b></div>
                ))}
              </div>
            </div>
          </Panel>

          <div className="bottom-right">
            <Panel title="荣誉墙（官网公开29条记录）" className="honor-panel">
              <div className="honor-row">
                {["国家高新技术企业", "新领军者创新奖", "便携舒络仪科技金奖", "中国保健协会副理事长单位"].map((item, index) => (
                  <div key={item}><i>{["♕", "♛", "♜", "♔"][index]}</i><span>{item}</span></div>
                ))}
              </div>
            </Panel>
            <Panel title="公益与社会责任" className="charity-panel">
              <div className="charity-content">
                <MediaFrame asset={assets.charity2020} className="charity-photo" />
                <div className="charity-timeline">
                  {charityMilestones.map(([year, event]) => (
                    <p key={year}><b>{year}年</b>　{event}</p>
                  ))}
                </div>
              </div>
            </Panel>
          </div>
        </section>

        <footer className="footer">
          <span>资料口径：企业官网及政府公开信息</span>
          <span>注：规划目标不代表已实现成果，产品信息不构成医疗或功效承诺</span>
        </footer>
      </div>
    </main>
  );
}
