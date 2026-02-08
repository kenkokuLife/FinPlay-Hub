const state = {
  day: 1,
  cash: 8000,
  pricePerCup: 18,
  materialPerCup: 6,
  rentPerDay: 200,
  wagePerStaff: 60,
  baseDemand: 40,
  demandBonus: 0,
  baseCapacity: 60,
  staff: 0,
  machines: 1,
  machineDailyCapacity: 120,
  marketingCost: 0,
  cupSold: 0,
  latestEbitda: 0,
  valuationMultiple: 10,
  referenceEnterpriseValue: 0,
  yesterdayActual: null,
  depreciationPerDay: 0,
  depAssets: []
};

// Chart history
const chartData = { ebitda: [], ebit: [], labels: [] };

const el = (id) => document.getElementById(id);
const fmt = (n) => `¥${Math.round(n).toLocaleString("zh-CN")}`;

// Notify parent (if embedded in iframe) about game actions
function notify(action) {
  if (window.parent !== window) {
    window.parent.postMessage({ source: "milk-tea-pro", action }, "*");
  }
}

function getTodayDemand() {
  return state.baseDemand + state.demandBonus;
}

function getTodayCapacity() {
  const byStaff = state.baseCapacity + state.staff * 30;
  const byMachine = state.machines * state.machineDailyCapacity;
  return Math.min(byStaff, byMachine);
}

function log(msg) {
  const node = document.createElement("div");
  node.textContent = `• ${msg}`;
  el("log").prepend(node);
}

function computeFrom(cupsSold, dep) {
  const revenue = cupsSold * state.pricePerCup;
  const cogs = cupsSold * state.materialPerCup;
  const wage = state.staff * state.wagePerStaff;
  const rent = state.rentPerDay;
  const mkt = state.marketingCost;
  const ebitda = revenue - cogs - wage - rent - mkt;
  const ebit = ebitda - dep;
  return { revenue, cogs, wage, rent, mkt, ebitda, dep, ebit };
}

function getTodayDepreciation() {
  let dep = 0;
  for (const asset of state.depAssets) {
    if (asset.daysLeft > 0) dep += asset.dailyDep;
  }
  return dep;
}

function renderDiff(elId, today, yesterday) {
  const elNode = el(elId);
  if (yesterday == null) {
    elNode.textContent = "-";
    elNode.className = "diff";
    return;
  }
  if (today > yesterday) {
    elNode.textContent = "↑";
    elNode.className = "diff up";
  } else if (today < yesterday) {
    elNode.textContent = "↓";
    elNode.className = "diff down";
  } else {
    elNode.textContent = "→";
    elNode.className = "diff";
  }
}

// ── Chart Drawing ──
let chartAnimId = null;

function drawChartFrame(progress) {
  const canvas = el("chartCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  const W = rect.width;
  const H = rect.height;
  ctx.clearRect(0, 0, W, H);

  const ebitdaArr = chartData.ebitda;
  const ebitArr = chartData.ebit;
  if (ebitdaArr.length === 0) {
    ctx.fillStyle = "rgba(148,163,184,0.3)";
    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("点击「进入下一天」开始记录走势", W / 2, H / 2);
    return;
  }

  const all = [...ebitdaArr, ...ebitArr];
  let maxVal = Math.max(...all, 100);
  let minVal = Math.min(...all, 0);
  const range = maxVal - minVal || 1;
  const padT = 12, padB = 24, padL = 6, padR = 6;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const toX = (i) => padL + (ebitdaArr.length === 1 ? chartW / 2 : (i / (ebitdaArr.length - 1)) * chartW);
  const toY = (v) => padT + chartH - ((v - minVal) / range) * chartH;

  // Zero line
  if (minVal < 0 && maxVal > 0) {
    const zeroY = toY(0);
    ctx.beginPath();
    ctx.strokeStyle = "rgba(148,163,184,0.15)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(padL, zeroY);
    ctx.lineTo(W - padR, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Draw a line with gradient fill, with animated last segment
  function drawLine(data, color, fillColor) {
    if (data.length < 1) return;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    for (let i = 0; i < data.length; i++) {
      let x = toX(i), y = toY(data[i]);
      // Animate the last point
      if (i === data.length - 1 && data.length > 1 && progress < 1) {
        const prevX = toX(i - 1), prevY = toY(data[i - 1]);
        x = prevX + (x - prevX) * progress;
        y = prevY + (y - prevY) * progress;
      }
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Fill area
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      let x = toX(i), y = toY(data[i]);
      if (i === data.length - 1 && data.length > 1 && progress < 1) {
        const prevX = toX(i - 1), prevY = toY(data[i - 1]);
        x = prevX + (x - prevX) * progress;
        y = prevY + (y - prevY) * progress;
      }
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    const lastX = data.length > 1 && progress < 1
      ? toX(data.length - 2) + (toX(data.length - 1) - toX(data.length - 2)) * progress
      : toX(data.length - 1);
    ctx.lineTo(lastX, padT + chartH);
    ctx.lineTo(toX(0), padT + chartH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
    grad.addColorStop(0, fillColor);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fill();

    // Dots
    for (let i = 0; i < data.length; i++) {
      let x = toX(i), y = toY(data[i]);
      if (i === data.length - 1 && data.length > 1 && progress < 1) {
        const prevX = toX(i - 1), prevY = toY(data[i - 1]);
        x = prevX + (x - prevX) * progress;
        y = prevY + (y - prevY) * progress;
      }
      const dotSize = (i === data.length - 1 && progress < 1) ? 3 * progress : 3;
      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  drawLine(ebitArr, "#818cf8", "rgba(129,140,248,0.08)");
  drawLine(ebitdaArr, "#34d399", "rgba(52,211,153,0.1)");

  // X labels
  ctx.fillStyle = "rgba(148,163,184,0.5)";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  for (let i = 0; i < chartData.labels.length; i++) {
    const alpha = (i === chartData.labels.length - 1 && progress < 1) ? progress : 1;
    ctx.globalAlpha = alpha;
    ctx.fillText(chartData.labels[i], toX(i), H - 4);
  }
  ctx.globalAlpha = 1;

  // Latest value labels
  if (ebitdaArr.length > 0 && progress >= 1) {
    const lastIdx = ebitdaArr.length - 1;
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "right";
    ctx.fillStyle = "#34d399";
    ctx.fillText(fmt(ebitdaArr[lastIdx]), toX(lastIdx) - 6, toY(ebitdaArr[lastIdx]) - 6);
    ctx.fillStyle = "#818cf8";
    ctx.fillText(fmt(ebitArr[lastIdx]), toX(lastIdx) - 6, toY(ebitArr[lastIdx]) + 16);
  }
}

function drawChart(animate) {
  if (chartAnimId) { cancelAnimationFrame(chartAnimId); chartAnimId = null; }
  if (!animate || chartData.ebitda.length <= 1) {
    drawChartFrame(1);
    return;
  }
  const duration = 400;
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
    drawChartFrame(ease);
    if (t < 1) { chartAnimId = requestAnimationFrame(tick); }
    else { chartAnimId = null; }
  }
  chartAnimId = requestAnimationFrame(tick);
}

function render() {
  const forecastCups = Math.min(getTodayDemand(), getTodayCapacity());
  const forecast = computeFrom(forecastCups, getTodayDepreciation());
  const y = state.yesterdayActual;
  el("cash").textContent = fmt(state.cash);
  el("pricePerCup").textContent = fmt(state.pricePerCup);
  el("demand").textContent = getTodayDemand();
  el("capacity").textContent = getTodayCapacity();
  el("cups").textContent = forecastCups;
  el("staff").textContent = state.staff;
  el("machines").textContent = state.machines;
  el("dayBadge").textContent = `Day ${state.day}`;

  el("revY").textContent = y ? fmt(y.revenue) : "-";
  el("cogsY").textContent = y ? fmt(y.cogs) : "-";
  el("wageY").textContent = y ? fmt(y.wage) : "-";
  el("rentY").textContent = y ? fmt(y.rent) : "-";
  el("mktY").textContent = y ? fmt(y.mkt) : "-";
  el("ebitdaY").innerHTML = y ? `<b>${fmt(y.ebitda)}</b>` : "<b>-</b>";
  el("depY").textContent = y ? fmt(y.dep) : "-";
  el("ebitY").innerHTML = y ? `<b>${fmt(y.ebit)}</b>` : "<b>-</b>";

  el("revT").textContent = fmt(forecast.revenue);
  el("cogsT").textContent = fmt(forecast.cogs);
  el("wageT").textContent = fmt(forecast.wage);
  el("rentT").textContent = fmt(forecast.rent);
  el("mktT").textContent = fmt(forecast.mkt);
  el("ebitdaT").innerHTML = `<b>${fmt(forecast.ebitda)}</b>`;
  el("depT").textContent = fmt(forecast.dep);
  el("ebitT").innerHTML = `<b>${fmt(forecast.ebit)}</b>`;

  // Color-code "今日预计" cells: green if better, red if worse than yesterday
  // For revenue/ebitda/ebit: higher is better. For costs (cogs/wage/rent/mkt/dep): lower is better.
  function colorCell(elId, today, yesterday, higherIsBetter) {
    const node = el(elId);
    if (yesterday == null) { node.style.color = ""; return; }
    if (higherIsBetter ? today > yesterday : today < yesterday) {
      node.style.color = "var(--ok)";
    } else if (higherIsBetter ? today < yesterday : today > yesterday) {
      node.style.color = "var(--bad)";
    } else {
      node.style.color = "";
    }
  }
  colorCell("revT", forecast.revenue, y ? y.revenue : null, true);
  colorCell("cogsT", forecast.cogs, y ? y.cogs : null, false);
  colorCell("wageT", forecast.wage, y ? y.wage : null, false);
  colorCell("rentT", forecast.rent, y ? y.rent : null, false);
  colorCell("mktT", forecast.mkt, y ? y.mkt : null, false);
  colorCell("ebitdaT", forecast.ebitda, y ? y.ebitda : null, true);
  colorCell("depT", forecast.dep, y ? y.dep : null, false);
  colorCell("ebitT", forecast.ebit, y ? y.ebit : null, true);

  renderDiff("revD", forecast.revenue, y ? y.revenue : null);
  renderDiff("cogsD", forecast.cogs, y ? y.cogs : null);
  renderDiff("wageD", forecast.wage, y ? y.wage : null);
  renderDiff("rentD", forecast.rent, y ? y.rent : null);
  renderDiff("mktD", forecast.mkt, y ? y.mkt : null);
  renderDiff("ebitdaD", forecast.ebitda, y ? y.ebitda : null);
  renderDiff("depD", forecast.dep, y ? y.dep : null);
  renderDiff("ebitD", forecast.ebit, y ? y.ebit : null);

  el("kpiEbitda").textContent = fmt(forecast.ebitda);
  el("kpiEbit").textContent = fmt(forecast.ebit);
  el("kpiEbit").className = `kpi-num ${forecast.ebit >= 0 ? "ok" : "bad"}`;

  const totalWealth = state.referenceEnterpriseValue + state.cash;
  el("enterpriseValue").textContent = fmt(state.referenceEnterpriseValue);
  el("cashAsset").textContent = fmt(state.cash);
  el("totalWealth").textContent = fmt(totalWealth);

  drawChart(false);
}

function buyMachine() {
  const cost = 5000;
  const usefulDays = 20;
  if (state.cash < cost) {
    log("现金不足，无法购买机器。");
    return;
  }
  state.cash -= cost;
  state.machines += 1;
  state.depAssets.push({ dailyDep: cost / usefulDays, daysLeft: usefulDays });
  log(`购买机器 -${fmt(cost)}；后续每日折旧 +${fmt(cost / usefulDays)}。`);
  notify("machine");
  render();
}

function settleDepreciationForDay() {
  let dep = 0;
  for (const asset of state.depAssets) {
    if (asset.daysLeft > 0) {
      dep += asset.dailyDep;
      asset.daysLeft -= 1;
    }
  }
  state.depreciationPerDay = dep;
  state.depAssets = state.depAssets.filter((a) => a.daysLeft > 0);
}

function nextDay() {
  const demand = getTodayDemand();
  const capacity = getTodayCapacity();
  state.cupSold = Math.min(demand, capacity);

  if (demand > capacity) {
    log("需求旺盛！但产能不足，损失了潜在收入，请考虑升级设备或招人。");
  } else if (capacity > demand) {
    log("产能过剩！请加大营销力度，否则闲置人工和折旧会拖垮利润。");
  }

  settleDepreciationForDay();
  const p = computeFrom(state.cupSold, state.depreciationPerDay);
  const cashFlow = p.revenue - p.cogs - p.wage - p.rent - p.mkt;
  const prevEnterpriseValue = state.referenceEnterpriseValue;
  state.latestEbitda = p.ebitda;
  const newEnterpriseValue = Math.max(0, state.latestEbitda) * state.valuationMultiple;
  state.referenceEnterpriseValue = newEnterpriseValue;
  state.yesterdayActual = p;
  state.cash += cashFlow;

  // Push to chart
  chartData.ebitda.push(p.ebitda);
  chartData.ebit.push(p.ebit);
  chartData.labels.push(`D${state.day}`);

  log(`Day ${state.day} 自动售卖 ${state.cupSold} 杯（需求 ${demand} / 产能 ${capacity}）。`);
  log(`Day ${state.day} 结算：EBITDA ${fmt(p.ebitda)}，折旧 ${fmt(p.dep)}，EBIT ${fmt(p.ebit)}。`);
  log(`现金变动（不含折旧）: ${fmt(cashFlow)}。`);
  if (newEnterpriseValue > prevEnterpriseValue) {
    log(`因为你的 EBITDA 增长了，公司在并购市场上多值了 ${fmt(newEnterpriseValue - prevEnterpriseValue)}！`);
  } else if (newEnterpriseValue < prevEnterpriseValue) {
    log(`因为你的 EBITDA 下滑了，公司在并购市场上少值了 ${fmt(prevEnterpriseValue - newEnterpriseValue)}！`);
  }
  if (state.day === 20) {
    const passed = p.ebitda > 1000;
    const gs = el("goalStatus");
    gs.textContent = passed ? "已达成" : "未达成";
    gs.style.background = passed ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)";
    gs.style.color = passed ? "#34d399" : "#f87171";
    log(passed ? "第 20 天目标达成：单日 EBITDA > ¥1,000。" : "第 20 天目标未达成：请优化需求与产能配置。");
    notify(passed ? "goal_pass" : "goal_fail");
  }

  notify("settle");
  state.day += 1;
  state.demandBonus = 0;
  state.marketingCost = 0;
  render();
  drawChart(true); // animate the new data point
}

function reset() {
  Object.assign(state, {
    day: 1,
    cash: 8000,
    pricePerCup: 18,
    materialPerCup: 6,
    rentPerDay: 200,
    wagePerStaff: 60,
    baseDemand: 40,
    demandBonus: 0,
    baseCapacity: 60,
    staff: 0,
    machines: 1,
    machineDailyCapacity: 120,
    marketingCost: 0,
    cupSold: 0,
    latestEbitda: 0,
    valuationMultiple: 10,
    referenceEnterpriseValue: 0,
    yesterdayActual: null,
    depreciationPerDay: 0,
    depAssets: []
  });
  chartData.ebitda.length = 0;
  chartData.ebit.length = 0;
  chartData.labels.length = 0;
  const gs = el("goalStatus");
  gs.textContent = "进行中";
  gs.style.background = "rgba(148,163,184,0.1)";
  gs.style.color = "#94a3b8";
  el("log").innerHTML = "";
  log('已重置。点击"进入下一天"会自动按 min(日需求, 日产能) 结算销量。');
  render();
}

el("marketingBtn").addEventListener("click", () => {
  state.demandBonus += 40;
  state.marketingCost += 200;
  log("做营销：需求 +40，营销费 +¥200。");
  notify("marketing");
  render();
});
el("staffBtn").addEventListener("click", () => {
  state.staff += 1;
  log("新增一名店员：产能 +30 杯/日，每日工资 +¥60。");
  notify("hire");
  render();
});
el("machineBtn").addEventListener("click", buyMachine);
el("nextDayBtn").addEventListener("click", nextDay);
el("resetBtn").addEventListener("click", reset);

// Handle resize for chart
window.addEventListener("resize", () => drawChart(false));

log('开始营业。点击"进入下一天"自动结算，观察 EBITDA 与 EBIT 差异。');
render();
