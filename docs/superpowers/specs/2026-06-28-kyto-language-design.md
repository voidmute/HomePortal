# Kyto Language Design — Family Home Portal

**Date:** 2026-06-28  
**Status:** Approved for implementation  
**Extension:** `.kyto`

## Purpose

Kyto is a privacy-first, lightweight programming language whose v1 role in this repo is **config compilation**: one layered source defines family users, environment variables, and deploy defaults. The **Kura** CLI (`kura`) compiles Kyto sources to `.env`, SQL seeds, TypeScript constants, and bash snippets consumed by the existing Next.js / Docker / bash stack.

## Principles

1. **Single source of truth** — no duplicated user lists or env keys across TS, SQL, and shell.
2. **Config-only integration** — app never parses `.kyto` at runtime; only generated artifacts.
3. **Local-only** — no network, no telemetry in the compiler.
4. **Layered secrets** — committed base + gitignored (optionally encrypted) local overlay.

## File layout

```
.kyto.config                  # committed — easy DOMAIN / USERS / ADMIN editing
.kyto.config.example          # template
.kyto/
  portal.kyto                 # committed — deploy, env builder
  portal.local.example.kyto   # committed template for secrets
  portal.local.kyto           # gitignored — session_secret
  portal.local.kyto.enc       # optional encrypted local layer
generated/
  seed.sql                    # gitignored if contains nothing sensitive (committed OK for structure)
src/generated/
  users.ts                    # AUTHORIZED_USERS for UI
scripts/generated/
  kyto-env.sh                 # REPO_SSH, REPO_DIR, user role SQL helpers
```

## `.kyto.config` (simple layer)

Human-editable file at repo root. Parsed by Kura at compile time; overrides users and `APP_URL` domain.

```text
+ Family portal — edit and run: kura compile
DOMAIN portal.example.com
ADMIN alice
USERS alice bob carol
```

| Directive | Effect |
|-----------|--------|
| `DOMAIN <host>` | Sets `APP_URL=https://<host>` |
| `USERS <name> ...` | Login names (lowercased) |
| `ADMIN <name> ...` | Subset of `USERS` with ADMIN role |

Comments use `+` to end of line (`.kyto` sources use `+` at line start).

If `.kyto.config` is missing, Kura copies `.kyto.config.example` on first compile.

## Language (v1)

### Lexical

- Keywords: `let`, `fn`, `struct`, `enum`, `import`, `if`, `else`, `for`, `in`, `return`, `emit`, `true`, `false`
- Identifiers: `[A-Za-z_][A-Za-z0-9_]*`
- Strings: `"..."` with `\"`, `\\`, `\n`
- Numbers: integer literals
- Comments: `+` to EOL at line start (`.kyto`); `.kyto.config` strips from first `+`
- Operators: `+`, `??`, `.`, `=`, `->`, `:`, `{`, `}`, `[`, `]`, `(`, `)`, `,`

### Types

| Syntax | Meaning |
|--------|---------|
| `string`, `int`, `bool` | Primitives |
| `T[]` | List |
| `map<string, V>` | String-keyed map |
| `Role` | Enum or struct name |
| `local.Secrets` | Imported module type |

### Statements

- `let name: Type = expr`
- `let name = { key: value, ... }` (map literal)
- `fn name(param: Type) -> ReturnType { ... }`
- `enum Name { Variant, ... }`
- `struct Name { field: Type, ... }`
- `import alias from "./path.kyto"`
- `emit env(expr)` | `emit users(expr)` | `emit deploy(expr)`
- `if cond { } else { }`
- `for x in list { }`
- `return expr`

### Built-ins

| Function | Description |
|----------|-------------|
| `random_base64(n)` | Cryptographically random base64 string (compile-time) |
| `len(x)` | Length of string, list, or map |
| `require(cond, msg)` | Abort compile if false |

### Module merge

1. Parse `portal.kyto`.
2. Resolve `import local from "./portal.local.kyto"` — if missing, use empty module with default `Secrets { domain: "localhost", session_secret: null }`.
3. If `portal.local.kyto.enc` exists and `portal.local.kyto` does not, decrypt with `KYTO_KEY` or `~/.config/kyto/key`.
4. Evaluate all top-level bindings; collect `emit` calls.

## Emit API

### `emit env(map<string, string>)`

Writes repo-root `.env` and `.env.example` (secrets redacted in example).

Required keys: `APP_URL`, `SESSION_SECRET`, `DATABASE_URL`, `REDIS_URL`.

### `emit users(User[])`

Writes:

- `generated/seed.sql` — `INSERT ... ON CONFLICT DO NOTHING`
- `src/generated/users.ts` — `AUTHORIZED_USERS`, `AUTHORIZED_NAMES`, role maps
- Role SQL fragment embedded in `scripts/generated/kyto-env.sh`

### `emit deploy(map)`

Writes `scripts/generated/kyto-env.sh` with `REPO_SSH`, `REPO_DIR`, etc.

## Privacy

1. **Gitignore:** `portal.local.kyto`, `.env`, `src/generated/*`, optional `generated/*`
2. **Encrypt:** `kura encrypt .kyto/portal.local.kyto -o .kyto/portal.local.kyto.enc` (XChaCha20-Poly1305, key from env or file)
3. **Decrypt at compile:** `kura compile` auto-detects `.enc` when plaintext local file absent

## CLI (Kura)

```
kura install                  # copy binary to ~/.local/bin and update PATH
kura check [entry.kyto]       # parse + typecheck
kura compile [entry.kyto]     # emit all artifacts (default: .kyto/portal.kyto)
kura encrypt <file> -o out    # encrypt local secrets
kura decrypt <file> -o out    # decrypt to plaintext
```

## Integration hooks

- `predev` / `prebuild` → `kura compile`
- Bash scripts `source scripts/generated/kyto-env.sh`
- Ink InstallWizard writes `portal.local.kyto` then runs `kura compile`

## Success criteria

See plan file `kyto_language_plan_f486eb63.plan.md`.
