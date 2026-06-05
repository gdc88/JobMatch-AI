const profile = {
  name: "Boris Winebrand",
  title: "IT Infrastructure / Cloud / Automation Specialist",
  years: "14+",
  contacts: ["boriswinebrand@gmail.com", "boris.winebrand.career@gmail.com", "+972 50 482 0861"],
  skills: [
    "Linux", "Windows", "Active Directory", "DNS", "DHCP", "TCP/IP", "VMware",
    "Bash", "PowerShell", "Python", "Git", "Docker", "CI/CD", "GitHub Actions", "GitLab Actions",
    "AWS", "Azure", "GCP", "Monitoring", "Backup", "Security", "Prompt Engineering", "AI agents", "RAG"
  ]
};

const samples = [
  {
    title: "Cloud Support Engineer — Berlin",
    text: `Cloud Support Engineer — Berlin / Hybrid

We are looking for an IT specialist with experience in Linux and Windows environments, cloud platforms such as AWS or Azure, troubleshooting of DNS, DHCP and TCP/IP, scripting with Bash or PowerShell, and basic automation. Experience with Git, Docker, monitoring and incident management is a plus. English is required; German is an advantage.`
  },
  {
    title: "Linux System Administrator — Hamburg",
    text: `Linux System Administrator — Hamburg

Responsibilities: maintain Linux servers, Windows workstations, VMware virtualization, Active Directory, backups, monitoring, network services, DNS/DHCP and security updates. Required: strong troubleshooting skills, scripting with Bash or Python, documentation and user support. Nice to have: cloud migration experience and CI/CD understanding.`
  },
  {
    title: "Junior DevOps Engineer — Remote Germany",
    text: `Junior DevOps Engineer — Remote Germany

The team needs a junior-mid engineer to support CI/CD pipelines, Docker containers, GitHub Actions, GitLab, Linux administration and cloud infrastructure in AWS/GCP. Terraform, Kubernetes, Ansible and German B2 are a plus. You will automate routine tasks, improve monitoring and collaborate with developers.`
  }
];

const skillGroups = [
  { name: "Инфраструктура", weight: 18, tokens: ["linux", "windows", "active directory", "dns", "dhcp", "tcp/ip", "network", "server", "vmware", "virtualization", "troubleshooting"] },
  { name: "Cloud", weight: 14, tokens: ["aws", "azure", "gcp", "cloud", "migration", "hybrid"] },
  { name: "DevOps", weight: 14, tokens: ["docker", "ci/cd", "github actions", "gitlab", "containers", "pipeline", "pipelines", "git"] },
  { name: "Автоматизация", weight: 13, tokens: ["bash", "powershell", "python", "scripting", "automation", "automate"] },
  { name: "Надёжность и безопасность", weight: 11, tokens: ["monitoring", "backup", "backups", "security", "incident", "updates", "documentation"] },
  { name: "AI и современные инструменты", weight: 6, tokens: ["ai", "llm", "rag", "prompt", "agent", "automation"] },
  { name: "Коммуникация", weight: 5, tokens: ["english", "support", "collaborate", "documentation", "user support"] }
];

const knownProfileTokens = new Map([
  ["linux", "Linux"], ["windows", "Windows"], ["active directory", "Active Directory"], ["dns", "DNS"],
  ["dhcp", "DHCP"], ["tcp/ip", "TCP/IP"], ["vmware", "VMware"], ["virtualization", "Virtualization"],
  ["bash", "Bash"], ["powershell", "PowerShell"], ["python", "Python"], ["git", "Git"],
  ["docker", "Docker"], ["ci/cd", "CI/CD"], ["github actions", "GitHub Actions"], ["gitlab", "GitLab"],
  ["aws", "AWS"], ["azure", "Azure"], ["gcp", "GCP"], ["cloud", "Cloud"], ["monitoring", "Monitoring"],
  ["backup", "Backup"], ["backups", "Backups"], ["security", "Security"], ["scripting", "Scripting"],
  ["automation", "Automation"], ["troubleshooting", "Troubleshooting"], ["support", "Support"],
  ["documentation", "Documentation"]
]);

const gapTokens = new Map([
  ["kubernetes", "Kubernetes"], ["terraform", "Terraform"], ["ansible", "Ansible"],
  ["german b2", "German B2"], ["german c1", "German C1"], ["deutsch", "Deutsch"],
  ["go ", "Go"], ["java", "Java"], ["sre", "SRE practices"]
]);

const els = {
  themeToggle: document.querySelector("#themeToggle"),
  sampleSelect: document.querySelector("#sampleSelect"),
  jobText: document.querySelector("#jobText"),
  analyzeBtn: document.querySelector("#analyzeBtn"),
  clearBtn: document.querySelector("#clearBtn"),
  resultTitle: document.querySelector("#resultTitle"),
  matchScore: document.querySelector("#matchScore"),
  meterFill: document.querySelector("#meterFill"),
  strengthsList: document.querySelector("#strengthsList"),
  gapsList: document.querySelector("#gapsList"),
  recommendationsList: document.querySelector("#recommendationsList"),
  pitchText: document.querySelector("#pitchText"),
  copyPitchBtn: document.querySelector("#copyPitchBtn"),
  downloadReportBtn: document.querySelector("#downloadReportBtn"),
  copyResumeBtn: document.querySelector("#copyResumeBtn"),
  toast: document.querySelector("#toast"),
  year: document.querySelector("#year")
};

let lastReport = null;

function normalize(text) {
  return ` ${String(text || "").toLowerCase().replace(/[\n\t]+/g, " ").replace(/[^a-zа-яё0-9+#/. -]/gi, " ").replace(/\s+/g, " ")} `;
}

function includesToken(text, token) {
  const escaped = token.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-zа-яё0-9+#])${escaped}([^a-zа-яё0-9+#]|$)`, "i").test(text);
}

function unique(items) {
  return [...new Set(items)].filter(Boolean);
}

function detectRole(text) {
  const firstLine = String(text || "").split("\n").find(line => line.trim().length > 5) || "the open IT role";
  return firstLine.replace(/responsibilities:|required:/gi, "").trim().slice(0, 90);
}

function analyzeVacancy(rawText) {
  const text = normalize(rawText);
  const matchedSkills = [];
  const matchedGroups = [];
  let score = 40;

  for (const [token, label] of knownProfileTokens.entries()) {
    if (includesToken(text, token)) matchedSkills.push(label);
  }

  for (const group of skillGroups) {
    const hits = group.tokens.filter(token => includesToken(text, token));
    if (hits.length) {
      const coverage = Math.min(1, hits.length / Math.min(4, group.tokens.length));
      score += Math.round(group.weight * coverage);
      matchedGroups.push({ name: group.name, hits: hits.length });
    }
  }

  const gaps = [];
  for (const [token, label] of gapTokens.entries()) {
    if (includesToken(text, token)) gaps.push(label);
  }

  const uniqueSkills = unique(matchedSkills).slice(0, 14);
  const uniqueGaps = unique(gaps).slice(0, 8);
  score -= uniqueGaps.length * 4;

  if (uniqueSkills.length >= 10) score += 5;
  if (includesToken(text, "junior") || includesToken(text, "support")) score += 4;
  if (includesToken(text, "senior") && uniqueGaps.length > 2) score -= 8;

  score = Math.max(18, Math.min(96, score));

  const recommendations = buildRecommendations(uniqueSkills, uniqueGaps, score, text);
  const role = detectRole(rawText);
  const pitch = buildPitch(role, uniqueSkills, uniqueGaps, score);

  return {
    date: new Date().toISOString(),
    role,
    score,
    matchedSkills: uniqueSkills,
    gaps: uniqueGaps,
    matchedGroups,
    recommendations,
    pitch
  };
}

function buildRecommendations(skills, gaps, score, text) {
  const recommendations = [];
  if (score >= 78) {
    recommendations.push("Вакансия выглядит сильным совпадением: можно откликаться и в первых строках резюме подчеркнуть инфраструктуру, cloud и автоматизацию.");
  } else if (score >= 58) {
    recommendations.push("Вакансия частично подходит: стоит адаптировать резюме под найденные ключевые навыки и честно закрыть пробелы планом развития.");
  } else {
    recommendations.push("Вакансия пока рискованная: лучше использовать её как ориентир для развития или откликаться только при сильной мотивации.");
  }

  if (skills.length) {
    recommendations.push(`В резюме вынести выше навыки: ${skills.slice(0, 6).join(", ")}.`);
  }

  if (gaps.includes("Kubernetes") || gaps.includes("Terraform") || gaps.includes("Ansible")) {
    recommendations.push("Для DevOps‑ролей добавить мини‑проект: Docker + CI/CD + Terraform/Ansible/Kubernetes в GitHub‑репозитории.");
  }

  if (gaps.some(gap => gap.toLowerCase().includes("german") || gap === "Deutsch")) {
    recommendations.push("Если требуется немецкий язык, указать текущий уровень и подготовить короткий German/English summary для рекрутера.");
  }

  if (includesToken(text, "cloud")) {
    recommendations.push("Добавить в отклик пример: миграция, поддержка облачной инфраструктуры, troubleshooting или автоматизация cloud‑операций.");
  }

  recommendations.push("Сохранить вакансию в трекере откликов: компания, ссылка, score, дата, статус, следующий шаг.");
  return unique(recommendations).slice(0, 5);
}

function buildPitch(role, skills, gaps, score) {
  const topSkills = skills.length ? skills.slice(0, 7).join(", ") : "Linux, Windows, cloud infrastructure, automation and troubleshooting";
  const gapSentence = gaps.length
    ? `I also noticed that ${gaps.slice(0, 3).join(", ")} may be important for the role, and I am ready to strengthen these areas quickly through hands-on practice.`
    : "The role looks well aligned with my current infrastructure and automation background.";

  return `Hello,\n\nI am interested in the ${role} position. I have 14+ years of experience in IT infrastructure, system administration and support, with hands-on skills in ${topSkills}.\n\nBased on the vacancy description, my estimated profile match is ${score}%. ${gapSentence}\n\nI can help your team maintain stable infrastructure, automate routine tasks, improve monitoring and support cloud/DevOps processes. I would be glad to discuss how my background can be useful for this role.\n\nBest regards,\nBoris Winebrand`;
}

function renderList(element, items, emptyText) {
  element.innerHTML = "";
  element.classList.toggle("empty", !items.length);
  const list = items.length ? items : [emptyText];
  for (const item of list) {
    const li = document.createElement("li");
    li.textContent = item;
    element.appendChild(li);
  }
}

function renderSteps(element, items) {
  element.innerHTML = "";
  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item;
    element.appendChild(li);
  }
}

function runAnalysis() {
  const text = els.jobText.value.trim();
  if (!text) {
    showToast("Сначала вставьте текст вакансии");
    els.jobText.focus();
    return;
  }
  const report = analyzeVacancy(text);
  lastReport = report;
  els.resultTitle.textContent = report.role;
  els.matchScore.textContent = `${report.score}%`;
  els.meterFill.style.width = `${report.score}%`;
  renderList(els.strengthsList, report.matchedSkills, "Совпадения не найдены");
  renderList(els.gapsList, report.gaps, "Критичных пробелов не найдено");
  renderSteps(els.recommendationsList, report.recommendations);
  els.pitchText.textContent = report.pitch;
}

function loadSample(index) {
  const sample = samples[index] || samples[0];
  els.jobText.value = sample.text;
  runAnalysis();
}

function showToast(message = "Готово") {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 1800);
}

async function copyText(text, message) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(message || "Скопировано");
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    showToast(message || "Скопировано");
  }
}

function downloadReport() {
  if (!lastReport) {
    showToast("Сначала сделайте анализ");
    return;
  }
  const reportText = [
    "JobMatch AI — Vacancy Analysis Report",
    `Date: ${new Date(lastReport.date).toLocaleString()}`,
    `Role: ${lastReport.role}`,
    `Match: ${lastReport.score}%`,
    "",
    "Matched skills:",
    lastReport.matchedSkills.map(skill => `- ${skill}`).join("\n") || "- none",
    "",
    "Gaps:",
    lastReport.gaps.map(gap => `- ${gap}`).join("\n") || "- no critical gaps detected",
    "",
    "Recommendations:",
    lastReport.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join("\n"),
    "",
    "Draft pitch:",
    lastReport.pitch
  ].join("\n");
  const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "jobmatch-ai-report.txt";
  link.click();
  URL.revokeObjectURL(url);
}

function resumeText() {
  return `Я Борис Winebrand, IT Infrastructure / Cloud / Automation specialist с опытом 14+ лет.\n\nПомогаю компаниям поддерживать стабильную IT-инфраструктуру, автоматизировать рутинные процессы, улучшать мониторинг, резервное копирование и внедрять AI-инструменты в рабочие процессы.\n\nНавыки: Linux, Windows, Active Directory, DNS, DHCP, TCP/IP, VMware, Bash, PowerShell, Git, Docker, CI/CD, AWS, Azure, GCP, базовый Python, Prompt Engineering, AI-агенты, RAG.\n\nПроект: JobMatch AI — веб-приложение для анализа IT-вакансий, оценки совпадения с профилем кандидата и подготовки первого отклика рекрутеру.\n\nКонтакты: boriswinebrand@gmail.com, boris.winebrand.career@gmail.com, +972 50 482 0861.`;
}

function initTheme() {
  const savedTheme = localStorage.getItem("jobmatch-theme");
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  els.themeToggle.textContent = document.documentElement.dataset.theme === "dark" ? "☀" : "☾";
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("jobmatch-theme", next);
  els.themeToggle.textContent = next === "dark" ? "☀" : "☾";
}

function init() {
  els.year.textContent = new Date().getFullYear();
  initTheme();
  els.sampleSelect.addEventListener("change", event => loadSample(Number(event.target.value)));
  els.analyzeBtn.addEventListener("click", runAnalysis);
  els.clearBtn.addEventListener("click", () => {
    els.jobText.value = "";
    lastReport = null;
    els.resultTitle.textContent = "Готов к проверке";
    els.matchScore.textContent = "—";
    els.meterFill.style.width = "0%";
    renderList(els.strengthsList, [], "Добавьте вакансию и нажмите анализ.");
    renderList(els.gapsList, [], "После анализа появятся рекомендации.");
    renderSteps(els.recommendationsList, ["Вставьте описание вакансии.", "Получите список аргументов для резюме и отклика."]);
    els.pitchText.textContent = "Здесь появится текст сообщения рекрутеру.";
  });
  els.copyPitchBtn.addEventListener("click", () => copyText(els.pitchText.textContent, "Отклик скопирован"));
  els.copyResumeBtn.addEventListener("click", () => copyText(resumeText(), "Визитка скопирована"));
  els.downloadReportBtn.addEventListener("click", downloadReport);
  els.themeToggle.addEventListener("click", toggleTheme);
  loadSample(0);
}

document.addEventListener("DOMContentLoaded", init);
