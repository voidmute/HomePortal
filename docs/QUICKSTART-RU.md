# Быстрый старт — Family Home Portal на Ubuntu + Cloudflare

Установка с нуля на чистый Ubuntu VPS за ~15 минут. Портал доступен по **HTTPS** через Cloudflare Zero Trust Tunnel. Порт `3000` **не** открыт в интернет.

---

## Что понадобится

- VPS Ubuntu 22.04 / 24.04 (root по SSH)
- Домен в Cloudflare (например `portal.example.com`)
- Аккаунт Cloudflare Zero Trust (бесплатный тариф подходит)
- Deploy key для приватного GitHub-репозитория

---

## Шаг 1 — Cloudflare Zero Trust Tunnel

1. Открой [Cloudflare Zero Trust](https://one.dash.cloudflare.com/) → **Networks** → **Tunnels**
2. **Create a tunnel** → выбери **Cloudflared**
3. Имя туннеля: `homelab-portal`
4. На шаге **Install connector** скопируй **token** (длинная строка `eyJ...`)
5. **Public Hostname**:
   - Subdomain: `portal` (или любой)
   - Domain: ваш домен
   - Service type: **HTTP**
   - URL: `http://localhost:3000`
6. Сохрани. Token понадобится на VPS.

DNS создаётся автоматически, если домен уже в Cloudflare.

---

## Шаг 2 — Deploy key для GitHub

На VPS:

```bash
ssh root@YOUR_VPS_IP
ssh-keygen -t ed25519 -f ~/.ssh/github_homelab -N ""
cat ~/.ssh/github_homelab.pub
```

GitHub → репозиторий **family-home-portal** → **Settings** → **Deploy keys** → **Add deploy key** → вставь pubkey.

```bash
cat >> ~/.ssh/config << 'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_homelab
  IdentitiesOnly yes
EOF
chmod 600 ~/.ssh/config
ssh -T git@github.com
```

Ожидай: `Hi voidmute/family-home-portal! You've successfully authenticated...`

---

## Шаг 3 — Установка (рекомендуется: CLI)

Интерактивное меню на русском: мастер установки, обновление, статус, логи, туннель.

**Вариант A — одна строка на чистом VPS** (после deploy key):

```bash
curl -fsSL https://raw.githubusercontent.com/voidmute/family-home-portal/main/scripts/bootstrap-cli.sh | sudo bash
```

**Вариант B — если репозиторий уже склонирован (end-user режим):**

```bash
git clone git@github.com:voidmute/family-home-portal.git /root/homelab
cd /root/homelab
sudo bash install-homelab.sh
sudo homelab
```

После установки `sudo homelab` можно запускать из любой папки. В меню выберите **«Первая установка»** — мастер спросит домен и token Cloudflare Tunnel, покажет прогресс и логи.

---

### Запасной вариант — bash без CLI

```bash
git clone git@github.com:voidmute/family-home-portal.git /root/homelab
cd /root/homelab
sudo bash scripts/setup-ubuntu.sh
```

Скрипт спросит:
- **Домен** — тот же, что в Cloudflare (например `portal.example.com`)
- **Tunnel token** — из шага 1

Или без вопросов:

```bash
APP_DOMAIN=portal.example.com TUNNEL_TOKEN=eyJ... sudo -E bash scripts/setup-ubuntu.sh
```

Скрипт установит Docker, настроит firewall, соберёт контейнеры, запустит cloudflared.

---

## Шаг 4 — Первый вход

Открой в браузере: **https://portal.example.com**

| Имя | Роль |
|-----|------|
| `alice` | Админ (мониторинг, бэкапы) |
| `bob` | Пользователь |
| `carol` | Пользователь |

При первом входе отсканируй QR-код в Google Authenticator.

---

## Обновление с Windows

```powershell
# Один раз: скопируй .deploy.env.example → .deploy.env и заполни
copy .deploy.env.example .deploy.env

git add .
git commit -m "your changes"
git push origin main

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\deploy.ps1
```

---

## Полезные команды на VPS

**Через CLI (рекомендуется):**

```bash
sudo homelab
```

Меню: обновление, статус, логи контейнеров, переустановка, настройка туннеля.

**Или напрямую bash:**

```bash
cd /root/homelab

docker compose ps              # статус
docker compose logs -f app     # логи приложения
systemctl status cloudflared   # туннель
curl http://127.0.0.1:3000/api/health
bash scripts/deploy-vps.sh     # обновить после git pull
bash scripts/reinstall-vps.sh  # переустановить код (данные сохранятся)
```

---

## Резервное копирование (опционально)

Cron на хосте (ежедневно в 2:00):

```bash
crontab -e
# добавь:
0 2 * * * cd /root/homelab && docker compose exec -T app /app/scripts/backup-db.sh && docker compose exec -T app /app/scripts/backup-cloud.sh
```

---

## Устранение неполадок

**Портал не открывается по HTTPS**
- `systemctl status cloudflared` — должен быть `active`
- В Cloudflare Tunnel hostname → `http://localhost:3000` (не `127.0.0.1` с другим портом)

**Health check failed**
```bash
docker compose logs app
docker compose ps
```

**Сброс TOTP для пользователя**
```bash
docker compose exec -T postgres psql -U homelab -d homelab -c \
  "UPDATE users SET is_totp_setup = false, totp_secret = NULL WHERE name = 'alice';"
```

**Полный сброс данных (осторожно)**
```bash
cd /root/homelab && docker compose down -v
```

---

## Проверка CLI на VPS (ручной чеклист)

После `sudo homelab` или bootstrap one-liner:

1. **Меню** — отображается заголовок HomePortal и пункты на русском
2. **Проверка GitHub / окружения** — все критичные пункты зелёные (root, Ubuntu, `ssh -T git@github.com`)
3. **Первая установка** — мастер проходит шаги 1–5, в логах виден Docker build и health check
4. **Статус системы** — `docker compose ps`, health OK, cloudflared active (если token задан)
5. **Обновить портал** — `deploy-vps.sh` без ошибок
6. **Логи контейнеров** — tail для `app` / `postgres` / `redis`
7. **Выход** — Enter в меню или завершение без зависания терминала

На Windows локально CLI не запускается (требуется root + Ubuntu); достаточно `npm run typecheck` в `cli/` и `npm run build` в корне.

---

## Kyto + Kura — настройка пользователей и env

**Для семьи:** редактируй [`.kyto.config`](.kyto.config) в корне репозитория. Файл `.kyto` не нужен (`config_only = true` в `kyto.toml`).

```text
DOMAIN portal.example.com
ADMIN alice
USERS alice bob carol
DATABASE_URL postgresql://homelab:secret@postgres:5432/homelab
REPO_DIR /root/homelab
```

Имена без учёта регистра (`CAROL` = `carol`). `ADMIN` должен быть в списке `USERS`. Любая другая строка `KEY value` попадает в `.env`.

**Windows (ASM kura):**
```powershell
cd path\to\kyto
.\asm\build.ps1
.\bin\kura-asm.exe install
cd path\to\Cloud
kura compile
```

**Linux / VPS (Rust kura, пока нет ELF-сборки ASM):**
```bash
cd /root/homelab
./scripts/kura-resolve.sh   # предпочитает bin/kura-asm.exe на Windows
cp .kyto.config.example .kyto.config   # если файла ещё нет
nano .kyto.config
kura compile
```

Мастер установки CLI обновляет `DOMAIN` в `.kyto.config` и запускает `kura compile`.

**Шифрование секретов (опционально, Rust kura):**
```bash
export KYTO_KEY=$(openssl rand -hex 32)   # сохрани ключ надёжно
kura encrypt .kyto/portal.local.kyto -o .kyto/portal.local.kyto.enc
rm .kyto/portal.local.kyto
```

Ключ: переменная `KYTO_KEY` или файл `~/.config/kyto/key` (64 hex-символа).

**Проверка на VPS:**
1. `kura compile` — обновляет `.env`, `generated/seed.sql`, `src/generated/users.ts`
2. Добавь имя в `USERS` в `.kyto.config` → `kura compile` → пересобери контейнер
