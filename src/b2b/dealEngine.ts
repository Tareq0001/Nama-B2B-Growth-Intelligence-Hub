/**
 * نَمَاء | NAMA — B2B Business Development, Strategic Partnerships & Revenue Intelligence Engine
 * Core domain types, financial calculators, pipeline taxonomy, MEDDIC engine & Web Audio sound effects.
 */

export type SectorKey = 'fintech' | 'govtech' | 'cloud_ai' | 'telecom' | 'healthtech' | 'retail';

export interface DealParams {
  sector: SectorKey;
  acv: number;               // Annual Contract Value in SAR
  years: number;             // 1 to 5 years
  discount: number;          // 0% to 35%
  meddicScore: number;       // 0 to 100
  leverRoi: boolean;         // Value-based Business Case & ROI Quantification
  leverSla: boolean;         // Mission-Critical 99.99% SLA Guarantee & Governance
  leverPoc: boolean;         // 14-Day Rapid Pilot / PoC Sandbox
  leverAlliance: boolean;    // Strategic Channel & Ecosystem Partner Co-sell
  activeStage: number;       // 0 to 4
}

export interface MeddicAxis {
  key: string;
  labelAr: string;
  labelEn: string;
  score: number;
}

export interface DealMetrics {
  tcv: number;                    // Total Contract Value (SAR)
  netAcv: number;                 // Annual Recurring Revenue per year after discount (SAR)
  winProbability: number;         // 0% - 100%
  netMargin: number;              // Net Delivery Margin %
  salesCycleDays: number;         // Predicted Deal Velocity in calendar days
  estimatedArrImpact: number;     // Expected Weighted ARR (netAcv * winProb)
  dealHealthLabelAr: string;
  dealHealthLabelEn: string;
  meddicAxes: MeddicAxis[];
}

export interface PipelineStageInfo {
  index: number;
  titleAr: string;
  titleEn: string;
  badgeAr: string;
  badgeEn: string;
  descAr: string;
  descEn: string;
  actionAr: string;
  actionEn: string;
  colorHex: string;
  conversionBenchmark: string;
}

export const PIPELINE_STAGES: PipelineStageInfo[] = [
  {
    index: 0,
    titleAr: 'استقطاب العملاء وبناء العلاقات المستدامة',
    titleEn: 'Lead Prospecting & Strategic Enterprise Outreach',
    badgeAr: 'المرحلة 1: التنقيب والتواصل',
    badgeEn: 'Stage 1: Inbound & Outbound Pipeline',
    descAr: 'تحديد الحسابات الاستراتيجية المستهدفة (ABM)، صياغة القيمة المقترحة والتواصل مع صناع القرار التنفيذيين.',
    descEn: 'Account-Based Marketing, CXO multi-threading, personalized value propositions and inbound pipeline activation.',
    actionAr: 'تأهيل المؤشرات الأولية وملاءمة الحل (BANT Initial Sweep)',
    actionEn: 'Initial ICP qualification & BANT readiness review',
    colorHex: '#06b6d4',
    conversionBenchmark: 'معدل التحويل المعياري: 35% - 42%'
  },
  {
    index: 1,
    titleAr: 'تحديد الفرص وتأهيل الشراكات الاستراتيجية (MEDDIC)',
    titleEn: 'Opportunity Identification & Rigorous MEDDIC Qualification',
    badgeAr: 'المرحلة 2: التأهيل العميق',
    badgeEn: 'Stage 2: Enterprise Discovery & Qualification',
    descAr: 'اكتشاف التحديات المؤسسية، تحديد المشتري الاقتصادي، توثيق مقاييس النجاح وحشد البطل الداخلي (Champion).',
    descEn: 'Validating Economic Buyer, quantifiable business metrics, decision governance and activating enterprise internal champions.',
    actionAr: 'اعتماد مصفوفة التأهيل وسد الفجوات التحليلية',
    actionEn: 'Lock MEDDIC score and define joint evaluation milestones',
    colorHex: '#3b82f6',
    conversionBenchmark: 'معدل التحويل المعياري: 52% - 60%'
  },
  {
    index: 2,
    titleAr: 'إعداد العروض الفنية والتجارية وإثبات المفهوم (PoC)',
    titleEn: 'Commercial Proposal, Solution Architecture & PoC Structuring',
    badgeAr: 'المرحلة 3: العرض الهندسي والتجاري',
    badgeEn: 'Stage 3: Technical & Commercial Validation',
    descAr: 'تصميم العرض الفني المتكامل، إجراء إثبات المفهوم التجريبي لبرهنة العائد على الاستثمار، وهيكلة الأسعار والحلول المخصصة.',
    descEn: 'Enterprise solution blueprint, rapid proof-of-concept validation, quantifiable ROI model and executive presentation.',
    actionAr: 'تقديم مذكرة القيمة المشتركة واجتياز لجنة التقييم الفني',
    actionEn: 'Deliver joint business case & pass technical gatekeeping',
    colorHex: '#8b5cf6',
    conversionBenchmark: 'معدل التحويل المعياري: 68% - 74%'
  },
  {
    index: 3,
    titleAr: 'التفاوض الاستراتيجي وهيكلة اتفاقيات SLA والتحالفات',
    titleEn: 'Win-Win Strategic Negotiation, SLA Alignment & Partner Co-sell',
    badgeAr: 'المرحلة 4: التفاوض والشروط',
    badgeEn: 'Stage 4: Legal, SLA & Commercial Alignment',
    descAr: 'التفاوض حول شروط التعاقد والخصم، ضبط اتفاقيات مستوى الخدمة (SLA 99.99%)، وإشراك شركاء التحالف لتعظيم القيمة.',
    descEn: 'Contractual terms negotiation, SLA commitments, legal/cybersecurity compliance, and co-selling ecosystem alignment.',
    actionAr: 'اعتماد مسودة العقد النهائي والترتيب للتوقيع التنفيذي',
    actionEn: 'Finalize master services agreement (MSA) and approvals',
    colorHex: '#f59e0b',
    conversionBenchmark: 'معدل التحويل المعياري: 82% - 88%'
  },
  {
    index: 4,
    titleAr: 'إتمام التعاقد وتنمية الإيرادات الدورية (Closed-Won)',
    titleEn: 'Contract Execution, ARR Expansion & Customer Success Onboarding',
    badgeAr: 'المرحلة 5: إتمام التعاقد',
    badgeEn: 'Stage 5: Closed-Won & ARR Expansion',
    descAr: 'توقيع العقود الرسمية، بدء مسار نجاح العملاء، ووضع خطة التوسع المتبادل لزيادة معدل صافي الإيرادات المتكررة (NRR).',
    descEn: 'Contract signature, immediate onboarding kickoff, customer success alignment and land-and-expand ARR strategy.',
    actionAr: 'تفعيل حساب العميل المؤسسي وبدء قياس القيمة المحققة',
    actionEn: 'Activate enterprise subscription and land-and-expand plan',
    colorHex: '#10b981',
    conversionBenchmark: 'إتمام مؤكد بنسبة 100% مع مسار توسع سنوي'
  }
];

export interface SectorNodeInfo {
  id: string;
  key: SectorKey;
  nameAr: string;
  nameEn: string;
  defaultAcv: number;
  defaultYears: number;
  defaultDiscount: number;
  defaultMeddic: number;
  colorHex: string;
  angleRad: number;
  radius: number;
  heightOffset: number;
  targetClientAr: string;
  targetClientEn: string;
}

export const SECTOR_PRESETS: Record<
  SectorKey,
  {
    nameAr: string;
    nameEn: string;
    clientAr: string;
    clientEn: string;
    acv: number;
    years: number;
    discount: number;
    meddicScore: number;
    leverRoi: boolean;
    leverSla: boolean;
    leverPoc: boolean;
    leverAlliance: boolean;
    colorHex: string;
  }
> = {
  fintech: {
    nameAr: 'التقنية المالية والمصارف الرقمية',
    nameEn: 'FinTech & Digital Banking Platforms',
    clientAr: 'مصرف الإنماء والمدفوعات الفورية المفتوحة',
    clientEn: 'Alinma Bank & Open Banking Infrastructure',
    acv: 1250000,
    years: 3,
    discount: 10,
    meddicScore: 84,
    leverRoi: true,
    leverSla: true,
    leverPoc: true,
    leverAlliance: false,
    colorHex: '#10b981'
  },
  govtech: {
    nameAr: 'الحكومة الرقمية والمدن الذكية',
    nameEn: 'GovTech & Smart Cities Enterprise',
    clientAr: 'الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا)',
    clientEn: 'SDAIA & Sovereign AI Digital Twin Initiatives',
    acv: 2800000,
    years: 4,
    discount: 8,
    meddicScore: 88,
    leverRoi: true,
    leverSla: true,
    leverPoc: true,
    leverAlliance: true,
    colorHex: '#06b6d4'
  },
  cloud_ai: {
    nameAr: 'البنية التحتية السحابية ونماذج الذكاء الاصطناعي',
    nameEn: 'Enterprise Cloud & Sovereign AI Infrastructure',
    clientAr: 'المركز الوطني للحوسبة السحابية ومصانع الذكاء الاصطناعي',
    clientEn: 'National Cloud Center & Sovereign LLM Foundry',
    acv: 1950000,
    years: 3,
    discount: 12,
    meddicScore: 79,
    leverRoi: true,
    leverSla: false,
    leverPoc: true,
    leverAlliance: true,
    colorHex: '#8b5cf6'
  },
  telecom: {
    nameAr: 'مشغلو الاتصالات والشبكات الخاصة 5G',
    nameEn: 'Telecom Giants & 5G Private Networks',
    clientAr: 'شركة الاتصالات السعودية (stc) - قطاع الأعمال',
    clientEn: 'stc Enterprise & Smart Infrastructure Solutions',
    acv: 3400000,
    years: 5,
    discount: 15,
    meddicScore: 92,
    leverRoi: true,
    leverSla: true,
    leverPoc: true,
    leverAlliance: true,
    colorHex: '#3b82f6'
  },
  healthtech: {
    nameAr: 'الرعاية الصحية الرقمية والمستشفيات',
    nameEn: 'HealthTech Enterprise & Smart Hospitals',
    clientAr: 'مستشفى الملك فيصل التخصصي ومركز الأبحاث',
    clientEn: 'King Faisal Specialist Hospital & Research Centre',
    acv: 1600000,
    years: 3,
    discount: 10,
    meddicScore: 82,
    leverRoi: true,
    leverSla: true,
    leverPoc: true,
    leverAlliance: false,
    colorHex: '#ec4899'
  },
  retail: {
    nameAr: 'سلاسل الإمداد والتجزئة الذكية',
    nameEn: 'Smart Retail & Supply Chain Platforms',
    clientAr: 'مجموعة الدانوب وبن داود القابضة',
    clientEn: 'BinDawood Holding & Smart Omnichannel Supply Chain',
    acv: 1450000,
    years: 3,
    discount: 12,
    meddicScore: 80,
    leverRoi: true,
    leverSla: false,
    leverPoc: true,
    leverAlliance: true,
    colorHex: '#f59e0b'
  }
};

export const ECOSYSTEM_NODES: {
  id: string;
  nameAr: string;
  nameEn: string;
  acvLabel: string;
  colorHex: string;
  angle: number;
  dist: number;
  y: number;
}[] = [
  {
    id: 'node_fintech',
    nameAr: 'التقنية المالية والمصارف',
    nameEn: 'FinTech & Banking',
    acvLabel: '1.25M SAR / yr',
    colorHex: '#10b981',
    angle: 0,
    dist: 6.8,
    y: 2.4
  },
  {
    id: 'node_govtech',
    nameAr: 'الحكومة الرقمية والمدن الذكية',
    nameEn: 'GovTech & Smart Cities',
    acvLabel: '2.80M SAR / yr',
    colorHex: '#06b6d4',
    angle: (Math.PI / 3) * 1,
    dist: 7.2,
    y: 2.8
  },
  {
    id: 'node_cloud_ai',
    nameAr: 'الحوسبة السحابية والذكاء الاصطناعي',
    nameEn: 'Cloud & AI Infrastructure',
    acvLabel: '1.95M SAR / yr',
    colorHex: '#8b5cf6',
    angle: (Math.PI / 3) * 2,
    dist: 6.6,
    y: 2.2
  },
  {
    id: 'node_telecom',
    nameAr: 'الاتصالات وشبكات 5G الخاصة',
    nameEn: 'Telecom & 5G Networks',
    acvLabel: '3.40M SAR / yr',
    colorHex: '#3b82f6',
    angle: (Math.PI / 3) * 3,
    dist: 7.4,
    y: 2.9
  },
  {
    id: 'node_healthtech',
    nameAr: 'الرعاية الصحية الرقمية والمستشفيات',
    nameEn: 'HealthTech Enterprise',
    acvLabel: '1.60M SAR / yr',
    colorHex: '#ec4899',
    angle: (Math.PI / 3) * 4,
    dist: 6.9,
    y: 2.5
  },
  {
    id: 'node_retail',
    nameAr: 'سلاسل الإمداد والتجزئة الذكية',
    nameEn: 'Smart Retail & Supply Chain',
    acvLabel: '1.45M SAR / yr',
    colorHex: '#f59e0b',
    angle: (Math.PI / 3) * 5,
    dist: 6.7,
    y: 2.3
  }
];

export interface OpportunityBubble {
  id: string;
  accountAr: string;
  accountEn: string;
  sectorAr: string;
  sectorEn: string;
  acv: number;
  cycleDays: number;
  winProb: number;
  stageIndex: number;
  color: string;
}

export const ENTERPRISE_OPPORTUNITIES: OpportunityBubble[] = [
  {
    id: 'opp_sama',
    accountAr: 'البنك المركزي السعودي (ساما) - منصة المصرفية المفتوحة',
    accountEn: 'SAMA Open Banking & Regulatory Sandbox',
    sectorAr: 'التقنية المالية',
    sectorEn: 'FinTech',
    acv: 1850000,
    cycleDays: 110,
    winProb: 78,
    stageIndex: 3,
    color: '#10b981'
  },
  {
    id: 'opp_riyadh',
    accountAr: 'أمانة منطقة الرياض - التوأمة الرقمية للمشاريع الكبرى',
    accountEn: 'Riyadh Municipality Digital Twin Platform',
    sectorAr: 'المدن الذكية والحكومة',
    sectorEn: 'GovTech',
    acv: 2400000,
    cycleDays: 145,
    winProb: 65,
    stageIndex: 2,
    color: '#06b6d4'
  },
  {
    id: 'opp_sdaia',
    accountAr: 'سدايا - البنية التحتية للنماذج اللغوية السيادية',
    accountEn: 'SDAIA Sovereign AI & LLM Cluster Integration',
    sectorAr: 'الذكاء الاصطناعي السحابي',
    sectorEn: 'Cloud & AI',
    acv: 3200000,
    cycleDays: 95,
    winProb: 88,
    stageIndex: 4,
    color: '#8b5cf6'
  },
  {
    id: 'opp_stc',
    accountAr: 'stc - شبكات الجيل الخامس الخاصة للموانئ واللوجستيات',
    accountEn: 'stc Private 5G Core for Red Sea Ports',
    sectorAr: 'الاتصالات المؤسسية',
    sectorEn: 'Telecom',
    acv: 2900000,
    cycleDays: 130,
    winProb: 72,
    stageIndex: 3,
    color: '#3b82f6'
  },
  {
    id: 'opp_kfshrc',
    accountAr: 'مستشفى الملك فيصل التخصصي - المنظومة الصحية التنبؤية',
    accountEn: 'KFSH&RC Clinical Predictive Intelligence',
    sectorAr: 'تقنيات الصحة',
    sectorEn: 'HealthTech',
    acv: 1600000,
    cycleDays: 85,
    winProb: 82,
    stageIndex: 2,
    color: '#ec4899'
  },
  {
    id: 'opp_sal',
    accountAr: 'شركة سال السعودية للخدمات اللوجستية - إدارة السلاسل الذكية',
    accountEn: 'SAL Logistics Air Cargo Digital Ecosystem',
    sectorAr: 'النقل واللوجستيات',
    sectorEn: 'Logistics',
    acv: 1450000,
    cycleDays: 75,
    winProb: 91,
    stageIndex: 4,
    color: '#10b981'
  },
  {
    id: 'opp_aramco',
    accountAr: 'أرامكو السعودية - تحليلات الصيانة الاستباقية لمنشآت الطاقة',
    accountEn: 'Aramco Energy IoT Diagnostics & Predictive Maintenance',
    sectorAr: 'الطاقة والصناعة',
    sectorEn: 'Energy & Industry',
    acv: 4500000,
    cycleDays: 180,
    winProb: 58,
    stageIndex: 1,
    color: '#f59e0b'
  },
  {
    id: 'opp_futtaim',
    accountAr: 'مجموعة الفطيم للتجزئة - منصة الولاء والذكاء التسويقي الموحد',
    accountEn: 'Al-Futtaim Retail Omnichannel Customer Data Platform',
    sectorAr: 'التجزئة والتجارة الرقمية',
    sectorEn: 'Smart Retail',
    acv: 980000,
    cycleDays: 60,
    winProb: 84,
    stageIndex: 3,
    color: '#06b6d4'
  }
];

export function calculateDealMetrics(params: DealParams): DealMetrics {
  const safeDiscount = Math.max(0, Math.min(35, params.discount));
  const safeYears = Math.max(1, Math.min(5, params.years));
  const netAcv = Math.round(params.acv * (1 - safeDiscount / 100));
  const tcv = netAcv * safeYears;

  // Base stage probability baseline: [20%, 38%, 58%, 76%, 96%]
  const stageBaseProb = [22, 40, 60, 78, 98][Math.max(0, Math.min(4, params.activeStage))];

  // MEDDIC impact: -12% to +14%
  const meddicImpact = (params.meddicScore - 60) * 0.35;

  // Strategic negotiation levers:
  let leverBoost = 0;
  if (params.leverRoi) leverBoost += 5;
  if (params.leverSla) leverBoost += 4;
  if (params.leverPoc) leverBoost += 6;
  if (params.leverAlliance) leverBoost += 5;

  // Discount sweetener effect: moderate discount (5-15%) helps close faster, excessive discount (>25%) looks desperate
  let discountSweetener = 0;
  if (safeDiscount >= 5 && safeDiscount <= 15) {
    discountSweetener = 3;
  } else if (safeDiscount > 20) {
    discountSweetener = -2;
  }

  let winProbability = Math.round(stageBaseProb + meddicImpact + leverBoost + discountSweetener);
  winProbability = Math.max(18, Math.min(99, winProbability));

  // If in Stage 4 (Closed-Won), clamp to 99%
  if (params.activeStage === 4) {
    winProbability = Math.max(95, winProbability);
  }

  // Base sector gross margin: FinTech 76%, GovTech 73%, Cloud/AI 78%, Telecom 71%
  const baseMarginMap: Record<SectorKey, number> = {
    fintech: 76,
    govtech: 73,
    cloud_ai: 78,
    telecom: 71,
    healthtech: 75,
    retail: 72
  };
  const sectorMargin = baseMarginMap[params.sector] || 74;

  // Margin deduction from discount (every 1% discount erodes ~0.85% margin)
  // Minus lever delivery costs (PoC ~ 2.5%, SLA 99.99% architecture ~ 1.5%)
  // Plus multi-year economies of scale (+1.8% per additional year)
  let netMargin =
    sectorMargin -
    safeDiscount * 0.85 -
    (params.leverPoc ? 2.5 : 0) -
    (params.leverSla ? 1.5 : 0) +
    (safeYears - 1) * 1.8;
  netMargin = Math.round(Math.max(38, Math.min(88, netMargin)) * 10) / 10;

  // Sales cycle days calculation:
  // Base velocity determined by ACV scale
  const baseCycle = 50 + Math.round(Math.sqrt(params.acv / 18000) * 11);
  let cycleReduction = 0;
  if (params.leverPoc) cycleReduction += 14;      // PoC removes technical ambiguity
  if (params.leverRoi) cycleReduction += 9;       // ROI business case speeds financial sign-off
  if (params.leverAlliance) cycleReduction += 11; // Alliance co-sell brings pre-approved trust
  const meddicCycleAccel = Math.round((params.meddicScore - 50) * 0.4);

  let salesCycleDays = baseCycle - cycleReduction - meddicCycleAccel;
  salesCycleDays = Math.max(35, Math.min(240, salesCycleDays));

  // ARR Impact = Expected value = Net ACV * (Win Probability / 100)
  const estimatedArrImpact = Math.round(netAcv * (winProbability / 100));

  // Health label classification
  let dealHealthLabelAr = 'ممتازة - مسار إغلاق متسارع ومؤهل';
  let dealHealthLabelEn = 'Exceptional - High Close Velocity & Low Risk';
  if (winProbability < 45 || params.meddicScore < 50) {
    dealHealthLabelAr = 'عالية المخاطر - فجوة في اعتماد المشتري والمعايير';
    dealHealthLabelEn = 'High Risk - Qualification Gaps in MEDDIC & Criteria';
  } else if (winProbability < 65 || params.meddicScore < 70) {
    dealHealthLabelAr = 'متوسطة - تحتاج تعزيز البطل الداخلي وتوثيق العائد';
    dealHealthLabelEn = 'Moderate - Needs Champion Enablement & ROI Proof';
  } else if (winProbability < 82) {
    dealHealthLabelAr = 'قوية - تأهيل مكتمل وجاهزة للإغلاق التجاري';
    dealHealthLabelEn = 'Strong - Fully Qualified for Commercial Execution';
  }

  // Generate 6 MEDDIC axes derived deterministically
  const mScore = Math.max(20, Math.min(100, Math.round(params.meddicScore * 0.95 + (params.leverRoi ? 12 : -6))));
  const eScore = Math.max(20, Math.min(100, Math.round(params.meddicScore * 1.02 + (params.activeStage >= 2 ? 8 : -4))));
  const dcScore = Math.max(20, Math.min(100, Math.round(params.meddicScore * 0.98 + (params.leverPoc ? 10 : -3))));
  const dpScore = Math.max(20, Math.min(100, Math.round(params.meddicScore * 0.94 + (params.leverSla ? 8 : 0))));
  const ipScore = Math.max(20, Math.min(100, Math.round(params.meddicScore * 1.05 + 4)));
  const cScore = Math.max(20, Math.min(100, Math.round(params.meddicScore * 0.96 + (params.leverAlliance ? 11 : -2))));

  const meddicAxes: MeddicAxis[] = [
    { key: 'M', labelAr: 'المقاييس الكمية (Metrics)', labelEn: 'Metrics (ROI & KPI Impact)', score: mScore },
    { key: 'E', labelAr: 'المشتري الاقتصادي (Economic Buyer)', labelEn: 'Economic Buyer Direct Access', score: eScore },
    { key: 'D1', labelAr: 'معايير القرار (Decision Criteria)', labelEn: 'Decision Criteria Alignment', score: dcScore },
    { key: 'D2', labelAr: 'مسار اتخاذ القرار (Decision Process)', labelEn: 'Decision Process & Governance', score: dpScore },
    { key: 'I', labelAr: 'تحديد الألم المؤسسي (Identify Pain)', labelEn: 'Identify Compelling Enterprise Pain', score: ipScore },
    { key: 'C', labelAr: 'البطل الداخلي (Champion Enablement)', labelEn: 'Champion Power & Influence', score: cScore }
  ];

  return {
    tcv,
    netAcv,
    winProbability,
    netMargin,
    salesCycleDays,
    estimatedArrImpact,
    dealHealthLabelAr,
    dealHealthLabelEn,
    meddicAxes
  };
}

export interface GrowthInputs {
  monthlyLeads: number;       // Qualified enterprise leads per month (e.g. 15-50)
  conversionRate: number;     // Lead-to-Won % (e.g. 12% - 28%)
  avgAcv: number;             // SAR
  cac: number;                // Customer Acquisition Cost in SAR
  grossMargin: number;        // e.g. 75%
  nrr: number;                // Net Revenue Retention e.g. 115%
}

export interface GrowthForecast {
  newClientsPerYear: number;
  projectedArr: number;
  strategicArr: number;
  ltv: number;
  ltvCacRatio: number;
  cacPaybackMonths: number;
  baselineMonthlyArr: number[];
  strategicMonthlyArr: number[];
}

export function calculateGrowthForecast(inputs: GrowthInputs): GrowthForecast {
  const safeLeads = Math.max(1, inputs.monthlyLeads);
  const safeConv = Math.max(1, Math.min(100, inputs.conversionRate)) / 100;
  const newClientsPerYear = Math.max(1, Math.round(safeLeads * 12 * safeConv));
  const projectedArr = Math.round(newClientsPerYear * inputs.avgAcv);

  // Strategic acceleration multiplier from alliance co-selling & NRR compounding
  const strategicMultiplier = 1.28 + ((inputs.nrr - 100) / 100) * 0.5;
  const strategicArr = Math.round(projectedArr * strategicMultiplier);

  // Customer Lifetime Value (LTV): Avg ACV * Gross Margin / Annual Churn
  const annualChurn = Math.max(0.04, 1 - Math.min(0.96, inputs.nrr / 100) + 0.08);
  const ltv = Math.round((inputs.avgAcv * (inputs.grossMargin / 100)) / annualChurn);

  // LTV:CAC Ratio
  const ltvCacRatio = inputs.cac > 0 ? Number((ltv / inputs.cac).toFixed(1)) : 4.5;

  // CAC Payback Months = CAC / (Monthly Gross Profit per Client)
  const monthlyGrossProfit = (inputs.avgAcv * (inputs.grossMargin / 100)) / 12;
  const cacPaybackMonths =
    monthlyGrossProfit > 0 ? Math.max(2.5, Number((inputs.cac / monthlyGrossProfit).toFixed(1))) : 6;

  // Monthly progressive ARR curves (12 months)
  const baselineMonthlyArr: number[] = [];
  const strategicMonthlyArr: number[] = [];
  for (let m = 1; m <= 12; m++) {
    const fraction = m / 12;
    const sCurve = (Math.sin((fraction - 0.5) * Math.PI) + 1) / 2;
    const baseVal = Math.round(projectedArr * (0.15 + 0.85 * sCurve));
    const stratVal = Math.round(strategicArr * (0.12 + 0.88 * Math.pow(fraction, 1.35)));
    baselineMonthlyArr.push(baseVal);
    strategicMonthlyArr.push(stratVal);
  }

  return {
    newClientsPerYear,
    projectedArr,
    strategicArr,
    ltv,
    ltvCacRatio,
    cacPaybackMonths,
    baselineMonthlyArr,
    strategicMonthlyArr
  };
}

// ==========================================
// Web Audio API Sound Synthesizer Engine
// High-tech haptic feedback with zero assets
// ==========================================

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export class SoundEngine {
  public static setEnabled(val: boolean): void {
    soundEnabled = val;
  }

  public static isEnabled(): boolean {
    return soundEnabled;
  }

  public static playClick(): void {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Audio context policy safe fallback
    }
  }

  public static playStage(stageIdx: number): void {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const frequencies = [329.63, 392.0, 493.88, 587.33, 783.99]; // E4, G4, B4, D5, G5
      const baseFreq = frequencies[Math.max(0, Math.min(frequencies.length - 1, stageIdx))] || 440;
      const now = ctx.currentTime;

      // Primary oscillator
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(baseFreq, now);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, now + 0.08);

      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      // Harmony chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(baseFreq * 1.5, now);

      gain2.gain.setValueAtTime(0.06, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.18);
      osc2.stop(now + 0.24);
    } catch {
      // safe fallback
    }
  }

  public static playToggle(active: boolean): void {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      const startFreq = active ? 440 : 580;
      const endFreq = active ? 660 : 360;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.06);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.075);
    } catch {
      // safe fallback
    }
  }

  public static playContractClosedChord(): void {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Majestic Victory Arpeggio)
      const now = ctx.currentTime;

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const delay = i * 0.07;

        osc.type = i === 3 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0.001, now + delay);
        gain.gain.linearRampToValueAtTime(0.14 - i * 0.02, now + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.65);
      });
    } catch {
      // safe fallback
    }
  }
}

export function setSoundEnabled(val: boolean): void {
  SoundEngine.setEnabled(val);
}

export function isSoundEnabled(): boolean {
  return SoundEngine.isEnabled();
}

export function playClickSound(): void {
  SoundEngine.playClick();
}

export function playStageSound(stageIdx: number): void {
  SoundEngine.playStage(stageIdx);
}

export function playToggleSound(active: boolean): void {
  SoundEngine.playToggle(active);
}

export function playContractClosedChord(): void {
  SoundEngine.playContractClosedChord();
}
