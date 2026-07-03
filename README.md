<p align="center">
  <img src=".github/assets/banner-v3.png" alt="HomePortal banner" width="100%" />
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16.2-2A221C?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=2A221C" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.7-D4A96A?style=for-the-badge&logo=typescript&logoColor=2A221C" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-16-9AAB8C?style=for-the-badge&logo=postgresql&logoColor=2A221C" />
  <img alt="Docker" src="https://img.shields.io/badge/Docker_Compose-ready-B8894F?style=for-the-badge&logo=docker&logoColor=white" />
  <img alt="Tests" src="https://img.shields.io/badge/tests-37_passing-9AAB8C?style=for-the-badge&logo=vitest&logoColor=2A221C" />
  <a href="https://voidmute.github.io/HomePortal/"><img alt="Website" src="https://img.shields.io/badge/website-GitHub_Pages-D4A96A?style=for-the-badge&logo=github&logoColor=2A221C" /></a>
</p>

<p align="center">
  <strong>Self-hosted семейный портал:</strong> вход без паролей, личные файлы, мониторинг сервера, бэкапы, аудит и мобильная установка через Android APK / iOS PWA.
</p>

---

## ✦ Что внутри

<!-- FEATURES:START -->
<table border="0" cellspacing="16" cellpadding="28" width="100%">
  <tr>
    <td align="center" valign="top" width="33%">
      <br>
      <img src=".github/assets/feature-auth.png" alt="" width="88" height="88" />
      <br><br>
      <strong>Без паролей</strong>
      <br><br>
      <p align="center"><sub>TOTP-вход через QR, безопасные cookie-сессии на <code>iron-session</code>.</sub></p>
      <br>
    </td>
    <td align="center" valign="top" width="33%">
      <br>
      <img src=".github/assets/feature-cloud.png" alt="" width="88" height="88" />
      <br><br>
      <strong>Личное облако</strong>
      <br><br>
      <p align="center"><sub>Файлы каждого пользователя изолированы, пути защищены от traversal/symlink escape.</sub></p>
      <br>
    </td>
    <td align="center" valign="top" width="33%">
      <br>
      <img src=".github/assets/feature-monitoring.png" alt="" width="88" height="88" />
      <br><br>
      <strong>Живой мониторинг</strong>
      <br><br>
      <p align="center"><sub>SSE-метрики CPU/RAM/диска прямо из админ-панели.</sub></p>
      <br>
    </td>
  </tr>
  <tr>
    <td colspan="3" height="12"></td>
  </tr>
  <tr>
    <td align="center" valign="top" width="33%">
      <br>
      <img src=".github/assets/feature-backup.png" alt="" width="88" height="88" />
      <br><br>
      <strong>Бэкапы и аудит</strong>
      <br><br>
      <p align="center"><sub>Ручные и cron-бэкапы PostgreSQL/файлов, журнал действий админов.</sub></p>
      <br>
    </td>
    <td align="center" valign="top" width="33%">
      <br>
      <img src=".github/assets/feature-mobile.png" alt="" width="88" height="88" />
      <br><br>
      <strong>Мобильный опыт</strong>
      <br><br>
      <p align="center"><sub>Capacitor APK для Android, installable PWA для iPhone/iPad.</sub></p>
      <br>
    </td>
    <td align="center" valign="top" width="33%">
      <br>
      <img src=".github/assets/feature-selfhosted.png" alt="" width="88" height="88" />
      <br><br>
      <strong>Self-hosted</strong>
      <br><br>
      <p align="center"><sub>Docker Compose на VPS, публичный доступ через Cloudflare Zero Trust Tunnel.</sub></p>
      <br>
    </td>
  </tr>
</table>
<!-- FEATURES:END -->

## ✦ Архитектура

```mermaid
flowchart LR
  family[Family devices<br/>Browser · Android APK · iOS PWA]
  cf[Cloudflare<br/>HTTPS + Zero Trust Tunnel]
  tunnel[cloudflared<br/>localhost only]
  app[Next.js app<br/>standalone Docker image]
  pg[(PostgreSQL 16)]
  redis[(Redis 7)]
  backup[Backups<br/>/data/backups]
  cloud[Private files<br/>/data/cloud]

  family --> cf --> tunnel --> app
  app --> pg
  app --> redis
  app --> backup
  app --> cloud
```

Порт `3000` на VPS слушает только `127.0.0.1`; наружу портал смотрит через Cloudflare Tunnel. Это держит сервер закрытым, а управление доменом/HTTPS остается на стороне Cloudflare.

## ✦ Быстрый старт

Полная инструкция на русском: [`docs/QUICKSTART-RU.md`](docs/QUICKSTART-RU.md).

На чистом Ubuntu VPS (репозиторий публичный — deploy key не нужен):

```bash
curl -fsSL https://raw.githubusercontent.com/voidmute/HomePortal/main/scripts/bootstrap-cli.sh | sudo bash
```

Windows (PowerShell):

```powershell
irm https://raw.githubusercontent.com/voidmute/HomePortal/main/scripts/bootstrap-cli.ps1 | iex
```

Сайт с автоопределением ОС и one-liner установки: [voidmute.github.io/HomePortal](https://voidmute.github.io/HomePortal/).

Если репозиторий уже склонирован и вы хотите пользоваться порталом как end-user, установите команду `homelab` один раз:

```bash
git clone https://github.com/voidmute/HomePortal.git /root/homelab
cd /root/homelab
sudo bash install-homelab.sh
sudo homelab
```

После этого `sudo homelab` работает из любой папки и открывает интерактивный CLI: установка Docker, Cloudflare Tunnel, генерация `.env`, деплой, статус и логи. Запасной вариант без CLI:

```bash
sudo bash scripts/setup-ubuntu.sh
```

## ✦ Стек

| Слой | Технологии |
|------|------------|
| Web app | Next.js 16, React 19, TypeScript, Tailwind, Framer Motion |
| Auth | `iron-session`, TOTP (`otplib`), AES-256-GCM для секретов в БД, QR onboarding |
| Data | PostgreSQL 16, Drizzle ORM 0.45+, `postgres` |
| Cache / rate limit | Redis 7 через `ioredis`, in-memory fallback |
| Mobile | Capacitor Android, iOS installable PWA |
| Deploy | Docker Compose, Cloudflare Tunnel, GitHub Actions |
| Config | Kyto + Kura, `.kyto.config` → `.env` / users / seed SQL |
| Tests | Vitest unit tests for security/error/rate-limit utilities |

## ✦ Модули портала

| Маршрут | Доступ | Назначение |
|---------|--------|------------|
| `/dashboard` | Все | Главная семейная панель |
| `/dashboard/cloud` | Все | Личные файлы пользователя |
| `/dashboard/download` | Все | Android APK + iOS install guide |
| `/dashboard/monitoring` | `ADMIN` | Метрики сервера в реальном времени |
| `/dashboard/backup` | `ADMIN` | Бэкапы, статусы, аудит |
| `/api/health` | Системный | Health check PostgreSQL / Redis |

## ✦ Пользователи и конфигурация

Проект использует `config_only = true` в [`kyto.toml`](kyto.toml): главный файл конфигурации — `.kyto.config` (локальный, gitignored). Для нового окружения:

```bash
cp .kyto.config.example .kyto.config
# отредактируй DOMAIN, ADMIN, USERS, POSTGRES_PASSWORD
npm run build # автоматически выполнит node scripts/kura-compile.js
```

Минимальный пример:

```text
DOMAIN portal.example.com
ADMIN alice
USERS alice bob carol
POSTGRES_PASSWORD changeme
DATABASE_URL postgresql://homelab:changeme@postgres:5432/homelab
```

Kura компилирует конфигурацию в `.env`, `generated/seed.sql`, `generated/users.json`, `src/generated/users.ts` и deploy env script. Docker-сборка подтягивает последний [Kyto release](https://github.com/voidmute/kyto/releases/latest) (`kura` для Linux). На Windows dev-машине можно использовать vendored `bin/kura-asm.exe`.

## ✦ Мобильное приложение

### Android

Android — Capacitor WebView wrapper над живым Next.js сайтом. App ID: `com.homelab.portal`, имя: `HomePortal`.

| Возможность | Статус |
|-------------|--------|
| Фирменная иконка / splash | Да, генерируется из `scripts/generate-mobile-assets.js` |
| Подписанный release APK | Да, GitHub Actions собирает по тегу `v*` |
| Debug APK | Да, fallback для ручного workflow |
| Версия APK | `versionName` берется из Git tag, `versionCode` из `GITHUB_RUN_NUMBER` |

Собрать релиз:

```bash
git tag v1.1.0
git push origin v1.1.0
```

### iOS

iOS — PWA без App Store: манифест, `apple-icon.png`, `theme-color`, standalone mode и service worker уже настроены. Установка: открыть портал в Safari → Share → Add to Home Screen.

### Assets

```bash
npm run assets:generate # Android + PWA icons/splash
npm run assets:readme   # README banner + inline feature grid
npm run assets:all      # everything
```

**Важно:** `android/keystore/release.keystore` и `android/keystore.properties` не коммитятся. Потеря keystore = невозможность обновлять уже установленный APK под тем же package ID.

## ✦ Локальная разработка

```bash
cp .kyto.config.example .kyto.config
# отредактируй DOMAIN, ADMIN, USERS, POSTGRES_PASSWORD
npm ci
node scripts/kura-compile.js
npm run dev
```

Docker:

```bash
cp .env.example .env
docker compose up --build
```

Capacitor:

```bash
npm run cap:sync
npm run cap:open
```

## ✦ Переменные окружения

| Переменная | Обязательна | Описание |
|------------|-------------|----------|
| `SESSION_SECRET` | Да | Секрет cookie-сессии и ключ шифрования TOTP в БД, минимум 32 символа |
| `TOTP_ENROLLMENT_OPEN` | Нет | Разрешить первичную привязку TOTP (`true` по умолчанию; после онбординга семьи — `false`) |
| `MAX_UPLOAD_BYTES` | Нет | Лимит размера загрузки в байтах (по умолчанию `104857600` = 100 MB) |
| `APP_URL` | Да | Публичный URL, например `https://portal.example.com` |
| `DATABASE_URL` | Compose | PostgreSQL connection string |
| `POSTGRES_PASSWORD` | Compose | Пароль PostgreSQL, синхронизирован с `DATABASE_URL` |
| `REDIS_URL` | Compose | Redis для rate limiting |
| `PRIVATE_CLOUD_ROOT` | Да | Root для пользовательских файлов |
| `BACKUP_ROOT` | Да | Root для бэкапов |
| `NEXT_PUBLIC_APK_URL` | Нет | Ссылка на готовый APK в UI |
| `CAPACITOR_SERVER_URL` | Нет | URL, который Android WebView будет открывать |

## ✦ Deploy с Windows

```powershell
copy .deploy.env.example .deploy.env
# отредактируй VPS_HOST, APP_DOMAIN, CLOUDFLARED_TOKEN
.\deploy.ps1
```

## ✦ Основные скрипты

| Скрипт | Назначение |
|--------|------------|
| `install-homelab.sh` | Устанавливает глобальную команду `homelab` в `/usr/local/bin` |
| `sudo homelab` | Открывает интерактивный HomePortal CLI из любой папки |
| `npm run setup --prefix cli` | Dev fallback для запуска CLI из репозитория |
| `scripts/bootstrap-cli.sh` | Bootstrap CLI на чистом Ubuntu |
| `scripts/setup-ubuntu.sh` | Первая установка без CLI |
| `scripts/deploy-vps.sh` | `git pull` + rebuild + health check |
| `scripts/reinstall-vps.sh` | Чистый клон, volumes сохраняются |
| `scripts/install-cloudflared.sh` | Установка Cloudflare Tunnel |
| `scripts/kura-resolve.sh` | Поиск / загрузка Kura на Linux |
| `scripts/generate-mobile-assets.js` | Генерация mobile/PWA assets |
| `scripts/generate-readme-assets.js` | Генерация README banner/mark |
| `scripts/generate-readme-features-html.js` | Inline SVG feature grid в README |

## ✦ Безопасность

| Область | Поведение |
|---------|-----------|
| Вход | TOTP без паролей; секреты шифруются AES-256-GCM в PostgreSQL |
| Онбординг | `TOTP_ENROLLMENT_OPEN` закрывает гонку при первой привязке QR |
| Имена | Список пользователей не попадает в клиентский JS — только server action |
| Файлы | Санитизация `file.name`, лимит размера, запись без перезаписи (`wx`) |
| Сеть | Postgres/Redis не смотрят наружу; приложение за Cloudflare Tunnel |
| Секреты | Обязательные env без дефолтов; бэкап БД падает без `POSTGRES_PASSWORD` |
| Роли | Middleware + `requireAdmin()` на каждом admin API |

## ✦ Проверка качества

```bash
npm run build
npm test
npm run lint
```

Текущие unit-тесты (37) покрывают path-safety облака, санитизацию имён загрузки, шифрование TOTP, нормализацию ошибок и in-memory rate limiter.

## ✦ GitHub Actions

| Workflow | Trigger | Результат |
|----------|---------|-----------|
| `Build Android APK` | `workflow_dispatch` | Debug APK artifact |
| `Build Android APK` | `push tags: v*` | Signed release APK + GitHub Release |

Signing secrets ожидаются в репозитории: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

## ✦ License

MIT-style family self-hosted project. См. репозиторий [voidmute/HomePortal](https://github.com/voidmute/HomePortal).
