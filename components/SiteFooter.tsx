"use client";

import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="sitefooter">
      <div className="container">
        {/* 4 列主网格 */}
        <div className="footer-grid">
          {/* 品牌列 */}
          <div className="footer-col footer-col--brand">
            <Link href="/" className="footer-logo" aria-label="Vibe Lab 首页">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/flasks/green_0.png"
                alt=""
                aria-hidden="true"
                width={32}
                height={32}
                className="footer-flask"
              />
              <span className="footer-logo-word">
                Vibe <em>Lab</em>
              </span>
            </Link>
            <p className="footer-tagline">
              给野路子 AI 玩家的资源门户 + 实战训练入口。
              <br />
              先上车，再上轨道。
            </p>
            <ul className="footer-social" aria-label="社交账号">
              <li>
                <a href="#" aria-label="微信公众号">
                  WeChat
                </a>
              </li>
              <li>
                <a href="#" aria-label="小红书">
                  小红书
                </a>
              </li>
              <li>
                <a href="#" aria-label="GitHub">
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* 产品列 */}
          <div className="footer-col">
            <h5 className="footer-h5 mono">产品</h5>
            <Link href="/tools">工具库</Link>
            <Link href="/tutorials">教程库</Link>
            <Link href="/courses">训练营</Link>
            <Link href="/about">关于 Vibe Lab</Link>
          </div>

          {/* 资源列 */}
          <div className="footer-col">
            <h5 className="footer-h5 mono">资源</h5>
            <Link href="/">首页</Link>
            <Link href="/contact">联系 · 咨询</Link>
            <a href="#announcements">站内公告</a>
            <a href="#" aria-disabled="true">
              RSS 订阅
            </a>
          </div>

          {/* 订阅列 */}
          <div className="footer-col footer-col--news">
            <h5 className="footer-h5 mono">有新东西就发邮件给你</h5>
            <form
              className="footer-news"
              onSubmit={(e) => e.preventDefault()}
              aria-label="邮件订阅"
            >
              <input type="email" placeholder="your@email.com" aria-label="邮箱" />
              <button type="submit" className="mono">
                订阅 →
              </button>
            </form>
            <p className="footer-news-note mono">
              月报 · 不卖课 · 退订随时
            </p>
          </div>
        </div>

        {/* 版权细字行 */}
        <div className="footer-bottom">
          <span>© 2026 Vibe Lab · 振动实验室</span>
          <span className="footer-links-extra">
            <a href="#">隐私</a>
            <i aria-hidden="true" />
            <a href="#">服务条款</a>
            <i aria-hidden="true" />
            <Link href="/contact">联系</Link>
          </span>
          <span className="mono">v0.1 · 逐页建设中</span>
        </div>
      </div>
    </footer>
  );
}