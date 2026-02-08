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
  depAssets: [] // {dailyDep, daysLeft}
};

const el = (id) => document.getElementById(id);
const fmt = (n) => `¥${Math.round(n).toLocaleString("zh-CN")}`;
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
  el("kpiEbit").className = `num ${forecast.ebit >= 0 ? "ok" : "bad"}`;

  const totalWealth = state.referenceEnterpriseValue + state.cash;
  el("enterpriseValue").textContent = fmt(state.referenceEnterpriseValue);
  el("cashAsset").textContent = fmt(state.cash);
  el("totalWealth").textContent = fmt(totalWealth);
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
    el("goalStatus").textContent = passed ? "已达成" : "未达成";
    el("goalStatus").style.color = passed ? "#15803d" : "#b91c1c";
    log(passed ? "第 20 天目标达成：单日 EBITDA > ¥1,000。" : "第 20 天目标未达成：请优化需求与产能配置。");
  }

  state.day += 1;
  state.demandBonus = 0;
  state.marketingCost = 0;
  render();
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
  el("goalStatus").textContent = "进行中";
  el("goalStatus").style.color = "#6b7280";
  el("log").innerHTML = "";
  log("已重置。点击“进入下一天”会自动按 min(日需求, 日产能) 结算销量。");
  render();
}

el("marketingBtn").addEventListener("click", () => {
  state.demandBonus += 40;
  state.marketingCost += 200;
  log("做营销：需求 +40，营销费 +¥200。");
  render();
});
el("staffBtn").addEventListener("click", () => {
  state.staff += 1;
  log("新增一名店员：产能 +30 杯/日，每日工资 +¥60。");
  render();
});
el("machineBtn").addEventListener("click", buyMachine);
el("nextDayBtn").addEventListener("click", nextDay);
el("resetBtn").addEventListener("click", reset);

log("开始营业。点击“进入下一天”自动结算，观察 EBITDA 与 EBIT 差异。");
render();
