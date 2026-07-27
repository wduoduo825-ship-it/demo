"use client";

import { useEffect, useState } from "react";

const DESIGN_WIDTH = 2048;
const DESIGN_HEIGHT = 1875;

const metrics = [
  ["⌂", "2007年", "企业创立"],
  ["▣", "近19年", "发展历程"],
  ["◉", "4大洲", "全球市场"],
  ["◇", "4大类", "产品体系"],
  ["▥", "25,928㎡", "生产基地面积"],
  ["▦", "32,970.6㎡", "全球运营总部占地"],
  ["⌁", "3所", "研发合作院校"],
  ["♜", "29项", "企业荣誉"],
];

const overview = [
  ["⌂", "成立时间", "2007年"],
  ["▱", "企业类型", "集研发、生产、销售健康护理产品于一体"],
  ["♧", "企业定位", "全球化个人经济体创业赋能平台"],
  ["◎", "企业使命", "弘扬养生文化，造福人类健康"],
  ["✤", "核心竞争力", "理念、产品、模式“三力一体”"],
  ["⌘", "注册资本", "8,000万元"],
];

const people = [
  ["全球员工总数", "--人"],
  ["博士、硕士及以上", "--人"],
  ["研发及专业人员占比", "--%"],
  ["高学历人才占比", "--%"],
  ["员工平均司龄", "--年"],
];

const researchItems = [
  "国家高新技术企业",
  "ISO 9001质量管理体系认证",
  "HACCP体系认证",
  "研发中心与检测中心",
  "产学研合作平台",
];

const productGroups = [
  ["保健食品", "胶原蛋白肽、植物营养素"],
  ["保健器材", "健康监测、智能护理设备"],
  ["饮妆品", "轻饮系列、精华护理"],
  ["保洁用品", "净护系列、日常清洁"],
];

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
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

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

function Placeholder({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div className={`image-placeholder ${className}`} aria-label={`${label}图片占位`}>
      <span className="placeholder-icon">▧</span>
      <span>{label}</span>
      <small>IMAGE PLACEHOLDER</small>
    </div>
  );
}

function Donut({ label }: { label: string }) {
  return (
    <div className="donut" aria-label={label}>
      <div className="donut-hole">{label}</div>
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
            <div className="brand-mark">S</div>
            <div>
              <strong>和治友德</strong>
              <span>FOHERB</span>
            </div>
          </div>
          <div className="headline">
            <h1>和治友德全球健康产业实力数据中心</h1>
            <p>始于2007 · 服务全球健康市场　 弘扬养生文化，造福人类健康</p>
          </div>
          <time className="clock">
            <strong>{clock.date} {clock.time}</strong>
            <span>{clock.week}</span>
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
                <Placeholder label="总部建筑" />
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

            <Panel title="人才与团队（数据待企业提供）" className="people-panel">
              <div className="people-wrap">
                <div className="simple-list">
                  {people.map(([label, value]) => (
                    <div key={label}><span>◉ {label}</span><b>{value}</b></div>
                  ))}
                </div>
                <Donut label={"研发及品控\n人员占比\n--%"} />
              </div>
            </Panel>

            <Panel title="培训赋能（数据待企业提供）" className="training-panel">
              <div className="training-grid">
                {["养生理念", "重点合作伙伴", "健康护理", "中层管理", "高级管理"].map((item) => (
                  <div key={item}><i>▣</i><span>{item}</span><b>--场</b></div>
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
                <div className="map-placeholder">
                  <span className="map-grid" />
                  <div className="continent c1">北美洲</div>
                  <div className="continent c2">南美洲</div>
                  <div className="continent c3">欧洲</div>
                  <div className="continent c4">非洲</div>
                  <div className="continent c5">亚洲</div>
                  <div className="continent c6">大洋洲</div>
                  {Array.from({ length: 16 }).map((_, index) => (
                    <i className={`map-dot dot-${index + 1}`} key={index} />
                  ))}
                  <div className="map-origin">天津总部</div>
                </div>
                <div className="region-card region-eu">
                  <b>欧洲区域</b><span>客户数　--万</span><span>订单数　--万单</span>
                </div>
                <div className="region-card region-am">
                  <b>美洲区域</b><span>客户数　--万</span><span>销售占比　--%</span>
                </div>
                <div className="region-card region-af">
                  <b>非洲区域</b><span>客户数　--万</span><span>订单数　--万单</span>
                </div>
                <div className="region-card region-as">
                  <b>亚洲区域</b><span>客户数　--万</span><span>订单数　--万单</span>
                </div>
              </div>
              <div className="market-ticker">
                <h3>市场动态（今日）</h3>
                {[
                  ["新增国家/地区", "--个"],
                  ["新增服务网点", "--个"],
                  ["新增客户数", "--人"],
                  ["新增订单数", "--单"],
                  ["新增销售额", "--万元"],
                ].map(([label, value]) => (
                  <div key={label}><span>{label}</span><b>{value}</b></div>
                ))}
              </div>
              <div className="coverage">
                <strong>全球业务覆盖：<em>4大洲</em></strong>
                <span>海外市场覆盖　<em>持续建设</em></span>
                <span>合作伙伴网络　<em>持续拓展</em></span>
                <span>累计服务家庭　<em>数以万计</em></span>
              </div>
            </Panel>

            <Panel title="智能制造与生产基地" className="factory-panel">
              <div className="factory-content">
                <Placeholder label="生产基地鸟瞰图" className="factory-photo" />
                <div className="factory-stats">
                  {[
                    ["生产基地面积", "25,928㎡"],
                    ["自动化生产线", "--条"],
                    ["年设计产能", "--万件"],
                    ["当日产量", "--件"],
                    ["产品合格率", "--%"],
                    ["准时交付率", "--%"],
                  ].map(([label, value]) => (
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
                    <Placeholder label="生产车间" />
                    <Placeholder label="检测中心" />
                    <Placeholder label="智能仓储" />
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
                {["白俄罗斯国立医科大学", "天津科技大学", "天津农学院"].map((item) => (
                  <div key={item}><i>◎</i><span>{item}</span></div>
                ))}
              </div>
              <h3 className="subhead">科技资质</h3>
              <ul className="check-list">
                {researchItems.map((item) => <li key={item}>✓　{item}</li>)}
              </ul>
            </Panel>

            <Panel title="专利与知识产权（数据待企业提供）" className="patent-panel">
              <div className="patent-top">
                <ul className="patent-list">
                  {["发明专利", "实用新型", "外观设计", "软件著作权", "商标知识产权"].map((item, index) => (
                    <li key={item}><i style={{ background: `var(--chart-${index + 1})` }} />{item}<b>--项</b></li>
                  ))}
                </ul>
                <Donut label={"总计\n--项"} />
              </div>
              <h3 className="subhead">近5年新增专利趋势</h3>
              <div className="bar-chart" aria-label="近五年新增专利柱状图">
                {[46, 56, 59, 65, 62].map((height, index) => (
                  <div className="bar-item" key={index}>
                    <i style={{ height: `${height}%` }} />
                    <span>{2021 + index}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </section>

        <section className="bottom-grid">
          <Panel title="产品矩阵（4大产品体系）" className="products-panel">
            <div className="product-grid">
              {productGroups.map(([title, detail], index) => (
                <article className="product-card" key={title}>
                  <h3><i>{["♧", "◇", "♤", "❈"][index]}</i>{title}</h3>
                  <div className="product-content">
                    <Placeholder label={title} />
                    <p>{detail}<br />产品种类　--款<br />年销售量　--件<br />复购率　--%</p>
                  </div>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title="客户服务与培训赋能" className="service-panel">
            <div className="service-layout">
              <div className="simple-list">
                {["累计服务消费者", "累计服务家庭", "累计培训合作伙伴", "全球合作伙伴", "活跃客户数"].map((item) => (
                  <div key={item}><span>{item}</span><b>--人</b></div>
                ))}
              </div>
              <div className="service-icons">
                {["客户陪伴响应率", "客户满意度", "售后问题解决率", "客户复购率"].map((item) => (
                  <div key={item}><i>♙</i><span>{item}</span><b>--%</b></div>
                ))}
              </div>
            </div>
          </Panel>

          <div className="bottom-right">
            <Panel title="荣誉墙（国际荣誉折合20项）" className="honor-panel">
              <div className="honor-row">
                {["国家级奖项", "行业综合奖", "科技创新荣誉", "品牌公益荣誉"].map((item, index) => (
                  <div key={item}><i>{["♕", "♛", "♜", "♔"][index]}</i><span>{item}</span><b>--项</b></div>
                ))}
              </div>
            </Panel>
            <Panel title="公益与社会责任" className="charity-panel">
              <div className="charity-content">
                <div>
                  <p>累计公益投入　<span>待企业提供</span></p>
                  <p>公益项目数量　<span>待企业提供</span></p>
                  <p>公益覆盖国家和地区　<span>待企业提供</span></p>
                </div>
                <div className="charity-timeline">
                  <p><b>2020年</b>　援助健康公益行动</p>
                  <p><b>2022年</b>　关爱儿童与社区健康</p>
                  <p><b>2023年</b>　公益健康科普活动</p>
                </div>
              </div>
            </Panel>
          </div>
        </section>

        <footer className="footer">
          <span>数据展示：部分经营数据后续由企业提供</span>
          <span>注：本页面为产业实力展示大屏，所示图片位置均为可替换占位区域</span>
        </footer>
      </div>
    </main>
  );
}
