#!/usr/bin/env python3
"""
Lab 作品预览图采集脚本
=========================

遍历 Lab 当前所有作品的 `link`，按"智能优先真实产品 → README 兜底"策略截取预览图：
  - 访问 link → 等渲染 → 1440 viewport × 2x scale 截首屏 PNG (2880×1800)
  - 失败/超时 → 自动降级到对应 GitHub repo 的 README 区域

输出到 `public/assets/lab/covers/{work.id}.png`，与 `works.json` 的 thumb 字段对应。

依赖：
  pip install playwright
  playwright install chromium  # 一次性

环境：
  GITHUB_TOKEN / GH_TOKEN   可选，仅在私有仓库拉取时需要；脚本本身不需要 GitHub 凭据。
  HTTP_PROXY / HTTPS_PROXY  可选，必要时设代理（例如 http://127.0.0.1:7897）。
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

REPO_ROOT = Path(__file__).resolve().parent.parent
COVERS_DIR = REPO_ROOT / "public" / "assets" / "lab" / "covers"

VIEWPORT_W = 1440
VIEWPORT_H = 900
SCALE = 2


def github_repo_from_url(url: str) -> tuple[str, str] | None:
    """link 是 GitHub repo 时拆出 (owner, repo)，用于 README 兜底。"""
    m = re.match(r"^https?://github\.com/([^/]+)/([^/]+)/?$", url)
    if m:
        return m.group(1), m.group(2)
    return None


def fetch_works(repo_root: Path) -> list[dict]:
    """汇总 index.json + 各 creator 的 works.json。"""
    creators_path = repo_root / "creators" / "index.json"
    if not creators_path.exists():
        sys.exit(f"未找到 {creators_path}")
    idx = json.loads(creators_path.read_text())
    works: list[dict] = []
    for c in idx.get("creators", []):
        dir_name = c.get("dir") or c.get("handle")
        wf = repo_root / "creators" / dir_name / "works.json"
        if not wf.exists():
            print(f"[skip] {dir_name}/works.json 缺失", file=sys.stderr)
            continue
        for w in json.loads(wf.read_text()).get("works", []):
            w["_dir"] = dir_name
            w["_handle"] = c.get("handle", "")
            works.append(w)
    return works


def screenshot_for_work(page, work: dict, out_path: Path) -> tuple[str, int]:
    """为单条作品生成预览图，返回 (状态, 文件大小)。"""
    link = work.get("link", "").strip()
    if not link:
        return ("skip-empty-link", 0)

    out_path.parent.mkdir(parents=True, exist_ok=True)

    # 1. 直接访问 link（真实产品 / GitHub repo 首页都行）
    try:
        page.goto(link, wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(2500)
        # 把主要内容滚到视口顶部（去掉 GitHub nav 等）
        page.evaluate(
            """() => {
                const repo = document.querySelector('article.markdown-body, article, main');
                if (repo) repo.scrollIntoView({block:'start'});
                window.scrollBy(0, -60);
            }"""
        )
        page.wait_for_timeout(600)
        page.screenshot(path=str(out_path), full_page=False, type="png")
        size = out_path.stat().st_size
        return ("ok-link", size)
    except Exception as e:
        err_link = f"{type(e).__name__}: {e}"

    # 2. 兜底：截 GitHub README
    gh = github_repo_from_url(link)
    if gh:
        try:
            owner, repo = gh
            readme_url = f"https://github.com/{owner}/{repo}"
            page.goto(readme_url, wait_until="domcontentloaded", timeout=30000)
            page.wait_for_timeout(2500)
            el = page.query_selector("article.markdown-body") or page.query_selector("article")
            if el:
                el.scroll_into_view_if_needed()
                page.wait_for_timeout(600)
                el.screenshot(path=str(out_path), type="png")
            else:
                page.evaluate("window.scrollBy(0, -60);")
                page.wait_for_timeout(400)
                page.screenshot(path=str(out_path), full_page=False, type="png")
            return ("ok-readme", out_path.stat().st_size)
        except Exception as e2:
            return (f"fail-both ({err_link} | {e2})", 0)

    return (f"fail-link-only ({err_link})", 0)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", help="只处理指定 work.id（多次）", action="append")
    ap.add_argument("--proxy", help="覆盖代理，如 http://127.0.0.1:7897")
    args = ap.parse_args()

    from playwright.sync_api import sync_playwright  # 延迟到 argparse 之后，便于友好错误

    launch_args = []
    if args.proxy:
        launch_args.append(f"--proxy-server={args.proxy}")

    works = fetch_works(REPO_ROOT)
    if args.only:
        keep = set(args.only)
        works = [w for w in works if w.get("id") in keep]

    if not works:
        sys.exit("没有可处理的作品")

    COVERS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"待处理 {len(works)} 件作品 → {COVERS_DIR}")

    results = []
    with sync_playwright() as p:
        browser = p.chromium.launch(args=launch_args)
        ctx = browser.new_context(
            viewport={"width": VIEWPORT_W, "height": VIEWPORT_H},
            device_scale_factor=SCALE,
        )
        page = ctx.new_page()
        for w in works:
            out = COVERS_DIR / f'{w.get("id")}.png'
            status, size = screenshot_for_work(page, w, out)
            print(f"  {w.get('id'):40s} → {status:18s} {size//1024} KB")
            results.append((w.get("id"), status, size))
        browser.close()

    print("\n汇总:")
    ok = sum(1 for _, s, _ in results if s.startswith("ok"))
    print(f"  成功 {ok}/{len(results)}")
    sys.exit(0 if ok == len(results) else 1)


if __name__ == "__main__":
    main()