#!/usr/bin/env python3
"""Build Xiaomi Electric Scooter Elite 30 km/h firmware packages."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MI_FW_INFO_URL = "https://raw.githubusercontent.com/argusblack/mi-fw-info/main/data.json"
BW_PATCHER_REPO = "https://github.com/scooterteam/bw-patcher.git"
OUTPUT_ZIP = ROOT / "xiaomi-elite-30kmh.zip"
LEGACY_XIAOFLASHER_ZIP = ROOT / "xiaomi-elite-30kmh-xiaoflasher.zip"
SPORT_KMH = 30
DRIVE_KMH = 20
PED_KMH = 6


def run(cmd: list[str], cwd: Path | None = None) -> None:
    print("+", " ".join(cmd))
    subprocess.run(cmd, cwd=cwd, check=True)


def download(url: str, dest: Path) -> None:
    print(f"Downloading {url}")
    with urllib.request.urlopen(url) as response:
        dest.write_bytes(response.read())


def elite_firmware_urls() -> tuple[str, str]:
    with urllib.request.urlopen(MI_FW_INFO_URL) as response:
        data = json.load(response)
    for item in data:
        if item.get("model") == "xiaomi.scooter.elite":
            firmware = item["firmware"]
            return firmware["mcu_safe_url"], firmware["safe_url"]
    raise RuntimeError("Xiaomi Electric Scooter Elite firmware not found in mi-fw-info data")


def ensure_bw_patcher(workdir: Path) -> Path:
    repo = workdir / "bw-patcher"
    if not repo.exists():
        run(["git", "clone", "--depth", "1", BW_PATCHER_REPO, str(repo)])
    run([sys.executable, "-m", "pip", "install", "-q", "-r", "requirements.txt"], cwd=repo)
    return repo


def patch_firmware(repo: Path, stock_mcu: Path, patched_full: Path) -> None:
    patches = f"sls={SPORT_KMH},sld={DRIVE_KMH},slp={PED_KMH},chk,img"
    run(
        [
            sys.executable,
            "-m",
            "bwpatcher",
            "mi5elite",
            str(stock_mcu),
            str(patched_full),
            patches,
        ],
        cwd=repo,
    )


def flashing_instructions() -> str:
    return f"""Xiaomi Electric Scooter Elite - 30 km/h firmware package
============================================================

WHY XiaoFlasher FAILS (\"Reboot scooter and app\")
-------------------------------------------------
The Elite does NOT use the old Ninebot M365/Pro/Pro2 controller. It has a
Brightway N32 (LEQI) motor controller flashed over UART, not through
XiaoFlasher's BLE zip format. The previous XiaoFlasher zip used the wrong
encryption and firmware layout, so the scooter rejects it and the app loops
on reboot.

USE BW-FLASHER (correct method)
-------------------------------
1. Install BW-Flasher: https://github.com/scooterteam/bw-flasher/releases
2. Wiring: USB-UART adapter (CH340/CP2102/FTDI) at 5V + dashboard cable
3. Open BW-Flasher and select: elite-30kmh-patched.bin
4. Flash with the scooter powered on
5. Disconnect UART, reboot scooter, test in Sport mode (target {SPORT_KMH} km/h)

RECOVERY (if stuck rebooting / after a bad flash)
-------------------------------------------------
1. Keep the UART connection
2. In BW-Flasher, flash: elite-stock-recovery.bin
3. Reboot scooter and Xiaomi app once
4. Then flash elite-30kmh-patched.bin again

FILES IN THIS ZIP
-----------------
- elite-30kmh-patched.bin   Patched full MCU image ({SPORT_KMH} km/h sport)
- elite-stock-recovery.bin  Stock MCU image for recovery
- FLASHING.txt              This guide

Safety: flashing custom firmware can void warranty and may be illegal in
your region. You are responsible for the result.
"""


def build_package(stock_mcu: Path, stock_upd: Path, patched_full: Path, output_zip: Path) -> None:
    staging = ROOT / ".staging"
    if staging.exists():
        shutil.rmtree(staging)
    staging.mkdir(parents=True)

    shutil.copy2(patched_full, staging / "elite-30kmh-patched.bin")
    shutil.copy2(stock_mcu, staging / "elite-stock-recovery.bin")
    (staging / "FLASHING.txt").write_text(flashing_instructions(), encoding="utf-8")

    manifest = {
        "model": "xiaomi.scooter.elite",
        "name": "Xiaomi Electric Scooter Elite",
        "flashing_tool": "BW-Flasher (UART)",
        "not_supported": ["XiaoFlasher", "DownG", "mi.cfw.sh zip2"],
        "max_speed_sport_kmh": SPORT_KMH,
        "max_speed_drive_kmh": DRIVE_KMH,
        "max_speed_ped_kmh": PED_KMH,
        "files": {
            "patched": "elite-30kmh-patched.bin",
            "recovery": "elite-stock-recovery.bin",
        },
    }
    (staging / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    if output_zip.exists():
        output_zip.unlink()
    if LEGACY_XIAOFLASHER_ZIP.exists():
        LEGACY_XIAOFLASHER_ZIP.unlink()

    with zipfile.ZipFile(output_zip, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(staging.iterdir()):
            archive.write(path, arcname=path.name)

    shutil.rmtree(staging)


def main() -> int:
    cache = ROOT / ".cache"
    cache.mkdir(parents=True, exist_ok=True)

    stock_mcu = cache / "stock-elite-mcu.bin"
    stock_upd = cache / "stock-elite-upd.bin"
    patched_full = cache / "elite-30kmh-patched-full.bin"

    mcu_url, upd_url = elite_firmware_urls()
    if not stock_mcu.exists():
        download(mcu_url, stock_mcu)
    if not stock_upd.exists():
        download(upd_url, stock_upd)

    repo = ensure_bw_patcher(cache)
    patch_firmware(repo, stock_mcu, patched_full)

    if patched_full.stat().st_size != stock_mcu.stat().st_size:
        raise RuntimeError(
            f"Expected full image size {stock_mcu.stat().st_size}, got {patched_full.stat().st_size}"
        )

    build_package(stock_mcu, stock_upd, patched_full, OUTPUT_ZIP)
    print(f"Created {OUTPUT_ZIP} ({OUTPUT_ZIP.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
