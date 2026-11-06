import type { DealMetrics, DealParams, OpportunityBubble, GrowthForecast } from './dealEngine';
import { SECTOR_PRESETS } from './dealEngine';

/**
 * Format currency in SAR with Arabic/English locale
 */
export function formatSar(val: number, lang: 'ar' | 'en'): string {
  if (val >= 1_000_000) {
    const m = (val / 1_000_000).toFixed(2);
    return lang === 'ar' ? `${m} مليون ر.س` : `${m}M SAR`;
  }
  if (val >= 1_000) {
    const k = (val / 1_000).toFixed(0);
    return lang === 'ar' ? `${k} ألف ر.س` : `${k}K SAR`;
  }
  return lang === 'ar' ? `${val.toLocaleString('ar-SA')} ر.س` : `${val.toLocaleString('en-US')} SAR`;
}

/**
 * 1. MEDDIC Qualification 6-Axis Hexagonal Radar Chart
 */
export function renderMeddicRadar(
  canvas: HTMLCanvasElement,
  metrics: DealMetrics,
  isLight: boolean,
  lang: 'ar' | 'en'
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width > 0 ? rect.width : (canvas.parentElement?.clientWidth || 440);
  const height = rect.height > 0 ? rect.height : 360;

  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2 + 8;
  const radius = Math.min(width, height) * 0.36;

  // Use axes from metrics if available, or standard default
  const axes = metrics.meddicAxes && metrics.meddicAxes.length === 6
    ? metrics.meddicAxes.map(a => ({
        key: a.key,
        label: lang === 'ar' ? a.labelAr : a.labelEn,
        score: a.score
      }))
    : [
        { key: 'M', label: lang === 'ar' ? 'المقاييس (M)' : 'Metrics (M)', score: 85 },
        { key: 'E', label: lang === 'ar' ? 'المشتري المالي (E)' : 'Econ Buyer (E)', score: 80 },
        { key: 'D1', label: lang === 'ar' ? 'معايير القرار (D1)' : 'Decision Crit (D1)', score: 88 },
        { key: 'D2', label: lang === 'ar' ? 'مسار القرار (D2)' : 'Decision Proc (D2)', score: 75 },
        { key: 'I', label: lang === 'ar' ? 'الألم المؤسسي (I)' : 'Identify Pain (I)', score: 92 },
        { key: 'C', label: lang === 'ar' ? 'البطل الداخلي (C)' : 'Champion (C)', score: 82 },
      ];

  const totalAxes = axes.length;
  const angleStep = (Math.PI * 2) / totalAxes;
  const startAngle = -Math.PI / 2; // start at top

  // Color tokens
  const gridColor = isLight ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.12)';
  const gridTextColor = isLight ? '#64748b' : '#94a3b8';
  const labelTextColor = isLight ? '#0f172a' : '#f8fafc';
  const accentEmerald = '#10b981';
  const accentCyan = '#06b6d4';

  // 1. Concentric Hexagonal Web Rings (20%, 40%, 60%, 80%, 100%)
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];
  ctx.lineWidth = 1;

  rings.forEach((pct) => {
    ctx.beginPath();
    for (let i = 0; i < totalAxes; i++) {
      const angle = startAngle + i * angleStep;
      const x = cx + Math.cos(angle) * (radius * pct);
      const y = cy + Math.sin(angle) * (radius * pct);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = gridColor;
    ctx.stroke();

    // Concentric percentage tick
    ctx.fillStyle = gridTextColor;
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(pct * 100)}%`, cx, cy - radius * pct - 2);
  });

  // 2. Radial Axis Spokes
  for (let i = 0; i < totalAxes; i++) {
    const angle = startAngle + i * angleStep;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.strokeStyle = gridColor;
    ctx.stroke();
  }

  // 3. Draw Filled Polygon
  const polygonPoints: { x: number; y: number; score: number }[] = [];
  ctx.beginPath();
  for (let i = 0; i < totalAxes; i++) {
    const angle = startAngle + i * angleStep;
    const score = axes[i].score;
    const valRatio = Math.max(0.12, Math.min(1.0, score / 100));
    const r = radius * valRatio;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    polygonPoints.push({ x, y, score });
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  // Gradient Fill
  const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius);
  grad.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
  grad.addColorStop(0.65, 'rgba(6, 182, 212, 0.3)');
  grad.addColorStop(1, 'rgba(16, 185, 129, 0.12)');
  ctx.fillStyle = grad;
  ctx.fill();

  // Glowing Outline
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = accentEmerald;
  ctx.shadowColor = 'rgba(16, 185, 129, 0.65)';
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 4. Vertex Points
  polygonPoints.forEach((pt) => {
    // Vertex dot
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = accentCyan;
    ctx.stroke();
  });

  // 5. Exterior Axis Title Labels (pushed outward with score inline)
  for (let i = 0; i < totalAxes; i++) {
    const angle = startAngle + i * angleStep;
    const labelR = radius + 34;
    const lx = cx + Math.cos(angle) * labelR;
    const ly = cy + Math.sin(angle) * labelR;

    ctx.fillStyle = labelTextColor;
    ctx.font = 'bold 11px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${axes[i].label} (${axes[i].score}%)`, lx, ly);
  }

  // 6. Central Readiness Score Readout
  const avgScore = Math.round(
    axes.reduce((sum, a) => sum + a.score, 0) / axes.length
  );

  ctx.beginPath();
  ctx.arc(cx, cy, 26, 0, Math.PI * 2);
  ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.94)' : 'rgba(6, 11, 22, 0.94)';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = avgScore >= 75 ? accentEmerald : '#f59e0b';
  ctx.stroke();

  ctx.fillStyle = avgScore >= 75 ? (isLight ? '#065f46' : '#34d399') : '#f59e0b';
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${avgScore}%`, cx, cy - 3);

  ctx.fillStyle = gridTextColor;
  ctx.font = '8px Cairo, sans-serif';
  ctx.fillText(lang === 'ar' ? 'جاهزية MEDDIC' : 'Readiness', cx, cy + 11);

  ctx.restore();
}

/**
 * 2. Enterprise Opportunity Scatter / Bubble Matrix
 */
export function renderOpportunityMatrix(
  canvas: HTMLCanvasElement,
  opportunities: OpportunityBubble[],
  currentParams: DealParams,
  currentMetrics: DealMetrics,
  isLight: boolean,
  lang: 'ar' | 'en'
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width > 0 ? rect.width : (canvas.parentElement?.clientWidth || 550);
  const height = rect.height > 0 ? rect.height : 360;

  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const padLeft = 60;
  const padRight = 30;
  const padTop = 35;
  const padBottom = 50;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const minDays = 30;
  const maxDays = 180;
  const toX = (days: number) => padLeft + ((Math.min(maxDays, Math.max(minDays, days)) - minDays) / (maxDays - minDays)) * chartW;
  const toY = (prob: number) => padTop + chartH - (Math.min(100, Math.max(0, prob)) / 100) * chartH;

  const midDays = 105;
  const midProb = 50;
  const splitX = toX(midDays);
  const splitY = toY(midProb);

  // Quadrants shading
  // Q1: Fast Strategic Wins
  ctx.fillStyle = isLight ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.06)';
  ctx.fillRect(padLeft, padTop, splitX - padLeft, splitY - padTop);

  // Q2: Enterprise Whales
  ctx.fillStyle = isLight ? 'rgba(6, 182, 212, 0.08)' : 'rgba(6, 182, 212, 0.06)';
  ctx.fillRect(splitX, padTop, width - padRight - splitX, splitY - padTop);

  // Q3: Tactical Nurture
  ctx.fillStyle = isLight ? 'rgba(245, 158, 11, 0.07)' : 'rgba(245, 158, 11, 0.04)';
  ctx.fillRect(padLeft, splitY, splitX - padLeft, height - padBottom - splitY);

  // Q4: Re-qualify Needed
  ctx.fillStyle = isLight ? 'rgba(239, 68, 68, 0.07)' : 'rgba(239, 68, 68, 0.04)';
  ctx.fillRect(splitX, splitY, width - padRight - splitX, height - padBottom - splitY);

  // Dividing dashed lines
  ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.18)' : 'rgba(255, 255, 255, 0.16)';
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.moveTo(splitX, padTop);
  ctx.lineTo(splitX, height - padBottom);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(padLeft, splitY);
  ctx.lineTo(width - padRight, splitY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Quadrant Watermark Labels in non-colliding corners
  ctx.font = 'bold 11px Cairo, sans-serif';
  ctx.fillStyle = isLight ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.35)';

  ctx.textAlign = 'left';
  ctx.fillText(lang === 'ar' ? '⚡ صفقات سريعة عالية العائد' : '⚡ Fast Strategic Wins', padLeft + 12, padTop + 16);

  ctx.textAlign = 'right';
  ctx.fillText(lang === 'ar' ? '🐋 صفقات كبرى استراتيجية' : '🐋 Enterprise Whales', width - padRight - 12, padTop + 16);

  ctx.textAlign = 'left';
  ctx.fillText(lang === 'ar' ? '🌱 فرص تنمية ونمو تكتيكي' : '🌱 Tactical Nurture', padLeft + 12, height - padBottom - 10);

  ctx.textAlign = 'right';
  ctx.fillText(lang === 'ar' ? '⚠️ فرص تتطلب إعادة هيكلة' : '⚠️ Re-qualify Needed', width - padRight - 12, height - padBottom - 10);

  // Axes lines
  ctx.strokeStyle = isLight ? '#cbd5e1' : '#334155';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padLeft, height - padBottom);
  ctx.lineTo(width - padRight, height - padBottom);
  ctx.moveTo(padLeft, padTop);
  ctx.lineTo(padLeft, height - padBottom);
  ctx.stroke();

  // Y Axis Ticks
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
  [0, 25, 50, 75, 100].forEach((p) => {
    const y = toY(p);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${p}%`, padLeft - 8, y);

    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - padRight, y);
    ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)';
    ctx.stroke();
  });

  // X Axis Ticks
  [30, 60, 90, 120, 150, 180].forEach((d) => {
    const x = toX(d);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`${d}d`, x, height - padBottom + 6);
  });

  // Axis Titles
  ctx.font = 'bold 11px Cairo, sans-serif';
  ctx.fillStyle = isLight ? '#1e293b' : '#e2e8f0';
  ctx.textAlign = 'center';
  ctx.fillText(
    lang === 'ar' ? 'دورة المبيعات المتوقعة بالأيام (Sales Cycle Days)' : 'Expected Sales Cycle (Days)',
    padLeft + chartW / 2,
    height - 14
  );

  ctx.save();
  ctx.translate(16, padTop + chartH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillText(
    lang === 'ar' ? 'احتمالية الإغلاق (Win Prob %)' : 'Win Probability (%)',
    0,
    0
  );
  ctx.restore();

  // Draw static opportunities with alternating non-overlapping badges
  (opportunities || []).forEach((opp, idx) => {
    const ox = toX(opp.cycleDays);
    const oy = toY(opp.winProb);
    const radius = Math.max(7, Math.min(18, Math.sqrt(opp.acv / 1000) * 0.40));
    const strokeColor = opp.color || '#06b6d4';

    ctx.beginPath();
    ctx.arc(ox, oy, radius, 0, Math.PI * 2);
    ctx.fillStyle = `${strokeColor}cc`;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();

    // Short Company Name
    const rawName = lang === 'ar' ? opp.accountAr : opp.accountEn;
    const shortName = rawName.split(' - ')[0].trim();

    // Alternating vertical offset so labels never collide
    const isAbove = idx % 2 === 0;
    const offsetY = isAbove ? -radius - 12 : radius + 14;

    // Small elegant badge
    ctx.font = 'bold 10px Cairo, sans-serif';
    const textW = ctx.measureText(shortName).width + 8;
    const textH = 16;
    const badgeX = Math.min(width - padRight - textW / 2, Math.max(padLeft + textW / 2, ox)) - textW / 2;
    const badgeY = oy + offsetY - (isAbove ? textH : 0);

    ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(15, 23, 42, 0.90)';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, textW, textH, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isLight ? '#0f172a' : '#f8fafc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(shortName, badgeX + textW / 2, badgeY + textH / 2);
  });

  // Active Simulated Deal Bubble
  const activeX = toX(currentMetrics.salesCycleDays);
  const activeY = toY(currentMetrics.winProbability);
  const activeRadius = Math.max(10, Math.min(26, Math.sqrt(currentParams.acv / 1000) * 0.46));

  // Glowing Outer Ring
  ctx.beginPath();
  ctx.arc(activeX, activeY, activeRadius + 8, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#f59e0b';
  ctx.setLineDash([3, 3]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Active Bubble
  ctx.beginPath();
  ctx.arc(activeX, activeY, activeRadius, 0, Math.PI * 2);
  const activeGrad = ctx.createRadialGradient(activeX, activeY, 2, activeX, activeY, activeRadius);
  activeGrad.addColorStop(0, '#fde047');
  activeGrad.addColorStop(0.7, '#f59e0b');
  activeGrad.addColorStop(1, '#d97706');
  ctx.fillStyle = activeGrad;
  ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
  ctx.shadowBlur = 15;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Active Star Symbol
  ctx.fillStyle = '#060b16';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★', activeX, activeY);

  // Active Deal Callout Box
  const activeClient = SECTOR_PRESETS[currentParams.sector]
    ? (lang === 'ar' ? SECTOR_PRESETS[currentParams.sector].clientAr : SECTOR_PRESETS[currentParams.sector].clientEn)
    : (lang === 'ar' ? 'الصفقة الحالية قيد التفاوض' : 'Active Simulated Deal');
  const shortName = activeClient.split(' - ')[0];
  const tagText = `⭐ ${shortName} (${formatSar(currentParams.acv, lang)})`;

  ctx.font = 'bold 11px Cairo, sans-serif';
  const tagW = ctx.measureText(tagText).width + 16;
  const tagH = 22;
  const tagX = Math.min(width - padRight - tagW, Math.max(padLeft, activeX - tagW / 2));
  const tagY = activeY - activeRadius - tagH - 6;

  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(tagX, tagY, tagW, tagH, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fde047';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tagText, tagX + tagW / 2, tagY + tagH / 2);

  ctx.restore();
}

/**
 * 3. 12-Month Cumulative ARR Growth Trajectory Curve (Baseline vs NAMA Strategic Acceleration)
 */
export function renderArrGrowthChart(
  canvas: HTMLCanvasElement,
  forecast: GrowthForecast,
  isLight: boolean,
  lang: 'ar' | 'en'
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width > 0 ? rect.width : (canvas.parentElement?.clientWidth || 550);
  const height = rect.height > 0 ? rect.height : 360;

  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const padLeft = 75;
  const padRight = 35;
  const padTop = 45;
  const padBottom = 45;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const months = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'];
  const baseline = forecast.baselineMonthlyArr || [];
  const accelerated = forecast.strategicMonthlyArr || [];

  const maxVal = Math.max(
    1_000_000,
    ...baseline,
    ...accelerated,
    forecast.strategicArr || 0
  ) * 1.15;

  const toX = (i: number) => padLeft + (i / (months.length - 1)) * chartW;
  const toY = (val: number) => padTop + chartH - (val / maxVal) * chartH;

  // Background Grid Lines
  const ySteps = 5;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  for (let s = 0; s <= ySteps; s++) {
    const val = (maxVal / ySteps) * s;
    const y = toY(val);

    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - padRight, y);
    ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillText(formatSar(val, lang), padLeft - 8, y);
  }

  // X Axis Ticks
  months.forEach((m, i) => {
    const x = toX(i);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
    ctx.fillText(m, x, height - padBottom + 8);
  });

  // 1. Draw Accelerated Area Fill (Gradient)
  if (accelerated.length > 0) {
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(0));
    accelerated.forEach((val: number, i: number) => {
      ctx.lineTo(toX(i), toY(val));
    });
    ctx.lineTo(toX(accelerated.length - 1), toY(0));
    ctx.closePath();

    const areaGrad = ctx.createLinearGradient(0, padTop, 0, height - padBottom);
    areaGrad.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
    areaGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.1)');
    areaGrad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
    ctx.fillStyle = areaGrad;
    ctx.fill();
  }

  // 2. Draw Baseline Curve (Dashed Sky/Blue)
  if (baseline.length > 0) {
    ctx.beginPath();
    baseline.forEach((val: number, i: number) => {
      const x = toX(i);
      const y = toY(val);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Baseline dots
    baseline.forEach((val: number, i: number) => {
      if (i % 2 === 0 || i === baseline.length - 1) {
        ctx.beginPath();
        ctx.arc(toX(i), toY(val), 3, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
      }
    });
  }

  // 3. Draw Accelerated Curve (Solid Glowing Emerald)
  if (accelerated.length > 0) {
    ctx.beginPath();
    accelerated.forEach((val: number, i: number) => {
      const x = toX(i);
      const y = toY(val);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Accelerated points & key callout tags
    accelerated.forEach((val: number, i: number) => {
      const x = toX(i);
      const y = toY(val);

      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#10b981';
      ctx.stroke();

      // Callout badges at M3, M6, M9, M12
      if (i === 2 || i === 5 || i === 8 || i === accelerated.length - 1) {
        const badgeText = formatSar(val, lang);
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        const tw = ctx.measureText(badgeText).width + 8;
        const th = 16;
        const bx = x - tw / 2;
        const by = y - th - 6;

        ctx.fillStyle = isLight ? '#065f46' : '#064e3b';
        ctx.beginPath();
        ctx.roundRect(bx, by, tw, th, 4);
        ctx.fill();

        ctx.fillStyle = '#a7f3d0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeText, x, by + th / 2);
      }
    });
  }

  // 4. Header Legend
  const legendY = 18;

  // Accelerated Legend
  ctx.beginPath();
  ctx.arc(padLeft + 10, legendY, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#10b981';
  ctx.fill();

  ctx.font = 'bold 11px Cairo, sans-serif';
  ctx.fillStyle = isLight ? '#065f46' : '#34d399';
  ctx.textAlign = 'left';
  const accelText = lang === 'ar' ? 'مسار نَمَاء لتطوير الأعمال (NAMA Strategic Acceleration)' : 'NAMA Strategic Acceleration';
  ctx.fillText(accelText, padLeft + 22, legendY);

  // Baseline Legend
  const accelWidth = ctx.measureText(accelText).width;
  const baseLegendX = padLeft + 22 + accelWidth + 24;

  ctx.beginPath();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.moveTo(baseLegendX, legendY);
  ctx.lineTo(baseLegendX + 16, legendY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = isLight ? '#0284c7' : '#38bdf8';
  ctx.textAlign = 'left';
  const baseText = lang === 'ar' ? 'المسار العضوي الأساسي (Baseline)' : 'Organic Baseline';
  ctx.fillText(baseText, baseLegendX + 22, legendY);

  // Strategic Lift Pill in Top Right
  const delta = (forecast.strategicArr || 0) - (forecast.projectedArr || 0);
  if (delta > 0) {
    const liftText = `+${formatSar(delta, lang)} ${lang === 'ar' ? 'تسارع استراتيجي' : 'Strategic Lift'}`;
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    const lw = ctx.measureText(liftText).width + 12;
    const lx = width - padRight - lw;
    const ly = legendY - 8;

    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(lx, ly, lw, 18, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(liftText, lx + lw / 2, ly + 9);
  }

  ctx.restore();
}
