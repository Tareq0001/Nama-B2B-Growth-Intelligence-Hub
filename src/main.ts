import confetti from 'canvas-confetti';
import {
  SectorKey,
  DealParams,
  DealMetrics,
  PIPELINE_STAGES,
  SECTOR_PRESETS,
  ENTERPRISE_OPPORTUNITIES,
  calculateDealMetrics,
  GrowthInputs,
  GrowthForecast,
  calculateGrowthForecast,
  playClickSound,
  playStageSound,
  playToggleSound,
  playContractClosedChord,
  setSoundEnabled,
  isSoundEnabled
} from './b2b/dealEngine';
import { B2BEcosystemScene, CameraPreset } from './b2b/ecosystemModel';
import {
  renderMeddicRadar,
  renderOpportunityMatrix,
  renderArrGrowthChart,
  formatSar
} from './b2b/radarAndMatrixCanvas';
import {
  LEARNING_MODULES,
  CASE_STUDIES,
  B2B_QUIZ_QUESTIONS,
  GLOSSARY_TERMS,
  EDUCATIONAL_TOOLTIPS,
  CaseStudy,
  QuizQuestion,
  GlossaryTerm
} from './b2b/learningEngine';

// ==========================================
// Application State
// ==========================================
let currentLang: 'ar' | 'en' = 'ar';
let isLightMode = false;

let currentParams: DealParams = {
  sector: 'fintech',
  acv: 1250000,
  years: 3,
  discount: 10,
  meddicScore: 84,
  leverRoi: true,
  leverSla: true,
  leverPoc: true,
  leverAlliance: false,
  activeStage: 0
};

let currentMetrics: DealMetrics = calculateDealMetrics(currentParams);

let growthInputs: GrowthInputs = {
  monthlyLeads: 24,
  conversionRate: 18,
  avgAcv: 1250000,
  cac: 180000,
  grossMargin: 75,
  nrr: 118
};

let currentGrowthForecast: GrowthForecast = calculateGrowthForecast(growthInputs);

let ecosystemScene: B2BEcosystemScene | null = null;

// ==========================================
// Initialization on DOM Content Loaded
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D Scene
  const canvasContainer = document.getElementById('canvas-container');
  if (canvasContainer) {
    ecosystemScene = new B2BEcosystemScene(canvasContainer, (stageIdx) => {
      setPipelineStage(stageIdx);
    });
    ecosystemScene.updateDealParams(currentParams, currentMetrics);
  }

  // 2. Setup Event Listeners
  setupNavigationTabs();
  setupCameraButtons();
  setupPipelineBar();
  setupSectorPills();
  setupSliders();
  setupLevers();
  setupGrowthInputs();
  setupProposalModal();
  setupHeaderActionButtons();
  setupOpportunityTable();
  setupEducationalAcademy();
  setupEducationalTooltips();

  // 3. Initial UI & Canvas Render
  updateSimulatorUI();
  updateGrowthCalcUI();
  renderAllCanvases();

  // Handle Window Resize
  window.addEventListener('resize', () => {
    if (ecosystemScene) ecosystemScene.resize();
    renderAllCanvases();
  });
});

// ==========================================
// Navigation & Tab Switching
// ==========================================
function setupNavigationTabs(): void {
  const tabBtns = document.querySelectorAll<HTMLButtonElement>('.tab-btn');
  const panels = document.querySelectorAll<HTMLElement>('.tab-panel');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      playClickSound();
      const targetId = btn.getAttribute('data-tab');

      tabBtns.forEach((b) => b.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(targetId || '');
      if (targetPanel) {
        targetPanel.classList.add('active');
      }

      // If switching to 3D, trigger resize
      if (targetId === 'panel-3d' && ecosystemScene) {
        setTimeout(() => ecosystemScene?.resize(), 50);
      }

      // If switching to 2D tabs, re-render canvases
      if (targetId === 'panel-radar' || targetId === 'panel-calc') {
        setTimeout(() => renderAllCanvases(), 60);
      }
    });
  });
}

// ==========================================
// Camera Presets
// ==========================================
function setupCameraButtons(): void {
  const camBtns = document.querySelectorAll<HTMLButtonElement>('.cam-btn');
  camBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      playClickSound();
      camBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const preset = btn.getAttribute('data-cam') as CameraPreset;
      if (ecosystemScene && preset) {
        ecosystemScene.setCameraPreset(preset);
      }
    });
  });
}

// ==========================================
// 5-Stage Deal Pipeline Bar
// ==========================================
function setupPipelineBar(): void {
  const steps = document.querySelectorAll<HTMLButtonElement>('.pipeline-step');
  steps.forEach((step) => {
    step.addEventListener('click', () => {
      const stageIdx = parseInt(step.getAttribute('data-stage') || '0', 10);
      setPipelineStage(stageIdx);
    });
  });
}

function setPipelineStage(stageIdx: number): void {
  const safeIdx = Math.max(0, Math.min(4, stageIdx));
  currentParams.activeStage = safeIdx;
  playStageSound(safeIdx);

  // Update pipeline buttons active class
  const steps = document.querySelectorAll<HTMLButtonElement>('.pipeline-step');
  steps.forEach((step, idx) => {
    if (idx === safeIdx) step.classList.add('active');
    else step.classList.remove('active');
  });

  // Re-calculate metrics
  currentMetrics = calculateDealMetrics(currentParams);

  // Update 3D scene
  if (ecosystemScene) {
    ecosystemScene.updateDealParams(currentParams, currentMetrics);
    ecosystemScene.setHighlightedStage(safeIdx);
  }

  // Update UI & Canvases
  updateSimulatorUI();
  renderAllCanvases();
}

// ==========================================
// Sector Preset Pills
// ==========================================
function setupSectorPills(): void {
  const pills = document.querySelectorAll<HTMLButtonElement>('.sector-pill');
  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      playClickSound();
      pills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');

      const secKey = pill.getAttribute('data-sector') as SectorKey;
      if (secKey && SECTOR_PRESETS[secKey]) {
        const preset = SECTOR_PRESETS[secKey];
        currentParams.sector = secKey;
        currentParams.acv = preset.acv;
        currentParams.years = preset.years;
        currentParams.discount = preset.discount;
        currentParams.meddicScore = preset.meddicScore;
        currentParams.leverRoi = preset.leverRoi;
        currentParams.leverSla = preset.leverSla;
        currentParams.leverPoc = preset.leverPoc;
        currentParams.leverAlliance = preset.leverAlliance;

        // Sync inputs
        syncInputsWithState();
        recalculateAll();
      }
    });
  });
}

// ==========================================
// Sliders & Levers Setup
// ==========================================
function setupSliders(): void {
  const acvSlider = document.getElementById('acvSlider') as HTMLInputElement | null;
  const yearsSlider = document.getElementById('yearsSlider') as HTMLInputElement | null;
  const discountSlider = document.getElementById('discountSlider') as HTMLInputElement | null;
  const meddicSlider = document.getElementById('meddicSlider') as HTMLInputElement | null;

  acvSlider?.addEventListener('input', (e) => {
    currentParams.acv = parseInt((e.target as HTMLInputElement).value, 10);
    recalculateAll();
  });

  yearsSlider?.addEventListener('input', (e) => {
    currentParams.years = parseInt((e.target as HTMLInputElement).value, 10);
    recalculateAll();
  });

  discountSlider?.addEventListener('input', (e) => {
    currentParams.discount = parseInt((e.target as HTMLInputElement).value, 10);
    recalculateAll();
  });

  meddicSlider?.addEventListener('input', (e) => {
    currentParams.meddicScore = parseInt((e.target as HTMLInputElement).value, 10);
    recalculateAll();
  });
}

function setupLevers(): void {
  const leverRoi = document.getElementById('leverRoi') as HTMLInputElement | null;
  const leverSla = document.getElementById('leverSla') as HTMLInputElement | null;
  const leverPoc = document.getElementById('leverPoc') as HTMLInputElement | null;
  const leverAlliance = document.getElementById('leverAlliance') as HTMLInputElement | null;

  const bindToggle = (input: HTMLInputElement | null, prop: keyof DealParams) => {
    input?.addEventListener('change', () => {
      const active = input.checked;
      (currentParams as any)[prop] = active;
      playToggleSound(active);
      recalculateAll();
    });
  };

  bindToggle(leverRoi, 'leverRoi');
  bindToggle(leverSla, 'leverSla');
  bindToggle(leverPoc, 'leverPoc');
  bindToggle(leverAlliance, 'leverAlliance');
}

function syncInputsWithState(): void {
  const acvSlider = document.getElementById('acvSlider') as HTMLInputElement | null;
  const yearsSlider = document.getElementById('yearsSlider') as HTMLInputElement | null;
  const discountSlider = document.getElementById('discountSlider') as HTMLInputElement | null;
  const meddicSlider = document.getElementById('meddicSlider') as HTMLInputElement | null;

  if (acvSlider) acvSlider.value = String(currentParams.acv);
  if (yearsSlider) yearsSlider.value = String(currentParams.years);
  if (discountSlider) discountSlider.value = String(currentParams.discount);
  if (meddicSlider) meddicSlider.value = String(currentParams.meddicScore);

  const leverRoi = document.getElementById('leverRoi') as HTMLInputElement | null;
  const leverSla = document.getElementById('leverSla') as HTMLInputElement | null;
  const leverPoc = document.getElementById('leverPoc') as HTMLInputElement | null;
  const leverAlliance = document.getElementById('leverAlliance') as HTMLInputElement | null;

  if (leverRoi) leverRoi.checked = currentParams.leverRoi;
  if (leverSla) leverSla.checked = currentParams.leverSla;
  if (leverPoc) leverPoc.checked = currentParams.leverPoc;
  if (leverAlliance) leverAlliance.checked = currentParams.leverAlliance;
}

function recalculateAll(): void {
  currentMetrics = calculateDealMetrics(currentParams);
  if (ecosystemScene) {
    ecosystemScene.updateDealParams(currentParams, currentMetrics);
  }
  updateSimulatorUI();
  renderAllCanvases();
}

// ==========================================
// Growth Calculator Inputs Setup
// ==========================================
function setupGrowthInputs(): void {
  const leadsInput = document.getElementById('leadsInput') as HTMLInputElement | null;
  const convInput = document.getElementById('convInput') as HTMLInputElement | null;
  const avgAcvInput = document.getElementById('avgAcvInput') as HTMLInputElement | null;
  const cacInput = document.getElementById('cacInput') as HTMLInputElement | null;
  const grossMarginInput = document.getElementById('grossMarginInput') as HTMLInputElement | null;
  const nrrInput = document.getElementById('nrrInput') as HTMLInputElement | null;

  const onGrowthChange = () => {
    growthInputs.monthlyLeads = parseInt(leadsInput?.value || '24', 10);
    growthInputs.conversionRate = parseInt(convInput?.value || '18', 10);
    growthInputs.avgAcv = parseInt(avgAcvInput?.value || '1250000', 10);
    growthInputs.cac = parseInt(cacInput?.value || '180000', 10);
    growthInputs.grossMargin = parseInt(grossMarginInput?.value || '75', 10);
    growthInputs.nrr = parseInt(nrrInput?.value || '118', 10);

    currentGrowthForecast = calculateGrowthForecast(growthInputs);
    updateGrowthCalcUI();

    const arrChartCanvas = document.getElementById('arrChartCanvas') as HTMLCanvasElement | null;
    if (arrChartCanvas) {
      renderArrGrowthChart(arrChartCanvas, currentGrowthForecast, isLightMode, currentLang);
    }
  };

  [leadsInput, convInput, avgAcvInput, cacInput, grossMarginInput, nrrInput].forEach((input) => {
    input?.addEventListener('input', onGrowthChange);
  });
}

// ==========================================
// Update UI Displays & Text
// ==========================================
function updateSimulatorUI(): void {
  // Slider badges
  const acvVal = document.getElementById('acvVal');
  const yearsVal = document.getElementById('yearsVal');
  const discountVal = document.getElementById('discountVal');
  const meddicVal = document.getElementById('meddicVal');

  if (acvVal) acvVal.textContent = formatSar(currentParams.acv, currentLang);
  if (yearsVal) {
    yearsVal.textContent = currentLang === 'ar' ? `${currentParams.years} سنوات` : `${currentParams.years} Years`;
  }
  if (discountVal) discountVal.textContent = `${currentParams.discount}%`;
  if (meddicVal) meddicVal.textContent = `${currentParams.meddicScore}%`;

  // Financial KPIs
  const kpiTcv = document.getElementById('kpiTcv');
  const kpiWinProb = document.getElementById('kpiWinProb');
  const kpiMargin = document.getElementById('kpiMargin');
  const kpiCycle = document.getElementById('kpiCycle');
  const kpiNetAcvHint = document.getElementById('kpiNetAcvHint');
  const kpiArrImpactHint = document.getElementById('kpiArrImpactHint');

  if (kpiTcv) kpiTcv.textContent = formatSar(currentMetrics.tcv, currentLang);
  if (kpiWinProb) kpiWinProb.textContent = `${currentMetrics.winProbability}%`;
  if (kpiMargin) kpiMargin.textContent = `${currentMetrics.netMargin}%`;
  if (kpiCycle) {
    kpiCycle.textContent = currentLang === 'ar' ? `${currentMetrics.salesCycleDays} يوماً` : `${currentMetrics.salesCycleDays} Days`;
  }
  if (kpiNetAcvHint) {
    kpiNetAcvHint.textContent = currentLang === 'ar'
      ? `صافي سنوي: ${formatSar(currentMetrics.netAcv, currentLang)}`
      : `Net ARR: ${formatSar(currentMetrics.netAcv, currentLang)}`;
  }
  if (kpiArrImpactHint) {
    kpiArrImpactHint.textContent = currentLang === 'ar'
      ? `الأثر المرجح: ${formatSar(currentMetrics.estimatedArrImpact, currentLang)}`
      : `Weighted ARR: ${formatSar(currentMetrics.estimatedArrImpact, currentLang)}`;
  }

  // 3D HUD Telemetry
  const hudClientName = document.getElementById('hudClientName');
  const hudStageName = document.getElementById('hudStageName');
  const hudDealHealth = document.getElementById('hudDealHealth');

  const preset = SECTOR_PRESETS[currentParams.sector];
  if (hudClientName && preset) {
    hudClientName.textContent = currentLang === 'ar' ? preset.clientAr : preset.clientEn;
  }

  const stage = PIPELINE_STAGES[currentParams.activeStage];
  if (hudStageName && stage) {
    hudStageName.textContent = currentLang === 'ar' ? stage.badgeAr : stage.badgeEn;
  }

  if (hudDealHealth) {
    hudDealHealth.textContent = `${currentMetrics.winProbability}% (${currentLang === 'ar' ? currentMetrics.dealHealthLabelAr : currentMetrics.dealHealthLabelEn})`;
  }

  // Stage Insight Box
  const stageInsightTitle = document.getElementById('stageInsightTitle');
  const stageInsightDesc = document.getElementById('stageInsightDesc');
  const stageInsightAction = document.getElementById('stageInsightAction');

  if (stageInsightTitle && stage) {
    stageInsightTitle.textContent = currentLang === 'ar' ? stage.titleAr : stage.titleEn;
  }
  if (stageInsightDesc && stage) {
    stageInsightDesc.textContent = currentLang === 'ar' ? stage.descAr : stage.descEn;
  }
  if (stageInsightAction && stage) {
    const actionLabel = currentLang === 'ar' ? 'الإجراء التنفيذي الموصى به: ' : 'Recommended Specialist Action: ';
    stageInsightAction.textContent = `${actionLabel}${currentLang === 'ar' ? stage.actionAr : stage.actionEn}`;
  }

  // MEDDIC Breakdown in Tab 2
  const meddicBreakdownList = document.getElementById('meddicBreakdownList');
  const meddicHeaderScore = document.getElementById('meddicHeaderScore');

  if (meddicHeaderScore) {
    meddicHeaderScore.textContent = `${currentParams.meddicScore}% ${currentLang === 'ar' ? 'مؤهل' : 'Qualified'}`;
  }

  if (meddicBreakdownList && currentMetrics.meddicAxes) {
    meddicBreakdownList.innerHTML = currentMetrics.meddicAxes
      .map(
        (axis) => `
        <div class="meddic-item-box">
          <span class="meddic-item-label">${currentLang === 'ar' ? axis.labelAr : axis.labelEn}</span>
          <span class="meddic-item-score">${axis.score}%</span>
        </div>
      `
      )
      .join('');
  }
}

function updateGrowthCalcUI(): void {
  // Input Badges
  const leadsVal = document.getElementById('leadsVal');
  const convVal = document.getElementById('convVal');
  const avgAcvVal = document.getElementById('avgAcvVal');
  const cacVal = document.getElementById('cacVal');
  const grossMarginVal = document.getElementById('grossMarginVal');
  const nrrVal = document.getElementById('nrrVal');

  if (leadsVal) leadsVal.textContent = currentLang === 'ar' ? `${growthInputs.monthlyLeads} فرصة` : `${growthInputs.monthlyLeads} Leads`;
  if (convVal) convVal.textContent = `${growthInputs.conversionRate}%`;
  if (avgAcvVal) avgAcvVal.textContent = formatSar(growthInputs.avgAcv, currentLang);
  if (cacVal) cacVal.textContent = formatSar(growthInputs.cac, currentLang);
  if (grossMarginVal) grossMarginVal.textContent = `${growthInputs.grossMargin}%`;
  if (nrrVal) nrrVal.textContent = `${growthInputs.nrr}%`;

  // Output KPI cards
  const outProjectedArr = document.getElementById('outProjectedArr');
  const resNewClients = document.getElementById('resNewClients');
  const outLtvCac = document.getElementById('outLtvCac');
  const resLtvVal = document.getElementById('resLtvVal');
  const outPayback = document.getElementById('outPayback');
  const outStrategicLift = document.getElementById('outStrategicLift');
  const arrBadgeTotal = document.getElementById('arrBadgeTotal');

  if (outProjectedArr) {
    outProjectedArr.textContent = formatSar(currentGrowthForecast.projectedArr, currentLang);
  }
  if (resNewClients) {
    resNewClients.textContent = currentLang === 'ar'
      ? `${currentGrowthForecast.newClientsPerYear} عميلاً جديداً سنوياً`
      : `${currentGrowthForecast.newClientsPerYear} New Clients / Yr`;
  }
  if (outLtvCac) {
    outLtvCac.textContent = `${currentGrowthForecast.ltvCacRatio}x`;
  }
  if (resLtvVal) {
    resLtvVal.textContent = currentLang === 'ar'
      ? `القيمة الدائمة: ${formatSar(currentGrowthForecast.ltv, currentLang)}`
      : `Lifetime Value: ${formatSar(currentGrowthForecast.ltv, currentLang)}`;
  }
  if (outPayback) {
    outPayback.textContent = currentLang === 'ar'
      ? `${currentGrowthForecast.cacPaybackMonths} شهراً`
      : `${currentGrowthForecast.cacPaybackMonths} Months`;
  }
  if (outStrategicLift) {
    const lift = currentGrowthForecast.strategicArr - currentGrowthForecast.projectedArr;
    outStrategicLift.textContent = `+${formatSar(lift, currentLang)}`;
  }
  if (arrBadgeTotal) {
    const lift = currentGrowthForecast.strategicArr - currentGrowthForecast.projectedArr;
    const pct = Math.round((lift / (currentGrowthForecast.projectedArr || 1)) * 100);
    arrBadgeTotal.textContent = `+${pct}% ${currentLang === 'ar' ? 'نمو متسارع' : 'Strategic Lift'}`;
  }
}

// ==========================================
// 2D Canvases Rendering
// ==========================================
function renderAllCanvases(): void {
  const meddicCanvas = document.getElementById('meddicCanvas') as HTMLCanvasElement | null;
  if (meddicCanvas) {
    renderMeddicRadar(meddicCanvas, currentMetrics, isLightMode, currentLang);
  }

  const matrixCanvas = document.getElementById('matrixCanvas') as HTMLCanvasElement | null;
  if (matrixCanvas) {
    renderOpportunityMatrix(matrixCanvas, ENTERPRISE_OPPORTUNITIES, currentParams, currentMetrics, isLightMode, currentLang);
  }

  const arrChartCanvas = document.getElementById('arrChartCanvas') as HTMLCanvasElement | null;
  if (arrChartCanvas) {
    renderArrGrowthChart(arrChartCanvas, currentGrowthForecast, isLightMode, currentLang);
  }
}

// ==========================================
// Interactive Enterprise Opportunity Table
// ==========================================
function setupOpportunityTable(): void {
  const tbody = document.getElementById('opportunityTableBody');
  if (!tbody) return;

  tbody.innerHTML = ENTERPRISE_OPPORTUNITIES.map((opp) => {
    const accountName = currentLang === 'ar' ? opp.accountAr : opp.accountEn;
    const sectorName = currentLang === 'ar' ? opp.sectorAr : opp.sectorEn;
    const stage = PIPELINE_STAGES[opp.stageIndex];
    const stageBadge = currentLang === 'ar' ? stage.badgeAr : stage.badgeEn;

    return `
      <tr class="opp-row" data-id="${opp.id}">
        <td class="opp-account-name">${accountName}</td>
        <td>${sectorName}</td>
        <td class="opp-acv-badge">${formatSar(opp.acv, currentLang)}</td>
        <td style="font-family: var(--font-mono);">${opp.cycleDays}d</td>
        <td style="font-family: var(--font-mono); font-weight: 700; color: #10b981;">${opp.winProb}%</td>
        <td><span class="badge-tech" style="font-size: 0.68rem;">${stageBadge}</span></td>
      </tr>
    `;
  }).join('');

  // Row Click Event
  const rows = tbody.querySelectorAll<HTMLTableRowElement>('.opp-row');
  rows.forEach((row) => {
    row.addEventListener('click', () => {
      const oppId = row.getAttribute('data-id');
      const opp = ENTERPRISE_OPPORTUNITIES.find((o) => o.id === oppId);
      if (opp) {
        playClickSound();
        currentParams.acv = opp.acv;
        currentParams.activeStage = opp.stageIndex;

        // Map sector roughly
        if (opp.sectorEn.includes('FinTech')) currentParams.sector = 'fintech';
        else if (opp.sectorEn.includes('GovTech') || opp.sectorEn.includes('Smart Cities')) currentParams.sector = 'govtech';
        else if (opp.sectorEn.includes('Cloud') || opp.sectorEn.includes('AI')) currentParams.sector = 'cloud_ai';
        else if (opp.sectorEn.includes('Telecom')) currentParams.sector = 'telecom';

        syncInputsWithState();
        recalculateAll();

        // Switch to Tab 1 to see the updated deal in 3D
        const tab3dBtn = document.getElementById('tab-3d');
        tab3dBtn?.click();
      }
    });
  });
}

// ==========================================
// Proposal Modal & Execution Engine
// ==========================================
function setupProposalModal(): void {
  const openBtn = document.getElementById('openReportBtn');
  const closeBtn = document.getElementById('closeReportBtn');
  const printBtn = document.getElementById('printReportBtn');
  const modal = document.getElementById('reportModal');
  const executeBtn = document.getElementById('executeDealBtn');

  const openModal = () => {
    playClickSound();
    populateProposalModal();
    modal?.classList.add('show');
  };

  const closeModal = () => {
    playClickSound();
    modal?.classList.remove('show');
  };

  openBtn?.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  printBtn?.addEventListener('click', () => {
    window.print();
  });

  // Execute Deal Action (Celebration & Closed-Won)
  executeBtn?.addEventListener('click', () => {
    // 1. Advance to stage 4 (Closed-Won)
    setPipelineStage(4);

    // 2. Play celebratory sound & Three.js shockwave
    playContractClosedChord();
    if (ecosystemScene) {
      ecosystemScene.triggerContractClosedWave();
    }

    // 3. Multi-burst Confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#06b6d4', '#ffffff']
    });

    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10b981', '#fbbf24']
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#06b6d4', '#34d399']
      });
    }, 250);

    // 4. Open Proposal Modal
    setTimeout(() => {
      openModal();
    }, 600);
  });
}

function populateProposalModal(): void {
  const preset = SECTOR_PRESETS[currentParams.sector];
  const clientName = currentLang === 'ar' ? preset.clientAr : preset.clientEn;
  const sectorName = currentLang === 'ar' ? preset.nameAr : preset.nameEn;

  const docTargetClient = document.getElementById('docTargetClient');
  const docSectorName = document.getElementById('docSectorName');
  const docSignClientName = document.getElementById('docSignClientName');

  if (docTargetClient) docTargetClient.textContent = clientName;
  if (docSectorName) docSectorName.textContent = sectorName;
  if (docSignClientName) {
    docSignClientName.textContent = currentLang === 'ar'
      ? `المفوض بالتوقيع — ${clientName.split(' - ')[0]}`
      : `Authorized Signatory — ${clientName.split(' - ')[0]}`;
  }

  // Financial Table
  const docAcvVal = document.getElementById('docAcvVal');
  const docDurationVal = document.getElementById('docDurationVal');
  const docDiscountVal = document.getElementById('docDiscountVal');
  const docNetAcvVal = document.getElementById('docNetAcvVal');
  const docTcvVal = document.getElementById('docTcvVal');
  const docMarginVal = document.getElementById('docMarginVal');
  const docMeddicVal = document.getElementById('docMeddicVal');

  if (docAcvVal) docAcvVal.textContent = formatSar(currentParams.acv, currentLang);
  if (docDurationVal) {
    docDurationVal.textContent = currentLang === 'ar' ? `${currentParams.years} سنوات` : `${currentParams.years} Years`;
  }
  if (docDiscountVal) {
    const discountAmt = Math.round(currentParams.acv * (currentParams.discount / 100));
    docDiscountVal.textContent = `${currentParams.discount}% (${formatSar(discountAmt, currentLang)})`;
  }
  if (docNetAcvVal) docNetAcvVal.textContent = formatSar(currentMetrics.netAcv, currentLang);
  if (docTcvVal) docTcvVal.textContent = formatSar(currentMetrics.tcv, currentLang);
  if (docMarginVal) docMarginVal.textContent = `${currentMetrics.netMargin}%`;
  if (docMeddicVal) docMeddicVal.textContent = `${currentParams.meddicScore}%`;
}

// ==========================================
// Header Action Buttons: Audio, Theme, Lang
// ==========================================
function setupHeaderActionButtons(): void {
  // Audio Toggle
  const audioBtn = document.getElementById('audioToggleBtn');
  const audioIcon = document.getElementById('audioIcon');
  audioBtn?.addEventListener('click', () => {
    const enabled = !isSoundEnabled();
    setSoundEnabled(enabled);
    if (audioIcon) {
      audioIcon.innerHTML = enabled ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>';
    }
    if (enabled) playClickSound();
  });

  // Theme Toggle
  const themeBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  themeBtn?.addEventListener('click', () => {
    isLightMode = !isLightMode;
    playClickSound();

    if (isLightMode) {
      document.body.classList.add('light-theme');
      if (themeIcon) themeIcon.innerHTML = '<i class="fa-solid fa-moon"></i>';
    } else {
      document.body.classList.remove('light-theme');
      if (themeIcon) themeIcon.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }

    if (ecosystemScene) {
      ecosystemScene.setTheme(isLightMode);
    }
    renderAllCanvases();
  });

  // Language Toggle
  const langBtn = document.getElementById('langToggleBtn');
  const langText = document.getElementById('langText');
  langBtn?.addEventListener('click', () => {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    playClickSound();

    if (langText) langText.textContent = currentLang === 'ar' ? 'EN' : 'عربي';

    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

    applyLanguageTranslations(currentLang);
    updateSimulatorUI();
    updateGrowthCalcUI();
    setupOpportunityTable();
    renderAllCanvases();
  });
}

// ==========================================
// Bilingual Text Localization
// ==========================================
function applyLanguageTranslations(lang: 'ar' | 'en'): void {
  const isAr = lang === 'ar';

  const setElemText = (id: string, arText: string, enText: string) => {
    const el = document.getElementById(id);
    if (el) el.textContent = isAr ? arText : enText;
  };

  setElemText('appTitle', 'نَمَاء | NAMA 3D', 'NAMA 3D | نَمَاء');
  setElemText(
    'appSubtitle',
    'منظومة تطوير الأعمال والشراكات الاستراتيجية وذكاء الإيرادات المؤسسية',
    'Enterprise B2B Business Development, Strategic Partnerships & Revenue Intelligence Suite'
  );
  setElemText(
    'authorBadge',
    'إعداد وتطوير: أ. طارق ابوعشي',
    'Architect: Tareq Abuashi'
  );
  setElemText(
    'reportBtnText',
    'العرض التجاري المعتمد',
    'B2B Commercial Proposal'
  );

  // Tabs
  setElemText('tabLabel3d', 'الفضاء ثلاثي الأبعاد وقمع الصفقات', '3D Ecosystem & Deal Funnel');
  setElemText('tabLabelRadar', 'رادار MEDDIC ومصفوفة الفرص', 'MEDDIC Radar & Opportunity Matrix');
  setElemText('tabLabelCalc', 'حاسبة نمو الإيرادات والعائد ARR', 'Revenue Growth & LTV:CAC Engine');

  // Camera Presets
  setElemText('camPresetsLabel', 'زوايا الكاميرا:', 'Camera Angles:');
  setElemText('camBtnOrbit', 'مدار حر (Orbit)', 'Free Orbit');
  setElemText('camBtnEco', 'المنظومة (Ecosystem)', 'Ecosystem View');
  setElemText('camBtnFunnel', 'قمع الصفقات (Funnel)', 'Funnel View');
  setElemText('camBtnRadar', 'الرادار العلوي (Top-Down)', 'Top-Down Radar');
  setElemText('camBtnCore', 'قلب الإيرادات (Core)', 'Revenue Core');
  setElemText('liveStatusText', 'محاكاة حية متزامنة', 'Live Synchronized Simulation');

  // HUD Labels
  setElemText('hudClientLabel', 'العميل المستهدف:', 'Target Enterprise Client:');
  setElemText('hudStageLabel', 'المرحلة الحالية:', 'Active Pipeline Stage:');
  setElemText('hudHealthLabel', 'مؤشر جودة الصفقة:', 'Deal Health & Score:');

  // Controls Sidebar
  setElemText('sidebarTitle', 'محاكي هيكلة الصفقات والتفاوض', 'Deal Structuring & Negotiation');
  setElemText('sidebarSubtitle', 'ضبط المتغيرات التجارية واستراتيجيات التفاوض المتقدمة', 'Configure commercial levers and strategic deal terms');
  setElemText('sectorSelectLabel', 'القطاع الاستراتيجي المستهدف:', 'Target Enterprise Sector:');
  setElemText('acvLabel', 'قيمة التعاقد السنوي (ACV):', 'Annual Contract Value (ACV):');
  setElemText('yearsLabel', 'مدة التعاقد الاستراتيجي:', 'Strategic Contract Duration:');
  setElemText('discountLabel', 'نسبة الخصم التفاوضي التجاري:', 'Commercial Negotiation Discount:');
  setElemText('meddicLabel', 'معيار الجاهزية والتأهيل (MEDDIC):', 'MEDDIC Qualification Score:');
  setElemText('leversLabel', 'روافع التفاوض وإغلاق الصفقات (Strategic Levers):', 'Strategic Negotiation Levers:');

  // Levers
  setElemText('leverRoiName', 'ضمان العائد الاستثماري (ROI Guarantee)', 'Value-Based ROI Guarantee Clause');
  setElemText('leverRoiSub', 'بند توثيق واسترداد القيمة الملموسة (+5% احتمالية)', 'Commitment to quantifiable value realization (+5% Win Prob)');
  setElemText('leverSlaName', 'اتفاقية مستوى خدمة ذهبية (SLA 99.99%)', 'Tier-1 Mission-Critical SLA (99.99%)');
  setElemText('leverSlaSub', 'استجابة فورية وحوكمة حرجة (+4% احتمالية)', 'Sub-15m critical incident response (+4% Win Prob)');
  setElemText('leverPocName', 'إثبات مفهوم تجريبي سريع (14-Day PoC)', '14-Day Rapid Pilot / PoC Sandbox');
  setElemText('leverPocSub', 'بيئة رملية آمنة تزيل المخاطر الفنية (-14 يوم دورة)', 'De-risks architecture and shortens sales cycle (-14 Days)');
  setElemText('leverAllianceName', 'تحالف استراتيجي وتكامل بيئي (Partner Co-Sell)', 'Co-Marketing & Strategic Channel Alliance');
  setElemText('leverAllianceSub', 'بيع مشترك وتكامل منظومة الشركاء (+5% احتمالية)', 'Leverages joint ecosystem go-to-market (+5% Win Prob)');

  // KPIs
  setElemText('kpiTcvLabel', 'إجمالي قيمة التعاقد (TCV)', 'Total Contract Value (TCV)');
  setElemText('kpiWinProbLabel', 'احتمالية إغلاق الصفقة (Win Prob)', 'Win Probability (%)');
  setElemText('kpiMarginLabel', 'صافي هامش الربح (Net Margin)', 'Net Delivery Margin (%)');
  setElemText('kpiCycleLabel', 'دورة المبيعات المتوقعة (Cycle Velocity)', 'Predicted Sales Cycle');
  setElemText('executeBtnText', 'إتمام التعاقد وتوقيع الشراكة (Execute Closed-Won)', 'Execute Closed-Won Contract');

  // Tab 2
  setElemText('meddicCardTitle', 'رادار تأهيل الفرص الكبرى (MEDDIC Qualification Radar)', 'MEDDIC Enterprise Qualification Radar');
  setElemText('meddicCardSub', 'التحليل السداسي العميق لجاهزية الصفقة وإزالة مخاطر الإلغاء', 'Deep 6-axis qualification telemetry for risk mitigation');
  setElemText('matrixCardTitle', 'مصفوفة الفرص التجارية وحسابات الشركات (Opportunity Matrix)', 'Enterprise Opportunity & Velocity Matrix');
  setElemText('matrixCardSub', 'تحليل السرعة مقابل الاحتمالية وحجم التعاقد (اضغط على أي صف لتفعيله)', 'Cycle days vs. win probability & ACV bubble sizing (Click row to load)');
  setElemText('matrixHint', '8 حسابات قيادية نشطة', '8 Key Strategic Accounts');
  setElemText('thAccount', 'الحساب المستهدف / المنظمة', 'Target Enterprise Account');
  setElemText('thSector', 'القطاع', 'Sector');
  setElemText('thAcv', 'قيمة التعاقد (ACV)', 'ACV (SAR)');
  setElemText('thCycle', 'دورة المبيعات', 'Sales Cycle');
  setElemText('thWinProb', 'احتمالية الإغلاق', 'Win Prob %');
  setElemText('thStage', 'المرحلة', 'Stage');

  // Tab 3
  setElemText('calcCardTitle', 'محرك نمو الإيرادات واقتصاديات الوحدة (B2B Unit Economics)', 'B2B Unit Economics & Growth Engine');
  setElemText('calcCardSub', 'نمذجة استقطاب العملاء المؤسسيين، تكلفة الاستحواذ والقيمة الدائمة', 'Enterprise cohort modeling, CAC payback & LTV expansion');
  setElemText('leadsLabel', 'الفرص المؤهلة شهرياً (Monthly Leads):', 'Qualified Enterprise Leads / Month:');
  setElemText('convLabel', 'معدل تحويل الفرص الكلي (Conversion %):', 'Overall Pipeline Conversion Rate (%):');
  setElemText('avgAcvLabel', 'متوسط قيمة الصفقة (Average ACV):', 'Average Contract Value (ACV):');
  setElemText('cacLabel', 'تكلفة الاستحواذ المؤسسية (CAC):', 'Customer Acquisition Cost (CAC):');
  setElemText('grossMarginLabel', 'الهامش الإجمالي المباشر (Gross Margin %):', 'Gross Margin (%):');
  setElemText('nrrLabel', 'معدل الاحتفاظ الصافي والتوسع (NRR %):', 'Net Revenue Retention (NRR %):');

  setElemText('resArrLabel', 'الإيراد السنوي المتكرر (ARR المتوقع)', 'Projected Ending ARR');
  setElemText('resLtvCacLabel', 'مؤشر كفاءة رأس المال (LTV : CAC)', 'Capital Efficiency (LTV : CAC)');
  setElemText('resPaybackLabel', 'فترة استرداد تكلفة الاستحواذ', 'CAC Payback Period');
  setElemText('resStrategicLiftLabel', 'الأثر الاستراتيجي عبر نَمَاء', 'NAMA Strategic Lift');

  setElemText('arrChartTitle', 'منحنى نمو الإيرادات السنوية المتكررة (12-Month ARR Trajectory)', '12-Month ARR Cumulative Trajectory');
  setElemText('arrChartSub', 'مقارنة المسار العضوي الأساسي مقابل تسارع نَمَاء الاستراتيجي عبر التحالفات', 'Baseline organic curve vs. NAMA strategic BD acceleration');

  // Educational Tab & Header Action
  setElemText('tabLabelEdu', 'المختبر التعليمي والمعجم B2B', 'Educational Academy & Glossary');
  setElemText('eduBtnText', 'أكاديمية B2B', 'B2B Academy');
  setElemText('academyBadgeText', 'المختبر التعليمي والمعجم التفاعلي B2B', 'B2B Interactive Learning Lab & Glossary');
  setElemText(
    'academyTitle',
    'أكاديمية تطوير الأعمال والشراكات الاستراتيجية وذكاء الإيرادات',
    'B2B Business Development, Strategic Partnerships & Revenue Academy'
  );
  setElemText(
    'academySubtitle',
    'منهج تفاعلي متكامل يجمع بين الشرح الأكاديمي الرصين، محاكاة السيناريوهات الحية، حل معضلات التفاوض، والاختبار المهاري الختامي المقنن',
    'A rigorous, interactive curriculum combining pedagogical depth, real-world case simulations, negotiation dilemmas, and verified skills mastery'
  );

  setElemText('subtabTitleModules', 'الركائز التعليمية الخمس', '5 Core Learning Modules');
  setElemText('subtabTitleCases', 'محاكي السيناريوهات والحالات الواقعية', 'Real-World Case Simulator');
  setElemText('subtabTitleQuiz', 'الاختبار المهاري الختامي (10 أسئلة)', 'Mastery Skills Quiz (10 Questions)');
  setElemText('subtabTitleGlossary', 'معجم المعادلات والمصطلحات المشروحة', 'Formulas & Terminology Glossary');

  // Footer
  setElemText(
    'footerAuthor',
    'تصميم وتطوير: أ. طارق ابوعشي — أخصائي تطوير الأعمال والشراكات الاستراتيجية',
    'Architected & Developed by: Tareq Abuashi — Lead B2B Business Development Specialist'
  );
}

// ==========================================
// B2B Educational Academy Engine & State
// ==========================================
let activeCaseIndex = 0;
let currentQuizIndex = 0;
let quizScore = 0;
let quizAnswered = false;
let activeGlossaryCategory = 'all';
let glossarySearchQuery = '';

function setupEducationalAcademy(): void {
  // 1. Direct header button opens educational tab
  const openEduBtn = document.getElementById('openEduTabBtn');
  openEduBtn?.addEventListener('click', () => {
    playClickSound();
    const tabEdu = document.getElementById('tab-edu');
    tabEdu?.click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 2. Subtab switching inside academy
  const subtabBtns = document.querySelectorAll<HTMLButtonElement>('.academy-subtab-btn');
  const subpanels = document.querySelectorAll<HTMLElement>('.academy-subpanel');

  subtabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      playClickSound();
      const targetSubtab = btn.getAttribute('data-subtab');

      subtabBtns.forEach((b) => b.classList.remove('active'));
      subpanels.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(`subpanel-${targetSubtab}`);
      targetPanel?.classList.add('active');
    });
  });

  // 3. Render all academy components
  renderLearningModules();
  setupCaseStudiesSimulator();
  renderQuizQuestion();
  renderGlossaryCards();
  setupGlossaryFiltersAndSearch();
}

// ==========================================
// 1. Render Learning Modules (الركائز الخمس)
// ==========================================
function renderLearningModules(): void {
  const container = document.getElementById('modulesContainer');
  if (!container) return;

  container.innerHTML = LEARNING_MODULES.map((mod, idx) => {
    const isExpanded = idx === 0;
    return `
      <div class="module-card ${isExpanded ? 'expanded' : ''}" id="modCard-${mod.id}">
        <div class="module-card-header" onclick="window.toggleModuleCard('${mod.id}')">
          <div class="module-header-main">
            <span class="module-number-badge">0${mod.number}</span>
            <div class="module-icon-pill"><i class="${mod.icon}"></i></div>
            <div class="module-titles">
              <span class="module-badge-tag">${mod.badgeAr}</span>
              <h4 class="module-title">${mod.titleAr}</h4>
              <span class="module-title-en">${mod.titleEn}</span>
            </div>
          </div>
          <button class="module-expand-btn" aria-label="Toggle Module">
            <i class="fa-solid fa-chevron-down"></i>
          </button>
        </div>

        <div class="module-card-body">
          <p class="module-summary">${mod.summaryAr}</p>

          <div class="module-concepts-list">
            <h5 class="concepts-list-title"><i class="fa-solid fa-key"></i> المفاهيم والمحاور الجوهرية:</h5>
            ${mod.coreConceptsAr.map(c => `
              <div class="concept-item">
                <span class="concept-bullet"><i class="fa-solid fa-check"></i></span>
                <div>
                  <strong>${c.title}:</strong>
                  <p>${c.desc}</p>
                </div>
              </div>
            `).join('')}
          </div>

          ${mod.formulaAr ? `
            <div class="module-formula-box">
              <span class="formula-box-header"><i class="fa-solid fa-calculator"></i> ${mod.formulaAr.name}:</span>
              <div class="formula-code">${mod.formulaAr.formula}</div>
              <p class="formula-example"><strong>تطبيق عملي:</strong> ${mod.formulaAr.example}</p>
            </div>
          ` : ''}

          <div class="module-strategic-tip">
            <span class="tip-icon"><i class="fa-solid fa-lightbulb"></i></span>
            <p>${mod.strategicTipAr}</p>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Global toggle for module cards
(window as any).toggleModuleCard = (moduleId: string) => {
  playClickSound();
  const card = document.getElementById(`modCard-${moduleId}`);
  if (card) {
    card.classList.toggle('expanded');
  }
};

// ==========================================
// 2. Real-World Case Studies Simulator
// ==========================================
function setupCaseStudiesSimulator(): void {
  const selectorBar = document.getElementById('caseSelectorBar');
  if (!selectorBar) return;

  // Render Case Selector Pills
  selectorBar.innerHTML = CASE_STUDIES.map((c, idx) => `
    <button class="case-pill-btn ${idx === activeCaseIndex ? 'active' : ''}" data-case-idx="${idx}">
      <i class="${c.icon}"></i>
      <span>${c.sectorAr.split(' (')[0]}</span>
    </button>
  `).join('');

  selectorBar.querySelectorAll<HTMLButtonElement>('.case-pill-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      playClickSound();
      const idx = parseInt(btn.getAttribute('data-case-idx') || '0', 10);
      activeCaseIndex = idx;
      selectorBar.querySelectorAll('.case-pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderActiveCaseStudy();
    });
  });

  renderActiveCaseStudy();
}

function renderActiveCaseStudy(): void {
  const container = document.getElementById('caseActiveContainer');
  if (!container) return;

  const currentCase = CASE_STUDIES[activeCaseIndex];

  container.innerHTML = `
    <div class="case-study-card">
      <div class="case-header">
        <div class="case-header-left">
          <span class="case-sector-badge"><i class="${currentCase.icon}"></i> ${currentCase.sectorAr}</span>
          <h4 class="case-title">${currentCase.titleAr}</h4>
          <span class="case-client-tag">الجهة الشريكة: <strong>${currentCase.clientAr}</strong></span>
        </div>
        <div class="case-index-pill">دراسة حالة #${activeCaseIndex + 1} من 4</div>
      </div>

      <div class="case-body">
        <div class="case-scenario-box">
          <h5 class="box-title"><i class="fa-solid fa-briefcase"></i> معطيات الموقف التعاقدي:</h5>
          <p>${currentCase.scenarioAr}</p>
        </div>

        <div class="case-challenge-box">
          <h5 class="challenge-title"><i class="fa-solid fa-triangle-exclamation"></i> التحدي التفاوضي أمامك:</h5>
          <p>${currentCase.challengeAr}</p>
        </div>

        <div class="case-options-section">
          <h5 class="options-prompt"><i class="fa-solid fa-hand-pointer"></i> اختر القرار الاستراتيجي الذي ستتخذه كأخصائي تطوير أعمال:</h5>
          <div class="case-options-list">
            ${currentCase.options.map((opt, optIdx) => `
              <button class="case-option-btn" onclick="window.selectCaseOption(${activeCaseIndex}, ${optIdx})">
                <span class="opt-letter">${String.fromCharCode(65 + optIdx)}</span>
                <span class="opt-text">${opt.textAr}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="case-feedback-area" id="caseFeedbackArea" style="display: none;"></div>
      </div>
    </div>
  `;
}

// Global case option handler
(window as any).selectCaseOption = (caseIdx: number, optIdx: number) => {
  const currentCase = CASE_STUDIES[caseIdx];
  const chosenOpt = currentCase.options[optIdx];
  const feedbackArea = document.getElementById('caseFeedbackArea');
  if (!feedbackArea) return;

  const optionBtns = document.querySelectorAll<HTMLButtonElement>('.case-option-btn');
  optionBtns.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === optIdx) {
      btn.classList.add(chosenOpt.isCorrect ? 'chosen-correct' : 'chosen-incorrect');
    } else if (currentCase.options[idx].isCorrect) {
      btn.classList.add('reveal-correct');
    }
  });

  if (chosenOpt.isCorrect) {
    playContractClosedChord();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#f59e0b', '#06b6d4']
    });
  } else {
    playStageSound(1);
  }

  feedbackArea.style.display = 'block';
  feedbackArea.className = `case-feedback-area ${chosenOpt.isCorrect ? 'feedback-success' : 'feedback-warning'}`;
  feedbackArea.innerHTML = `
    <div class="feedback-header">
      <span class="feedback-icon"><i class="fa-solid ${chosenOpt.isCorrect ? 'fa-circle-check' : 'fa-circle-xmark'}"></i></span>
      <h5 class="feedback-title">${chosenOpt.isCorrect ? 'قرار استراتيجي ممتاز وصحيح 100%' : 'قرار يحتاج إلى إعادة تقييم وتصحيح'}</h5>
    </div>
    <p class="feedback-explanation">${chosenOpt.explanationAr}</p>
    <div class="feedback-impact-box">
      <strong><i class="fa-solid fa-chart-line"></i> الأثر الاستراتيجي والمالي لهذا القرار:</strong>
      <p>${chosenOpt.impactAr}</p>
    </div>
  `;
};

// ==========================================
// 3. B2B Mastery Quiz (10 أسئلة مهارية)
// ==========================================
function renderQuizQuestion(): void {
  const container = document.getElementById('quizContainerCard');
  if (!container) return;

  if (currentQuizIndex >= B2B_QUIZ_QUESTIONS.length) {
    renderQuizFinalResult(container);
    return;
  }

  const q = B2B_QUIZ_QUESTIONS[currentQuizIndex];
  quizAnswered = false;

  container.innerHTML = `
    <div class="quiz-active-block">
      <!-- Quiz Progress Header -->
      <div class="quiz-top-bar">
        <div class="quiz-step-tag">
          <i class="fa-solid fa-list-ol"></i>
          <span>السؤال <strong>${currentQuizIndex + 1}</strong> من <strong>10</strong></span>
        </div>
        <div class="quiz-domain-tag">
          <i class="fa-solid fa-tag"></i>
          <span>${q.domainAr}</span>
        </div>
      </div>

      <!-- Quiz Progress Bar -->
      <div class="quiz-progress-track">
        <div class="quiz-progress-fill" style="width: ${((currentQuizIndex) / 10) * 100}%;"></div>
      </div>

      <!-- Question Text -->
      <div class="quiz-question-box">
        <h4 class="quiz-question-text">${q.questionAr}</h4>
      </div>

      <!-- Options -->
      <div class="quiz-answers-list" id="quizAnswersList">
        ${q.options ? q.options.map((opt, optIdx) => `
          <button class="quiz-answer-btn" onclick="window.handleQuizAnswer(${optIdx})">
            <span class="ans-letter">${q.type === 'tf' ? (opt === 'صح' ? '✓' : '✗') : String.fromCharCode(65 + optIdx)}</span>
            <span class="ans-text">${opt}</span>
          </button>
        `).join('') : ''}
      </div>

      <!-- Realtime Feedback -->
      <div class="quiz-feedback-box" id="quizFeedbackBox" style="display: none;"></div>

      <!-- Next Button -->
      <div class="quiz-action-footer" id="quizActionFooter" style="display: none;">
        <button class="quiz-next-btn" onclick="window.advanceQuizQuestion()">
          <span>${currentQuizIndex === 9 ? 'عرض النتيجة النهائية والتقييم المهاري' : 'السؤال التالي'}</span>
          <i class="fa-solid fa-arrow-left"></i>
        </button>
      </div>
    </div>
  `;
}

// Global quiz answer handler
(window as any).handleQuizAnswer = (selectedIdx: number) => {
  if (quizAnswered) return;
  quizAnswered = true;

  const q = B2B_QUIZ_QUESTIONS[currentQuizIndex];
  const buttons = document.querySelectorAll<HTMLButtonElement>('.quiz-answer-btn');
  const feedbackBox = document.getElementById('quizFeedbackBox');
  const actionFooter = document.getElementById('quizActionFooter');

  let isCorrect = false;
  if (q.type === 'mcq') {
    isCorrect = selectedIdx === q.correctAnswer;
  } else if (q.type === 'tf') {
    const selectedText = q.options ? q.options[selectedIdx] : '';
    isCorrect = selectedText === q.correctAnswer;
  }

  if (isCorrect) {
    quizScore++;
    playContractClosedChord();
  } else {
    playStageSound(0);
  }

  buttons.forEach((btn, idx) => {
    btn.disabled = true;
    let btnIsCorrect = false;
    if (q.type === 'mcq') {
      btnIsCorrect = idx === q.correctAnswer;
    } else if (q.type === 'tf') {
      btnIsCorrect = q.options ? q.options[idx] === q.correctAnswer : false;
    }

    if (btnIsCorrect) {
      btn.classList.add('correct-answer');
    }
    if (idx === selectedIdx && !isCorrect) {
      btn.classList.add('wrong-answer');
    }
  });

  if (feedbackBox) {
    feedbackBox.style.display = 'block';
    feedbackBox.className = `quiz-feedback-box ${isCorrect ? 'fb-correct' : 'fb-incorrect'}`;
    feedbackBox.innerHTML = `
      <div class="fb-header">
        <i class="fa-solid ${isCorrect ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
        <strong>${isCorrect ? 'إجابة صحيحة ومتقنة!' : 'إجابة غير صحيحة — التوضيح التعليمي:'}</strong>
      </div>
      <p class="fb-explanation">${q.explanationAr}</p>
    `;
  }

  if (actionFooter) {
    actionFooter.style.display = 'flex';
  }
};

(window as any).advanceQuizQuestion = () => {
  playClickSound();
  currentQuizIndex++;
  renderQuizQuestion();
};

function renderQuizFinalResult(container: HTMLElement): void {
  playContractClosedChord();
  if (quizScore >= 8) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#06b6d4', '#ffffff']
    });
  }

  let feedbackText = '';
  let feedbackBadge = '';
  let badgeClass = '';

  if (quizScore >= 8) {
    badgeClass = 'mastery-high';
    feedbackBadge = 'إتقان مهاري متقدم في تطوير الأعمال';
    feedbackText = 'أحسنت، أنت الآن قادر على قيادة وتأهيل صفقات الـ B2B الكبرى، صياغة العروض الرابحة وحساب اقتصاديات النمو بكفاءة واحترافية.';
  } else if (quizScore >= 5) {
    badgeClass = 'mastery-mid';
    feedbackBadge = 'مستوى جيد وقريب من الإتقان الكامل';
    feedbackText = 'مستوى جيد وقريب من الإتقان الكامل؛ راجع الركائز التعليمية ومحاكي الحالات لتعزيز مهارات التفاوض وتأهيل MEDDIC.';
  } else {
    badgeClass = 'mastery-low';
    feedbackBadge = 'في طور البناء وتطوير المهارة';
    feedbackText = 'أنت في طور التقدم وبناء المهارة؛ راجع بطاقات الشرح ومعجم المصطلحات ثم جرب السيناريوهات العملية مجدداً.';
  }

  // Strict Rule 8: No restart button! Clean, mature feedback with LTR score formatting.
  container.innerHTML = `
    <div class="quiz-result-card ${badgeClass}">
      <div class="result-celebration-icon">
        <i class="fa-solid ${quizScore >= 8 ? 'fa-trophy' : quizScore >= 5 ? 'fa-award' : 'fa-book-open-reader'}"></i>
      </div>
      <span class="result-badge">${feedbackBadge}</span>
      <h3 class="result-title">نتيجة التقييم النهائي لمهارات تطوير الأعمال B2B</h3>

      <div class="score-display-wrap">
        <span class="score-text-label">الدرجة المكتسبة:</span>
        <span class="score-number-badge" style="direction: ltr; display: inline-block;">${quizScore} / 10</span>
      </div>

      <p class="result-pedagogical-feedback">${feedbackText}</p>

      <div class="result-author-footer">
        <i class="fa-solid fa-crown"></i>
        <span>معتمد ضمن منظومة نَمَاء — إعداد وتطوير: <strong>أ. طارق ابوعشي</strong></span>
      </div>
    </div>
  `;
}

// ==========================================
// 4. Glossary & Formulas Engine
// ==========================================
function renderGlossaryCards(): void {
  const container = document.getElementById('glossaryCardsGrid');
  if (!container) return;

  const filtered = GLOSSARY_TERMS.filter((term) => {
    const matchCategory = activeGlossaryCategory === 'all' || term.category === activeGlossaryCategory;
    const matchSearch =
      glossarySearchQuery === '' ||
      term.code.toLowerCase().includes(glossarySearchQuery.toLowerCase()) ||
      term.nameAr.toLowerCase().includes(glossarySearchQuery.toLowerCase()) ||
      term.nameEn.toLowerCase().includes(glossarySearchQuery.toLowerCase()) ||
      term.definitionAr.toLowerCase().includes(glossarySearchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="glossary-empty-state">
        <i class="fa-solid fa-search"></i>
        <p>لا توجد مصطلحات مطابقة لبحثك الحالي.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((term) => `
    <div class="glossary-term-card">
      <div class="term-header">
        <span class="term-code-pill">${term.code}</span>
        <span class="term-cat-tag ${term.category}">${getCategoryLabel(term.category)}</span>
      </div>
      <h4 class="term-name-ar">${term.nameAr}</h4>
      <span class="term-name-en">${term.nameEn}</span>
      <p class="term-definition">${term.definitionAr}</p>

      ${term.formula ? `
        <div class="term-formula-strip">
          <span class="formula-label"><i class="fa-solid fa-function"></i> الصيغة الرياضية:</span>
          <code class="formula-math">${term.formula}</code>
        </div>
      ` : ''}

      <div class="term-example-box">
        <strong>مثال تطبيقي:</strong> ${term.exampleAr}
      </div>
    </div>
  `).join('');
}

function getCategoryLabel(cat: string): string {
  switch (cat) {
    case 'financial': return 'مالية واقتصادية';
    case 'methodology': return 'منهجية MEDDIC';
    case 'pipeline': return 'مسار الصفقات';
    case 'strategy': return 'استراتيجية وتفاوض';
    default: return 'عام';
  }
}

function setupGlossaryFiltersAndSearch(): void {
  const filterPills = document.querySelectorAll<HTMLButtonElement>('#glossaryFilterPills .filter-pill');
  filterPills.forEach((btn) => {
    btn.addEventListener('click', () => {
      playClickSound();
      filterPills.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeGlossaryCategory = btn.getAttribute('data-category') || 'all';
      renderGlossaryCards();
    });
  });

  const searchInput = document.getElementById('glossarySearchInput') as HTMLInputElement | null;
  searchInput?.addEventListener('input', (e) => {
    glossarySearchQuery = (e.target as HTMLInputElement).value.trim();
    renderGlossaryCards();
  });
}

// ==========================================
// 5. Educational Quick Tooltips Modal
// ==========================================
function setupEducationalTooltips(): void {
  const modal = document.getElementById('eduTooltipModal');
  const backdrop = document.getElementById('eduTooltipBackdrop');
  const closeBtn = document.getElementById('eduTooltipCloseBtn');
  const titleEl = document.getElementById('eduTooltipTitle');
  const descEl = document.getElementById('eduTooltipDesc');
  const tipEl = document.getElementById('eduTooltipTip');

  const closeTooltip = () => {
    playClickSound();
    modal?.classList.remove('show');
    modal?.setAttribute('aria-hidden', 'true');
  };

  closeBtn?.addEventListener('click', closeTooltip);
  backdrop?.addEventListener('click', closeTooltip);

  const triggers = document.querySelectorAll<HTMLButtonElement>('.edu-info-btn');
  triggers.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      playClickSound();
      const key = btn.getAttribute('data-info');
      if (!key) return;

      const item = EDUCATIONAL_TOOLTIPS[key];
      if (item) {
        if (titleEl) titleEl.textContent = item.titleAr;
        if (descEl) descEl.textContent = item.descAr;
        if (tipEl) tipEl.textContent = item.tipAr;

        modal?.classList.add('show');
        modal?.setAttribute('aria-hidden', 'false');
      }
    });
  });
}

