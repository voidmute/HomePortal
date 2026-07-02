// HomePortal landing — React + Framer Motion (no build step, ESM via importmap).
// All animation is Framer Motion only, gated by prefers-reduced-motion.
import { createElement, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import htm from "htm";
import {
  Lock,
  Cloud,
  Activity,
  Archive,
  Smartphone,
  Server,
  GitHub,
  Terminal,
  Copy,
  Check,
  Grid,
  ShieldOff,
} from "react-feather";

const html = htm.bind(createElement);
const REPO = "https://github.com/voidmute/HomePortal";

/* ---------------------------------------------------------------- brand mark */
const Mark = ({ className }) => html`
  <svg class=${className} viewBox="0 0 120 150" role="img" aria-label="HomePortal">
    <path
      d="M14 140 V50 a46 46 0 0 1 92 0 V140 Z M36 140 V50 a24 24 0 0 1 48 0 V140 Z"
      fill="currentColor"
      fill-rule="evenodd"
    />
  </svg>
`;

/* ---------------------------------------------------------------- motion util */
function useReveal() {
  const reduce = useReducedMotion();
  return (delay = 0) =>
    reduce
      ? { initial: false }
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.3 },
          transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
        };
}

/* ---------------------------------------------------------------- OS detect */
const INSTALL = {
  linux: {
    label: "Ubuntu / Linux",
    title: "user@server: ~",
    prompt: "user@server:~$",
    cmd: "curl -fsSL https://raw.githubusercontent.com/voidmute/HomePortal/main/scripts/bootstrap-cli.sh | sudo bash",
  },
  windows: {
    label: "Windows · PowerShell",
    title: "Windows PowerShell",
    prompt: "PS C:\\>",
    cmd: "irm https://raw.githubusercontent.com/voidmute/HomePortal/main/scripts/bootstrap-cli.ps1 | iex",
  },
};

function detectOS() {
  if (typeof navigator === "undefined") return "linux";
  const ua = (navigator.userAgent || "") + " " + (navigator.platform || "");
  if (/windows|win32|win64/i.test(ua)) return "windows";
  return "linux"; // Ubuntu is the real deployment target; macOS is unsupported
}

const OS_NAME = { linux: "Ubuntu / Linux", windows: "Windows" };

/* ---------------------------------------------------------------- nav */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    // IntersectionObserver-free, cheap: rAF-throttled read via scroll is banned
    // by the design skill, so use a sentinel + IntersectionObserver instead.
    const sentinel = document.createElement("div");
    sentinel.style.cssText = "position:absolute;top:6px;height:1px;width:1px;";
    document.body.appendChild(sentinel);
    const io = new IntersectionObserver(
      ([e]) => setScrolled(!e.isIntersecting),
      { threshold: 0 }
    );
    io.observe(sentinel);
    return () => {
      io.disconnect();
      sentinel.remove();
    };
  }, []);

  return html`
    <nav class="nav" data-scrolled=${scrolled}>
      <div class="shell nav__inner">
        <a class="brand" href="#top" aria-label="HomePortal">
          <${Mark} className="brand__mark" />
          <span class="brand__word">HomePortal</span>
        </a>
        <div class="nav__links">
          <a href="#install">Установка</a>
          <a href="#features">Возможности</a>
          <a href="#architecture">Как устроено</a>
          <a href="#modules">Модули</a>
        </div>
        <div class="nav__cta">
          <a class="btn btn--ghost" href=${REPO} target="_blank" rel="noreferrer">
            <${GitHub} size=${16} /> GitHub
          </a>
          <a class="btn btn--primary" href="#install">Развернуть</a>
        </div>
      </div>
    </nav>
  `;
}

/* ---------------------------------------------------------------- hero */
function Hero() {
  const reduce = useReducedMotion();
  const rise = (delay) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] },
        };

  return html`
    <header class="hero shell" id="top">
      <${motion.span} class="hero__eyebrow" ...${rise(0)}>
        <span class="hero__dot"></span> Self-hosted · Open для семьи
      </${motion.span}>

      <${motion.div} class="hero__wordmark" ...${rise(0.06)}>
        <span class="hero__script">Home</span>
        <${Mark} className="hero__mark" />
        <span class="hero__script">Portal</span>
      </${motion.div}>

      <${motion.p} class="hero__tagline" ...${rise(0.14)}>
        Уютный портал для всей семьи: вход без паролей, личное облако, мониторинг и
        бэкапы. Всё на вашем сервере.
      </${motion.p}>

      <${motion.div} class="hero__actions" ...${rise(0.22)}>
        <a class="btn btn--primary" href="#install">
          <${Terminal} size=${16} /> Развернуть одной командой
        </a>
        <a class="btn btn--ghost" href=${REPO} target="_blank" rel="noreferrer">
          <${GitHub} size=${16} /> Исходный код
        </a>
      </${motion.div}>

      <${motion.p} class="hero__meta" ...${rise(0.3)}>
        Next.js · PostgreSQL · Docker · Cloudflare Tunnel · Android / iOS
      </${motion.p}>
    </header>
  `;
}

/* ---------------------------------------------------------------- installer */
function Installer() {
  const reveal = useReveal();
  const [os, setOs] = useState(detectOS);
  const [detected] = useState(detectOS);
  const [copied, setCopied] = useState(false);
  const active = INSTALL[os];

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(active.cmd);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return html`
    <section class="section shell" id="install">
      <div class="install">
        <${motion.div} ...${reveal(0)}>
          <p class="section__kicker">Одна команда</p>
          <h2 class="section__title">Разворачивается там, где вы работаете</h2>
          <p class="section__lead">
            Сайт определил вашу систему: <strong>${OS_NAME[detected]}</strong>. Скопируйте
            строку ниже и вставьте в терминал.
          </p>
          <ul class="install__points">
            <li><${Check} size=${18} /> Без ручного git: CLI скачает и настроит всё сам</li>
            <li><${Check} size=${18} /> Ставит Node, зависимости и Docker-сервисы</li>
            <li><${Check} size=${18} /> Приватный доступ через Cloudflare Tunnel</li>
          </ul>
        </${motion.div}>

        <${motion.div} class="terminal" ...${reveal(0.1)}>
          <div class="terminal__bar">
            <div class="terminal__lights"><span></span><span></span><span></span></div>
            <span class="terminal__title">${active.title}</span>
          </div>

          <div class="terminal__tabs" role="tablist" aria-label="Операционная система">
            ${Object.keys(INSTALL).map(
              (key) => html`
                <button
                  key=${key}
                  class="tab"
                  role="tab"
                  aria-selected=${os === key}
                  data-active=${os === key}
                  onClick=${() => setOs(key)}
                >
                  ${INSTALL[key].label}
                  ${os === key
                    ? html`<${motion.span}
                        class="tab__ink"
                        layoutId="tabink"
                        transition=${{ type: "spring", stiffness: 400, damping: 32 }}
                      />`
                    : null}
                </button>
              `
            )}
          </div>

          <div class="terminal__body">
            <div class="terminal__prompt">${active.prompt}</div>
            <div class="terminal__cmdrow">
              <${AnimatePresence} mode="wait">
                <${motion.code}
                  key=${os}
                  class="terminal__cmd"
                  initial=${{ opacity: 0, y: 6 }}
                  animate=${{ opacity: 1, y: 0 }}
                  exit=${{ opacity: 0, y: -6 }}
                  transition=${{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span class="sigil">${os === "windows" ? ">" : "$"}</span>${active.cmd}
                </${motion.code}>
              </${AnimatePresence}>
              <button class="copy" data-done=${copied} onClick=${copy} aria-label="Скопировать команду">
                <${AnimatePresence} mode="wait" initial=${false}>
                  ${copied
                    ? html`<${motion.span}
                        key="done"
                        style=${{ display: "inline-flex", alignItems: "center", gap: "7px" }}
                        initial=${{ opacity: 0, scale: 0.8 }}
                        animate=${{ opacity: 1, scale: 1 }}
                        exit=${{ opacity: 0, scale: 0.8 }}
                        transition=${{ duration: 0.18 }}
                      ><${Check} size=${15} /> Готово</${motion.span}>`
                    : html`<${motion.span}
                        key="copy"
                        style=${{ display: "inline-flex", alignItems: "center", gap: "7px" }}
                        initial=${{ opacity: 0, scale: 0.8 }}
                        animate=${{ opacity: 1, scale: 1 }}
                        exit=${{ opacity: 0, scale: 0.8 }}
                        transition=${{ duration: 0.18 }}
                      ><${Copy} size=${15} /> Копировать</${motion.span}>`}
                </${AnimatePresence}>
              </button>
            </div>
            <div class="terminal__foot">
              <span class="live"></span> Проверенный скрипт из репозитория HomePortal
            </div>
          </div>
        </${motion.div}>
      </div>
    </section>
  `;
}

/* ---------------------------------------------------------------- features */
const FEATURES = [
  {
    icon: Lock,
    title: "Вход без паролей",
    text: html`Passkeys и magic-link вместо паролей. Сессии в Redis, доступ по ролям.`,
    span: "wide",
    tint: true,
  },
  {
    icon: Cloud,
    title: "Личное облако",
    text: html`Файлы семьи со свободным доступом. Пути очищаются на сервере.`,
  },
  {
    icon: Activity,
    title: "Живой мониторинг",
    text: html`CPU, память и диск в реальном времени прямо на дашборде.`,
  },
  {
    icon: Archive,
    title: "Бэкапы",
    text: html`Регулярные снапшоты БД и файлов, восстановление в одну команду.`,
  },
  {
    icon: Smartphone,
    title: "Мобильный доступ",
    text: html`PWA для iOS и подписанный <code>.apk</code> для Android.`,
  },
  {
    icon: Server,
    title: "Полностью ваш сервер",
    text: html`Никаких внешних сервисов. Данные не покидают ваш дом.`,
    span: "wide",
    tint: true,
  },
];

function Features() {
  const reveal = useReveal();
  return html`
    <section class="section shell" id="features">
      <div class="section__head section__head--center">
        <h2 class="section__title">Всё, что нужно домашнему серверу</h2>
        <p class="section__lead">
          Собрано под семью: безопасно по умолчанию, приятно каждый день.
        </p>
      </div>
      <div class="bento">
        ${FEATURES.map(
          (f, i) => html`
            <${motion.article}
              key=${f.title}
              class=${`feature${f.span === "wide" ? " feature--wide" : ""}${f.tint ? " feature--tint" : ""}`}
              ...${reveal((i % 3) * 0.06)}
            >
              <div class="feature__icon"><${f.icon} size=${24} /></div>
              <h3>${f.title}</h3>
              <p>${f.text}</p>
            </${motion.article}>
          `
        )}
      </div>
    </section>
  `;
}

/* ---------------------------------------------------------------- architecture */
const STEPS = [
  { n: "01", t: "Семья открывает адрес", d: "Один домен, доступный из любой точки." },
  { n: "02", t: "Cloudflare Tunnel", d: "Приватный туннель без открытых портов." },
  { n: "03", t: "Next.js приложение", d: "Портал, облако и дашборд в одном месте." },
  { n: "04", t: "Postgres и Redis", d: "Данные и сессии на вашем железе." },
];

function Architecture() {
  const reveal = useReveal();
  return html`
    <section class="section shell" id="architecture">
      <div class="section__head">
        <h2 class="section__title">Путь запроса от двери до данных</h2>
      </div>
      <div class="flow">
        ${STEPS.map(
          (s, i) => html`
            <${motion.div} key=${s.n} class="flow__step" ...${reveal(i * 0.06)}>
              <div class="n">${s.n}</div>
              <h3>${s.t}</h3>
              <p>${s.d}</p>
            </${motion.div}>
          `
        )}
      </div>
    </section>
  `;
}

/* ---------------------------------------------------------------- modules */
const MODULES = [
  { icon: Grid, name: "Дашборд", path: "app/dashboard", role: "core" },
  { icon: Cloud, name: "Облако", path: "app/cloud", role: "files" },
  { icon: Activity, name: "Мониторинг", path: "app/monitoring", role: "ops" },
  { icon: ShieldOff, name: "Доступ", path: "lib/auth", role: "auth" },
];

function Modules() {
  const reveal = useReveal();
  return html`
    <section class="section shell" id="modules">
      <div class="section__head">
        <h2 class="section__title">Из чего собран портал</h2>
      </div>
      <div class="modules">
        ${MODULES.map(
          (m, i) => html`
            <${motion.div} key=${m.name} class="module" ...${reveal((i % 2) * 0.06)}>
              <div class="module__icon"><${m.icon} size=${20} /></div>
              <div>
                <h3>${m.name}</h3>
                <div class="path">${m.path}</div>
              </div>
              <span class="role">${m.role}</span>
            </${motion.div}>
          `
        )}
      </div>
    </section>
  `;
}

/* ---------------------------------------------------------------- closer + footer */
function Closer() {
  const reveal = useReveal();
  return html`
    <section class="section shell">
      <${motion.div} class="closer" ...${reveal(0)}>
        <div class="hero__wordmark" style=${{ margin: "0 0 6px" }}>
          <${Mark} className="hero__mark" style=${{ width: "56px" }} />
        </div>
        <h2>Домашний сервер, который приятно открывать</h2>
        <p>Разверните HomePortal за минуты и подключите всю семью.</p>
        <div class="hero__actions">
          <a class="btn btn--primary" href="#install">
            <${Terminal} size=${16} /> Развернуть одной командой
          </a>
          <a class="btn btn--ghost" href=${REPO} target="_blank" rel="noreferrer">
            <${GitHub} size=${16} /> GitHub
          </a>
        </div>
      </${motion.div}>
    </section>
  `;
}

function Footer() {
  return html`
    <footer class="footer">
      <div class="shell footer__inner">
        <a class="brand" href="#top">
          <${Mark} className="brand__mark" />
          <span class="brand__word">HomePortal</span>
        </a>
        <div class="footer__links">
          <a href="#install">Установка</a>
          <a href="#features">Возможности</a>
          <a href="#architecture">Как устроено</a>
          <a href=${REPO} target="_blank" rel="noreferrer">GitHub</a>
        </div>
        <p class="footer__note">Self-hosted. Данные остаются дома.</p>
      </div>
    </footer>
  `;
}

/* ---------------------------------------------------------------- app */
function App() {
  return html`
    <div class="aura"></div>
    <${Nav} />
    <main>
      <${Hero} />
      <${Installer} />
      <${Features} />
      <${Architecture} />
      <${Modules} />
      <${Closer} />
    </main>
    <${Footer} />
    <div class="grain"></div>
  `;
}

createRoot(document.getElementById("root")).render(html`<${App} />`);
