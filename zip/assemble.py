#!/usr/bin/env python3
"""Assemble a XiaoFlasher-style zip2 firmware package for Xiaomi Electric Scooter Elite at 30 km/h."""

from __future__ import annotations

import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MI_FW_INFO_URL = "https://raw.githubusercontent.com/argusblack/mi-fw-info/main/data.json"
BW_PATCHER_REPO = "https://github.com/scooterteam/bw-patcher.git"
OUTPUT_ZIP = ROOT / "xiaomi-elite-30kmh-xiaoflasher.zip"
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


def elite_mcu_url() -> str:
    with urllib.request.urlopen(MI_FW_INFO_URL) as response:
        data = json.load(response)
    for item in data:
        if item.get("model") == "xiaomi.scooter.elite":
            return item["firmware"]["mcu_safe_url"]
    raise RuntimeError("Xiaomi Electric Scooter Elite MCU firmware not found in mi-fw-info data")


def ensure_bw_patcher(workdir: Path) -> Path:
    repo = workdir / "bw-patcher"
    if not repo.exists():
        run(["git", "clone", "--depth", "1", BW_PATCHER_REPO, str(repo)])
    run([sys.executable, "-m", "pip", "install", "-q", "-r", "requirements.txt"], cwd=repo)
    return repo


def patch_firmware(repo: Path, stock: Path, patched: Path) -> None:
    patches = f"sls={SPORT_KMH},sld={DRIVE_KMH},slp={PED_KMH},chk"
    run(
        [
            sys.executable,
            "-m",
            "bwpatcher",
            "mi5elite",
            str(stock),
            str(patched),
            patches,
        ],
        cwd=repo,
    )


def load_ninebot_tea(workdir: Path):
    repo = workdir / "fw-zip-package-v3"
    if not repo.exists():
        run(
            [
                "git",
                "clone",
                "--depth",
                "1",
                "--recurse-submodules",
                "https://github.com/scooterhacking/fw-zip-package-v3.git",
                str(repo),
            ]
        )
    tea_dir = repo / "Python" / "NinebotTEA"
    if not any(tea_dir.glob("*.py")):
        run(
            [
                "git",
                "clone",
                "--depth",
                "1",
                "https://github.com/ScooterHacking/NinebotTEA.git",
                str(tea_dir),
            ]
        )
    sys.path.insert(0, str(repo / "Python"))
    from NinebotTEA.NinebotTEA import NinebotTEA  # noqa: WPS433

    return NinebotTEA()


def build_zip2(patched: Path, output_zip: Path) -> None:
    firm = patched.read_bytes()
    tea = load_ninebot_tea(ROOT / ".cache")
    encrypted = tea.encrypt(firm)
    md5e = hashlib.md5(encrypted).hexdigest()

    info_txt = "\n".join(
        [
            "dev: elite;",
            "nam: ELITE-CFW-30;",
            "enc: Y;",
            "typ: DRV;",
            f"md5e: {md5e};",
            "",
        ]
    )

    params_txt = "\n".join(
        [
            f"- Version: ELITE-CFW-{SPORT_KMH}",
            "- Model: Xiaomi Electric Scooter Elite",
            "- Flashing app: XiaoFlasher (zip2 package)",
            "- Patches: sport speed limit, drive speed limit, pedestrian speed limit, checksum fix",
            f"- Max speed (Sport): {SPORT_KMH} km/h",
            f"- Max speed (Drive): {DRIVE_KMH} km/h",
            f"- Max speed (Pedestrian): {PED_KMH} km/h",
            "- Source stock MCU: xiaomi.scooter.elite (mi-fw-info)",
            "- Patcher: scooterteam/bw-patcher (mi5elite)",
        ]
    )

    params_json = {
        "model": "xiaomi.scooter.elite",
        "name": "Xiaomi Electric Scooter Elite",
        "output": "zip2",
        "max_speed_sport_kmh": SPORT_KMH,
        "max_speed_drive_kmh": DRIVE_KMH,
        "max_speed_ped_kmh": PED_KMH,
        "patches": ["sls", "sld", "slp", "chk"],
    }

    staging = ROOT / ".staging"
    if staging.exists():
        shutil.rmtree(staging)
    staging.mkdir(parents=True)

    (staging / "FIRM.bin.enc").write_bytes(encrypted)
    (staging / "info.txt").write_text(info_txt, encoding="utf-8")
    (staging / "params.txt").write_text(params_txt, encoding="utf-8")
    (staging / "params.json").write_text(json.dumps(params_json, indent=2), encoding="utf-8")

    if output_zip.exists():
        output_zip.unlink()

    with zipfile.ZipFile(output_zip, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for name in ("FIRM.bin.enc", "info.txt", "params.txt", "params.json"):
            archive.write(staging / name, arcname=name)

    shutil.rmtree(staging)


def main() -> int:
    cache = ROOT / ".cache"
    cache.mkdir(parents=True, exist_ok=True)

    stock = cache / "stock-elite-mcu.bin"
    patched = cache / "elite-patched-mcu.bin"

    if not stock.exists():
        download(elite_mcu_url(), stock)

    repo = ensure_bw_patcher(cache)
    patch_firmware(repo, stock, patched)
    build_zip2(patched, OUTPUT_ZIP)

    print(f"Created {OUTPUT_ZIP} ({OUTPUT_ZIP.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
