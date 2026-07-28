export type DashboardAsset = {
  src: string;
  alt: string;
  source: string;
};

export type ProductGroup = {
  title: string;
  summary: string;
  details: string[];
  image: DashboardAsset;
};

// 公开资料来源保留在配置中，页面不直接展示链接，便于后续审校和更新。
export const sourceUrls = {
  company:
    "https://www.foherb.cn/index.php?a=cdetail&c=main&id=1",
  companyCulture:
    "https://www.foherb.cn/index.php?a=cdetail&c=main&id=3",
  headquarters:
    "https://www.foherb.cn/index.php?a=cdetail&c=main&id=266",
  research:
    "https://www.foherb.cn/index.php?a=cdetail&c=main&id=4",
  honors:
    "https://www.foherb.cn/index.php?a=clist&c=main&id=6",
  productZinc:
    "https://www.foherb.cn/index.php?a=cdetail&c=main&id=481",
  productDevice:
    "https://www.foherb.cn/index.php?a=cdetail&c=main&id=403",
  productCosmetics:
    "https://www.foherb.cn/index.php?a=cdetail&c=main&id=49",
  productCleaning:
    "https://www.foherb.cn/index.php?a=cdetail&c=main&id=365",
  commerceProducts:
    "https://zxgl.mofcom.gov.cn/front/getNews/3-4755",
  ganodermaRecord:
    "https://scjg.tj.gov.cn/WZWSREL3Rqc3NjamRnbHd5aF81MjY1MS94d2R0L2dzL2Jqc3BzY3hraGNwYmEvMjAyMzAyL1AwMjAyMzAyMTY0Mjc1MjYwODIzNjgucGRm",
  charity:
    "https://www.foherb.cn/index.php?a=cdetail&c=main&id=266",
} as const;

export const assets = {
  logo: {
    src: "./foherb/logo.png",
    alt: "和治友德官方标志",
    source: sourceUrls.company,
  },
  headquarters: {
    src: "./foherb/hq.webp",
    alt: "和治友德全球运营总部建筑",
    source: sourceUrls.headquarters,
  },
  factoryLine: {
    src: "./foherb/factory-line.webp",
    alt: "和治友德洁净生产线",
    source: sourceUrls.headquarters,
  },
  factoryRobot: {
    src: "./foherb/factory-robot.webp",
    alt: "和治友德自动化码垛机器人",
    source: sourceUrls.headquarters,
  },
  deviceLine: {
    src: "./foherb/device-line.webp",
    alt: "和治友德便携舒络仪自动化生产现场",
    source: sourceUrls.productDevice,
  },
  productZinc: {
    src: "./foherb/product-zinc.webp",
    alt: "南新甘氨酸锌片",
    source: sourceUrls.productZinc,
  },
  productCosmetics: {
    src: "./foherb/product-cosmetics.webp",
    alt: "和治友德口服液与活性肽焕颜多效面膜",
    source: sourceUrls.productCosmetics,
  },
  kosherCertificate: {
    src: "./foherb/kosher-cert.webp",
    alt: "和治友德产品犹太洁食认证",
    source: sourceUrls.productCleaning,
  },
  worldEconomicForumHonor: {
    src: "./foherb/honor-wef.webp",
    alt: "世界经济论坛2023年度新领军者创新奖证书",
    source: sourceUrls.honors,
  },
  charity2020: {
    src: "./foherb/charity-2020.webp",
    alt: "和治友德2020年抗疫公益物资捐赠现场",
    source: sourceUrls.charity,
  },
} satisfies Record<string, DashboardAsset>;

export const metrics = [
  ["⌂", "2007年", "企业创立"],
  ["▣", "19年", "健康产业深耕"],
  ["◉", "4大洲", "全球业务覆盖"],
  ["◇", "4大类", "产品体系"],
  ["▥", "25,928㎡", "生产基地面积"],
  ["▦", "32,970.6㎡", "全球运营总部占地"],
  ["⌁", "3所", "产学研合作院校"],
  ["♜", "29项", "官网荣誉记录"],
] as const;

export const overview = [
  ["⌂", "成立时间", "2007年"],
  ["▱", "企业类型", "健康护理养生产品研制、生产与销售"],
  ["♧", "企业定位", "全球化个人经济体创业赋能平台"],
  ["◎", "企业使命", "弘扬养生文化，造福人类健康"],
  ["✤", "养生理论", "饮食养生、行为养生、心理养生"],
  ["⌘", "核心优势", "理论、产品、模式“三力一体”"],
] as const;

export const cultureItems = [
  ["饮食养生", "五味调和 · 养精"],
  ["行为养生", "动静和济 · 养气"],
  ["心理养生", "心平气和 · 养神"],
  ["核心价值观", "和谐 · 共治 · 友爱 · 厚德"],
] as const;

export const trainingItems = [
  ["初级研修", "营销人员启动"],
  ["中级研修", "团队规范管理"],
  ["高级研修", "领导力建设"],
  ["专业教育", "健康养生理念"],
  ["全球支持", "市场教育保障"],
] as const;

export const regions = {
  Europe: ["市场发展起源地", "分公司与服务网点"],
  Americas: ["业务辐射区域", "全球服务体系"],
  Asia: ["天津总部所在地", "产研与供应基地"],
  Africa: ["业务辐射区域", "分公司与服务网点"],
} as const;

export const developmentMilestones = [
  ["2007", "企业组建"],
  ["2016", "回归中国市场"],
  ["2021", "全球总部启用"],
  ["2023", "启动数字化转型"],
  ["2026", "实施五大战略"],
] as const;

export const factoryFacts = [
  ["生产基地面积", "25,928㎡"],
  ["自动化生产线", "多条"],
  ["质量管理体系", "ISO 9001"],
  ["食品安全体系", "HACCP"],
  ["生产管理", "双体系把关"],
  ["仓储物流", "现代化配置"],
] as const;

export const researchItems = [
  "国家高新技术企业",
  "ISO 9001质量管理体系认证",
  "HACCP体系认证",
  "研究开发、检测化验、试制三大系统",
  "产学研战略合作平台",
] as const;

export const honorItems = [
  "世界经济论坛新领军企业",
  "国家级高新技术企业认定",
  "2023年度新领军者创新奖",
  "便携舒络仪科技金奖",
  "中国保健协会副理事长单位",
] as const;

export const honorTimeline = [
  ["2020", "行业标志产品"],
  ["2023", "新领军者创新奖"],
  ["2024", "科技金奖"],
  ["2026", "数智化元创力企业"],
] as const;

export const productGroups: ProductGroup[] = [
  {
    title: "保健食品",
    summary: "官方及监管备案产品",
    details: ["南新甘氨酸锌片", "和治友德口服液", "破壁灵芝孢子粉"],
    image: assets.productZinc,
  },
  {
    title: "保健器材",
    summary: "科技养护产品",
    details: ["和治友德牌便携舒络仪", "自动化生产", "2024科技金奖"],
    image: assets.deviceLine,
  },
  {
    title: "化妆品",
    summary: "健康美丽产品体系",
    details: ["活性肽焕颜多效面膜", "上合组织活动赠礼", "官方公开产品"],
    image: assets.productCosmetics,
  },
  {
    title: "保洁用品",
    summary: "日常健康护理",
    details: ["青蒿牙膏", "官方公开产品", "通过犹太洁食认证"],
    image: assets.kosherCertificate,
  },
];

export const strategyGoals = [
  ["2025规划", "产品与服务规划覆盖1.5亿人群"],
  ["2030规划", "产品与服务规划覆盖2.5亿人群"],
  ["2035愿景", "服务全球亿万家庭"],
] as const;

export const charityMilestones = [
  ["2008", "确立“大爱无疆，仁行天下”慈善宗旨"],
  ["2020", "捐赠价值310万元抗疫物资"],
  ["2022", "捐赠价值50余万元健康产品"],
] as const;
