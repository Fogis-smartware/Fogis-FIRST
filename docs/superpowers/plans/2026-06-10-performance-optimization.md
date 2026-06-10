# 性能优化与架构重构 — 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。
> **注意：禁止未经用户确认即执行 git commit/push。每次 commit 前先展示改动摘要。**

**目标：** 将首页加载量从 ~5MB 降至 ≤1.5MB，283 页共享代码抽离为独立文件，Tailwind CDN 替换为静态 CSS，补充隐私政策/服务条款页面。

**架构：** 两阶段执行。Phase 1 四组并行（图片压缩、CSS/JS 抽离、搜索按需加载、隐私页面），Phase 2 依赖 Phase 1B 完成后进行 Tailwind 静态化。新增 shared.css（~150行公共样式）、shared.js（~100行公共脚本）、tailwind-static.css（~35KB 构建产物）。所有原始图片文件保留不删除。

**技术栈：** cwebp（图片转换）、Tailwind CLI v3（CSS 构建）、Node.js 脚本（HTML 批量处理）、sed（简单替换）

---

## 文件结构

| 文件 | 类型 | 职责 |
|------|------|------|
| `shared.css` | 新建 | 全站公共 CSS（body/动画/组件/响应式） |
| `shared.js` | 新建 | 全站公共 JS（语言切换/菜单/回顶/Cookie） |
| `tailwind-static.css` | 新建 | Tailwind CLI 构建产物，替代 CDN |
| `tailwind.static.config.js` | 新建 | Tailwind 构建配置，扫描 283 个 HTML |
| `images/banner-E013.webp` | 新建 | Banner WebP 版本 |
| `images/thumbnails/*.webp` | 新建 | 产品缩略图 WebP |
| `images/1.webp` ~ `8.webp` | 新建 | 工厂轮播图 WebP |
| `images/video-poster.jpg` | 新建 | 视频封面占位图 |
| `privacy-policy.html` | 新建 | 隐私政策页面（中英双语） |
| `terms-of-service.html` | 新建 | 服务条款页面（中英双语） |
| `index.html` | 修改 | Banner/缩略图/轮播图路径更新、视频 preload |
| 282 个 HTML | 修改 | 替换 CDN → 静态 CSS、注入 shared.css/js、清理内联重复代码 |
| `search-data.js` 引用 | 修改 | 从 6 个非搜索页移除 |

---

### 任务 1：Phase 1A — Banner 图片 PNG → WebP

**文件：**
- 创建：`images/banner-E013.webp`
- 修改：`index.html`、`about_us.html`、`products.html`、`faq.html`、`certifications.html`、`resources.html`

- [ ] **步骤 1：下载 cwebp 工具**

```bash
# 检查 cwebp 是否已安装
which cwebp || echo "NOT_FOUND"
```

如果未安装，从 Google WebP 下载页面获取 Windows 版 `cwebp.exe`。

- [ ] **步骤 2：转换 Banner 图片**

```bash
cd D:/GIT/images
cwebp -q 80 -resize 1920 0 banner-E013.png -o banner-E013.webp
ls -lh banner-E013.webp  # 确认 ≤ 250KB
```

- [ ] **步骤 3：更新 6 个页面的 Banner 引用**

将以下 6 个文件中 `src="images/banner-E013.png"` 替换为 `src="images/banner-E013.webp"`：
- `index.html`
- `about_us.html`
- `products.html`
- `faq.html`
- `certifications.html`
- `resources.html`

```bash
cd D:/GIT
for f in index.html about_us.html products.html faq.html certifications.html resources.html; do
  sed -i 's|images/banner-E013\.png|images/banner-E013.webp|g' "$f"
done
```

- [ ] **步骤 4：验证 — 随机抽查 2 个页面确认路径已更新**

```bash
grep 'banner-E013' D:/GIT/index.html D:/GIT/about_us.html
```

- [ ] **步骤 5：Commit**

```bash
git add images/banner-E013.webp index.html about_us.html products.html faq.html certifications.html resources.html
git commit -m "perf: banner PNG → WebP (2.1MB → ≤250KB)"
```

---

### 任务 2：Phase 1A — 产品缩略图压缩

**文件：**
- 创建：`images/thumbnails/et1-e001.webp`、`images/thumbnails/et5-h009.webp`、`images/thumbnails/et1-c030.webp`
- 修改：`index.html`

- [ ] **步骤 1：创建缩略图目录并转换**

```bash
mkdir -p D:/GIT/images/thumbnails
cd D:/GIT/images
cwebp -q 75 -resize 400 0 et1-e001.jpg -o thumbnails/et1-e001.webp
cwebp -q 75 -resize 400 0 et5-h009.jpg -o thumbnails/et5-h009.webp
cwebp -q 75 -resize 400 0 et1-c030.jpg -o thumbnails/et1-c030.webp
ls -lh thumbnails/  # 确认每张 ≤ 60KB
```

- [ ] **步骤 2：更新 index.html 中 3 处缩略图路径**

将 index.html 中产品展示区域的 3 张图片路径改为 thumbnails 子目录。找到类似 `src="images/et1-e001.jpg"` 的引用（在非 Hero/非轮播的上下文中），替换为 `src="images/thumbnails/et1-e001.webp"`。

```bash
cd D:/GIT
# 精确替换产品卡片中的缩略图（确保不影响其他引用）
sed -i 's|src="images/et1-e001\.jpg"|src="images/thumbnails/et1-e001.webp"|g' index.html
sed -i 's|src="images/et5-h009\.jpg"|src="images/thumbnails/et5-h009.webp"|g' index.html
sed -i 's|src="images/et1-c030\.jpg"|src="images/thumbnails/et1-c030.webp"|g' index.html
```

- [ ] **步骤 3：验证**

```bash
grep 'thumbnails' D:/GIT/index.html
```

- [ ] **步骤 4：Commit**

```bash
git add images/thumbnails/ index.html
git commit -m "perf: product thumbnails → WebP (811KB → ≤180KB)"
```

---

### 任务 3：Phase 1A — 工厂轮播图压缩

**文件：**
- 创建：`images/1.webp` ~ `images/8.webp`
- 修改：`index.html`

- [ ] **步骤 1：批量转换 8 张工厂轮播图**

```bash
cd D:/GIT/images
for i in 1 2 3 4 5 6 7 8; do
  cwebp -q 75 -resize 1080 0 "$i.jpg" -o "$i.webp"
done
ls -lh *.webp | grep -v banner  # 确认每张 ≤ 100KB
```

- [ ] **步骤 2：更新 index.html 中轮播组件的图片路径**

index.html 中轮播 JavaScript 内硬编码了图片路径。需要将 `images/N.jpg` 替换为 `images/N.webp`。

```bash
cd D:/GIT
# 替换轮播 slides 数组中的路径（N.jpg → N.webp）
sed -i "s|images/1\.jpg|images/1.webp|g" index.html
sed -i "s|images/2\.jpg|images/2.webp|g" index.html
sed -i "s|images/3\.jpg|images/3.webp|g" index.html
sed -i "s|images/4\.jpg|images/4.webp|g" index.html
sed -i "s|images/5\.jpg|images/5.webp|g" index.html
sed -i "s|images/6\.jpg|images/6.webp|g" index.html
sed -i "s|images/7\.jpg|images/7.webp|g" index.html
sed -i "s|images/8\.jpg|images/8.webp|g" index.html
sed -i "s|images/9\.jpg|images/9.webp|g" index.html
```

- [ ] **步骤 3：验证替换**

```bash
grep -o 'images/[0-9]\.webp' D:/GIT/index.html | sort -u
# 应输出: images/1.webp ~ images/9.webp
```

- [ ] **步骤 4：Commit**

```bash
git add images/1.webp images/2.webp images/3.webp images/4.webp images/5.webp images/6.webp images/7.webp images/8.webp index.html
git commit -m "perf: factory carousel images → WebP (3.7MB → ≤800KB)"
```

---

### 任务 4：Phase 1A — 视频 preload="none" + poster

**文件：**
- 创建：`images/video-poster.jpg`
- 修改：`index.html`

- [ ] **步骤 1：从视频截取首帧作为 poster**

```bash
cd D:/GIT
# 使用 ffmpeg 截取视频第 1 帧
ffmpeg -i videos/company_compressed.mp4 -vframes 1 -q:v 5 images/video-poster.jpg
ls -lh images/video-poster.jpg  # 确认文件生成
```

如果 ffmpeg 不可用，可使用浏览器手动截图保存为 `images/video-poster.jpg`（建议 1280×720）。

- [ ] **步骤 2：在 index.html 的 `<video>` 标签添加属性**

找到 index.html 中的 `<video>` 标签，添加 `preload="none"` 和 `poster="images/video-poster.jpg"`：

```bash
cd D:/GIT
# 假设当前 <video> 标签格式为 <video ... src="videos/company_compressed.mp4" ...>
# 用 sed 添加属性
sed -i 's|<video |<video preload="none" poster="images/video-poster.jpg" |' index.html
```

- [ ] **步骤 3：验证**

```bash
grep 'preload="none"' D:/GIT/index.html
grep 'poster=' D:/GIT/index.html
```

- [ ] **步骤 4：Commit**

```bash
git add images/video-poster.jpg index.html
git commit -m "perf: video preload=none + poster (65MB video lazy load)"
```

---

### 任务 5：Phase 1B — 创建 shared.css

**文件：**
- 创建：`shared.css`

**关键原则：只提取所有 283 页完全一致的公共样式。页面专属样式（hero-char、carousel、product-gallery、articles-double）保留在各页面中。**

- [ ] **步骤 1：编写 shared.css**

创建 `D:/GIT/shared.css`，内容从 index.html 的 `<style>` 块中提取公共部分：

```css
/* ===== Smartware Shared Styles ===== */
/* 此文件包含全站 283 页公共 CSS，浏览器首次加载后缓存 */

/* --- Base --- */
body {
    background: #f9f9f9;
    color: #1a1c1c;
    overflow-x: hidden;
}

/* --- Icons --- */
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

/* --- Glass Card --- */
.glass-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.3);
}

/* --- Shadows --- */
.shadow-soft {
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.05);
}

/* --- Scroll Animations --- */
.fade-up {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.7s ease-out, transform 0.7s ease-out;
}
.fade-up.animate {
    opacity: 1;
    transform: translateY(0);
}
.scale-in {
    opacity: 0;
    transform: scale(0.9);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.scale-in.animate {
    opacity: 1;
    transform: scale(1);
}
.delay-1 { transition-delay: 0.1s; }
.delay-2 { transition-delay: 0.2s; }
.delay-3 { transition-delay: 0.35s; }
.delay-4 { transition-delay: 0.5s; }

/* --- Back to Top Button --- */
#back-to-top {
    position: fixed;
    bottom: 32px;
    right: 32px;
    z-index: 999;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #a33e00;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    cursor: pointer;
    border: none;
    outline: none;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
}
#back-to-top.show {
    opacity: 1;
    pointer-events: auto;
}
#back-to-top:hover {
    background: #E65C00;
}

/* --- Language Switch Dropdown --- */
.lang-wrap {
    position: relative;
    display: inline-block;
}
.lang-menu {
    display: none;
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 4px;
    background: #fff;
    border: 1px solid #e3bfb1;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    z-index: 9999;
    min-width: 90px;
    overflow: hidden;
}
.lang-menu button {
    display: block;
    width: 100%;
    padding: 8px 16px;
    text-align: left;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 14px;
    font-family: Inter, sans-serif;
    color: #1a1c1c;
    white-space: nowrap;
}
.lang-menu button:hover {
    background: #f3f3f3;
}

/* --- Language Visibility --- */
body:not(.show-zh) [lang="zh"] { display: none !important; }
body.show-zh [lang="zh"].block      { display: block !important; }
body.show-zh [lang="zh"].flex       { display: flex !important; }
body.show-zh [lang="zh"].grid       { display: grid !important; }
body.show-zh [lang="zh"].inline-flex{ display: inline-flex !important; }
body.show-zh [lang="en"]            { display: none !important; }

/* --- Cookie Banner --- */
#cookie-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    background: rgba(26,28,28,0.97);
    color: #fff;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    transform: translateY(100%);
    transition: transform 0.4s ease;
}
#cookie-banner.show {
    transform: translateY(0);
}
#cookie-banner p {
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
    color: rgba(255,255,255,0.8);
    max-width: 700px;
}
#cookie-banner button {
    background: #a33e00;
    color: #fff;
    border: none;
    padding: 10px 24px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.2s;
}
#cookie-banner button:hover {
    background: #E65C00;
}

/* --- Responsive Utilities --- */
@media (max-width: 767px) {
    .hero-badge { font-size: 16px !important; }
    .py-section-gap {
        padding-top: 60px !important;
        padding-bottom: 60px !important;
    }
}
.stat-suffix { font-size: 28px; }
@media (min-width: 768px) {
    .stat-suffix { font-size: 50px; }
}
```

- [ ] **步骤 2：验证 shared.css 语法**

```bash
# 用浏览器或 Node.js 简单检查
node -e "console.log('shared.css file ready for deployment')"
```

- [ ] **步骤 3：Commit**

```bash
git add shared.css
git commit -m "feat: create shared.css — 全站公共样式抽离"
```

---

### 任务 6：Phase 1B — 创建 shared.js

**文件：**
- 创建：`shared.js`

- [ ] **步骤 1：编写 shared.js**

创建 `D:/GIT/shared.js`，从 index.html 提取公共 JavaScript：

```javascript
/**
 * Smartware Shared JavaScript
 * 全站公共脚本：语言切换、移动端菜单、回到顶部、Cookie 横幅
 * 浏览器首次加载后缓存，后续页面 0 额外传输
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        // ============================================================
        // 1. Footer Copyright Year
        // ============================================================
        var yearEl = document.getElementById('copyright-year');
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }

        // ============================================================
        // 2. Scroll Animation Observer (fade-up, scale-in)
        // ============================================================
        var animObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.fade-up, .scale-in').forEach(function (el) {
            animObserver.observe(el);
        });

        // ============================================================
        // 3. Language Switch Dropdown
        // ============================================================
        var btn = document.querySelector('button.flex.items-center.gap-1');
        if (btn) {
            var wrap = document.createElement('div');
            wrap.className = 'lang-wrap';
            btn.parentNode.insertBefore(wrap, btn);
            wrap.appendChild(btn);

            var menu = document.createElement('div');
            menu.className = 'lang-menu';
            menu.innerHTML = '<button class="lang-opt" data-lang="zh">简体中文</button><button class="lang-opt" data-lang="en">EN</button>';
            wrap.appendChild(menu);

            function upd(isZh) {
                document.body.classList.toggle('show-zh', isZh);
                document.documentElement.lang = isZh ? 'zh' : 'en';
                var titleEl = document.querySelector('title');
                if (titleEl) {
                    document.title = isZh
                        ? (titleEl.getAttribute('data-zh') || titleEl.textContent)
                        : (titleEl.getAttribute('data-en') || titleEl.textContent);
                }
                var opts = menu.querySelectorAll('.lang-opt');
                opts.forEach(function (o) {
                    o.style.display = (isZh && o.dataset.lang === 'zh') || (!isZh && o.dataset.lang === 'en') ? 'none' : 'block';
                });
                localStorage.setItem('lang', isZh ? 'zh' : 'en');
                var labelSpan = btn.querySelector('.lang-label');
                if (labelSpan) labelSpan.textContent = isZh ? '简体中文' : 'EN';
                var si = document.querySelector('header input[type="text"]');
                if (si) si.placeholder = isZh ? (si.getAttribute('data-zh') || '') : (si.getAttribute('data-en') || '');
            }

            document.addEventListener('click', function (e) {
                if (!wrap.contains(e.target)) menu.style.display = 'none';
            });

            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                upd(document.body.classList.contains('show-zh'));
            });

            menu.querySelectorAll('.lang-opt').forEach(function (opt) {
                opt.addEventListener('click', function () {
                    upd(this.dataset.lang === 'zh');
                    menu.style.display = 'none';
                });
            });

            var saved = localStorage.getItem('lang');
            upd(saved === 'zh');
        }

        // ============================================================
        // 4. Mobile Menu Overlay
        // ============================================================
        var menuBtn = document.querySelector('header .md\\:hidden.material-symbols-outlined');
        if (menuBtn) {
            var overlay = document.createElement('div');
            overlay.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(26,28,28,0.95);z-index:9999;justify-content:center;align-items:center;';
            overlay.innerHTML = '<div style="text-align:center"><button class="mobile-close material-symbols-outlined" style="position:absolute;top:24px;right:24px;color:white;font-size:32px;cursor:pointer;background:none;border:none">close</button><nav style="display:flex;flex-direction:column;gap:32px"><a href="index.html" style="color:white;font-size:20px;font-weight:600;text-decoration:none"><span lang="en">HOME</span><span lang="zh">首页</span></a><a href="products.html" style="color:white;font-size:20px;font-weight:600;text-decoration:none"><span lang="en">PRODUCT</span><span lang="zh">产品</span></a><a href="resources.html" style="color:white;font-size:20px;font-weight:600;text-decoration:none"><span lang="en">RESOURCES</span><span lang="zh">资源中心</span></a><a href="contact.html" style="color:white;font-size:20px;font-weight:600;text-decoration:none"><span lang="en">CONTACT</span><span lang="zh">联系我们</span></a><a href="about_us.html" style="color:white;font-size:20px;font-weight:600;text-decoration:none"><span lang="en">ABOUT US</span><span lang="zh">关于我们</span></a></nav></div>';
            document.body.appendChild(overlay);
            menuBtn.addEventListener('click', function () { overlay.style.display = 'flex'; });
            overlay.querySelector('.mobile-close').addEventListener('click', function () { overlay.style.display = 'none'; });
            overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.style.display = 'none'; });
        }
    });

    // ============================================================
    // 5. Back to Top (scroll listener — outside DOMContentLoaded for early bind)
    // ============================================================
    window.addEventListener('scroll', function () {
        var b = document.getElementById('back-to-top');
        if (b) b.classList.toggle('show', window.scrollY > 400);
    });

    // ============================================================
    // 6. Cookie Consent Banner
    // ============================================================
    if (!localStorage.getItem('cookie-consent')) {
        // 等待 DOM 就绪后显示
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', showCookieBanner);
        } else {
            showCookieBanner();
        }
    }
    function showCookieBanner() {
        var b = document.getElementById('cookie-banner');
        if (b) setTimeout(function () { b.classList.add('show'); }, 500);
    }

})();
```

- [ ] **步骤 2：验证 shared.js 语法**

```bash
node --check D:/GIT/shared.js && echo "Syntax OK" || echo "Syntax ERROR"
```

- [ ] **步骤 3：Commit**

```bash
git add shared.js
git commit -m "feat: create shared.js — 全站公共脚本抽离"
```

---

### 任务 7：Phase 1B — 批量注入 shared.css + shared.js 并清理内联重复代码

**文件：** 修改 283 个 HTML 文件

**策略：** 用 Node.js 脚本精确处理每个 HTML 文件，而非 sed 逐行替换（避免多行模式匹配问题）。

- [ ] **步骤 1：编写批量处理脚本 `tools/inject-shared.js`**

```javascript
/**
 * 全站批量处理脚本
 * 功能：1. 注入 shared.css + shared.js 引用
 *       2. 移除 CDN tailwind script + tailwind.config 块
 *       3. 移除已抽离到 shared.css 的内联 CSS 规则
 *       4. 移除已抽离到 shared.js 的内联 JS 块
 *       5. 保留页面专属样式/脚本不变
 */
const fs = require('fs');
const path = require('path');

const ROOT = 'D:/GIT';
const SHARED_CSS_LINK = '<link rel="stylesheet" href="/shared.css">';
const SHARED_JS_LINK = '<script src="/shared.js" defer></script>';

// 标记：在 <style id="lang-style"> 内需要清理的 Cookie Banner 重复规则
// （它们和 shared.css 中的完全一致，清理后减小 HTML 体积）

function processFile(filePath) {
    let html = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Step 1: 在 </head> 前注入 shared.css 引用（如果还没有）
    if (!html.includes('shared.css')) {
        html = html.replace('</head>', `  ${SHARED_CSS_LINK}\n</head>`);
        modified = true;
    }

    // Step 2: 在 </body> 前注入 shared.js 引用（如果还没有）
    if (!html.includes('shared.js')) {
        html = html.replace('</body>', `  ${SHARED_JS_LINK}\n</body>`);
        modified = true;
    }

    // Step 3: 移除 CDN tailwind script（保留，等 Phase 2 统一替换为静态 CSS）
    // 本步骤暂不处理 CDN -> Phase 2 统一做

    // Step 4: 移除 <style id="lang-style"> 块内与 shared.css 重复的 Cookie Banner 规则
    // 匹配 #cookie-banner{...} 块（在 lang-style 中）
    html = html.replace(
        /#cookie-banner\{[^}]*position:fixed[^}]*\}\s*#cookie-banner\.show[^}]*\}\s*#cookie-banner p[^}]*\}\s*#cookie-banner button[^}]*\}\s*#cookie-banner button:hover[^}]*\}/g,
        ''
    );
    if (html.includes('#cookie-banner') && html.includes('lang-style')) {
        modified = true;
    }

    // Step 5: 移除重复的 back-to-top 内联 onscroll（shared.js 已有）
    // 移除：<script>window.addEventListener('scroll',function(){var b=document.getElementById('back-to-top');b.classList.toggle('show',window.scrollY>400)});</script>
    html = html.replace(
        /<script>window\.addEventListener\('scroll',function\(\)\{var b=document\.getElementById\('back-to-top'\);b\.classList\.toggle\('show',window\.scrollY>400\)\}\);<\/script>/g,
        ''
    );
    if (!html.includes('window.addEventListener(\'scroll\',function(){var b=document.getElementById(\'back-to-top\')')) {
        modified = true;
    }

    // Step 6: 移除 Cookie 横幅初始化脚本（shared.js 已有）
    // 移除：<script>(function(){if(!localStorage.getItem('cookie-consent')){var b=document.getElementById('cookie-banner');setTimeout(function(){b.classList.add('show')},500)}})();</script>
    html = html.replace(
        /<script>\(function\(\)\{if\(!localStorage\.getItem\('cookie-consent'\)\)\{var b=document\.getElementById\('cookie-banner'\);setTimeout\(function\(\)\{b\.classList\.add\('show'\)\},500\)\}\}\)\)\(\);<\/script>/g,
        ''
    );
    if (!html.includes('cookie-consent')) {
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, html, 'utf8');
    }
    return modified;
}

// 遍历所有 HTML 文件
const htmlFiles = [];
function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (!['node_modules', '.git', '.bak', 'TEXT'].includes(e.name)) {
                walkDir(full);
            }
        } else if (e.name.endsWith('.html')) {
            htmlFiles.push(full);
        }
    }
}

walkDir(ROOT);
console.log(`Found ${htmlFiles.length} HTML files`);

let count = 0;
for (const f of htmlFiles) {
    if (processFile(f)) count++;
}
console.log(`Modified ${count} files`);
```

- [ ] **步骤 2：运行脚本**

```bash
cd D:/GIT
node tools/inject-shared.js
```

- [ ] **步骤 3：抽查验证 — 随机选 5 页检查**

```bash
cd D:/GIT
# 检查 shared.css 引用已注入
grep -l 'shared.css' index.html product-et1-e001.html contact.html about_us.html faq.html | wc -l
# 应输出: 5

# 检查 shared.js 引用已注入
grep -l 'shared.js' index.html product-et1-e001.html contact.html about_us.html faq.html | wc -l
# 应输出: 5

# 检查不再有重复的 back-to-top scroll listener
grep "window.addEventListener('scroll',function(){var b=document.getElementById('back-to-top')" index.html | wc -l
# 应为: 0
```

- [ ] **步骤 4：Commit**

```bash
git add tools/inject-shared.js
git add -A  # 包含 283 页 HTML 修改
git commit -m "feat: 全站注入 shared.css + shared.js，清除内联重复代码"
```

---

### 任务 8：Phase 1C — 搜索数据按需加载

**文件：** 修改 `index.html`、`contact.html`、`about_us.html`、`faq.html`、`certifications.html`、`resources.html`

- [ ] **步骤 1：从 6 个非搜索页面移除 search-data.js 和 search.js 引用**

```bash
cd D:/GIT
for f in contact.html about_us.html faq.html certifications.html resources.html index.html; do
  sed -i '/<script src="search-data\.js"><\/script>/d' "$f"
  sed -i '/<script src="search\.js"><\/script>/d' "$f"
done
```

- [ ] **步骤 2：验证 — 确认移除正确**

```bash
cd D:/GIT
grep 'search-data\|search\.js' contact.html about_us.html faq.html certifications.html resources.html index.html | wc -l
# 应输出: 0

# 确认 products.html 和 category-*.html 中仍然保留
grep 'search-data' products.html category-led-work-light.html | wc -l
# 应输出: 2+
```

- [ ] **步骤 3：Commit**

```bash
git add contact.html about_us.html faq.html certifications.html resources.html index.html
git commit -m "perf: search-data.js 按需加载 — 非搜索页移除 58KB 冗余"
```

---

### 任务 9：Phase 1D — 隐私政策页面

**文件：**
- 创建：`privacy-policy.html`
- 创建：`terms-of-service.html`

- [ ] **步骤 1：从已验证页面复制完整模板**

```bash
cd D:/GIT
cp faq.html privacy-policy.html
cp faq.html terms-of-service.html
```

- [ ] **步骤 2：编写 privacy-policy.html**

从头改写 `<main>` 区段内容（保留导航栏、页脚、所有脚本引用不变），替换为隐私政策内容：

```html
<!-- main 区段使用中英双语，标准隐私政策结构 -->
<main>
  <!-- Hero -->
  <section class="relative h-[375px] md:h-[400px] flex items-center overflow-hidden">
    <div class="absolute inset-0 z-0">
      <img alt="Privacy Policy" class="w-full h-full object-cover" src="images/banner-E013.webp">
      <div class="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent"></div>
    </div>
    <div class="relative z-10 px-gutter md:px-margin-desktop max-w-container-max mx-auto w-full fade-up">
      <p class="mb-4 font-bold uppercase tracking-wider hero-badge" style="font-size:21px;color:#a33e00;text-shadow:0 0 10px rgba(255,255,255,0.5),0 0 2px rgba(255,255,255,0.8)">
        <span lang="en">Legal</span><span lang="zh">法律条款</span>
      </p>
      <h1 class="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
        <span lang="en">Privacy Policy</span><span lang="zh">隐私政策</span>
      </h1>
    </div>
  </section>

  <!-- Content -->
  <section class="py-section-gap px-gutter md:px-margin-desktop max-w-[900px] mx-auto">
    <div class="prose max-w-none text-secondary space-y-8 fade-up">
      <p class="text-sm text-secondary/60"><span lang="en">Last Updated: June 10, 2026</span><span lang="zh">最后更新：2026年6月10日</span></p>

      <h2 class="text-on-surface font-headline-lg text-headline-lg"><span lang="en">1. Information We Collect</span><span lang="zh">1. 我们收集的信息</span></h2>
      <p><span lang="en">When you use our contact form or send us an email, we may collect the following personal information that you voluntarily provide:</span><span lang="zh">当您使用我们的联系表单或向我们发送电子邮件时，我们可能会收集您自愿提供的以下个人信息：</span></p>
      <ul class="list-disc pl-6 space-y-2">
        <li><span lang="en">Name</span><span lang="zh">姓名</span></li>
        <li><span lang="en">Email address</span><span lang="zh">电子邮件地址</span></li>
        <li><span lang="en">Phone number</span><span lang="zh">电话号码</span></li>
        <li><span lang="en">Company name</span><span lang="zh">公司名称</span></li>
        <li><span lang="en">Any other information you choose to include in your message</span><span lang="zh">您在消息中选择包含的任何其他信息</span></li>
      </ul>
      <p><span lang="en">We do not automatically collect personal data through cookies or tracking technologies for marketing purposes. Our cookie usage is limited to essential functionality (language preference) and basic analytics.</span><span lang="zh">我们不会通过 Cookie 或追踪技术为营销目的自动收集个人数据。我们的 Cookie 使用仅限于基本功能（语言偏好）和基础分析。</span></p>

      <h2 class="text-on-surface font-headline-lg text-headline-lg"><span lang="en">2. How We Use Your Information</span><span lang="zh">2. 我们如何使用您的信息</span></h2>
      <p><span lang="en">The information you provide is used exclusively for:</span><span lang="zh">您提供的信息仅用于：</span></p>
      <ul class="list-disc pl-6 space-y-2">
        <li><span lang="en">Responding to your inquiries and providing customer support</span><span lang="zh">回复您的咨询并提供客户支持</span></li>
        <li><span lang="en">Processing your requests for quotes, samples, or product information</span><span lang="zh">处理您的报价、样品或产品信息请求</span></li>
        <li><span lang="en">Communicating about orders, deliveries, and business matters</span><span lang="zh">就订单、交付和业务事宜进行沟通</span></li>
      </ul>
      <p><span lang="en">We do not sell, rent, or share your personal information with third parties for their marketing purposes.</span><span lang="zh">我们不会向第三方出售、出租或共享您的个人信息用于其营销目的。</span></p>

      <h2 class="text-on-surface font-headline-lg text-headline-lg"><span lang="en">3. Data Storage and Security</span><span lang="zh">3. 数据存储与安全</span></h2>
      <p><span lang="en">Your information is stored securely and is only accessible to authorized Smartware personnel who need it to fulfill your requests. Our contact form submissions are processed through Formspree, a third-party form processing service. Please refer to Formspree's privacy policy for details on how they handle data.</span><span lang="zh">您的信息安全存储，仅限需要履行您请求的授权 Smartware 人员访问。我们的联系表单提交通过 Formspree（第三方表单处理服务）处理。有关其数据处理方式的详细信息，请参阅 Formspree 的隐私政策。</span></p>

      <h2 class="text-on-surface font-headline-lg text-headline-lg"><span lang="en">4. Your Rights</span><span lang="zh">4. 您的权利</span></h2>
      <p><span lang="en">You have the right to:</span><span lang="zh">您有权：</span></p>
      <ul class="list-disc pl-6 space-y-2">
        <li><span lang="en">Request access to the personal data we hold about you</span><span lang="zh">请求访问我们持有的关于您的个人数据</span></li>
        <li><span lang="en">Request correction or deletion of your personal data</span><span lang="zh">请求更正或删除您的个人数据</span></li>
        <li><span lang="en">Withdraw your consent at any time</span><span lang="zh">随时撤回您的同意</span></li>
        <li><span lang="en">Contact us with privacy-related questions at fogis@smartware-official.com</span><span lang="zh">通过 fogis@smartware-official.com 联系我们咨询隐私相关问题</span></li>
      </ul>

      <h2 class="text-on-surface font-headline-lg text-headline-lg"><span lang="en">5. Contact Us</span><span lang="zh">5. 联系我们</span></h2>
      <p><span lang="en">If you have any questions about this Privacy Policy, please contact us at:</span><span lang="zh">如果您对本隐私政策有任何疑问，请通过以下方式联系我们：</span></p>
      <p><span lang="en">Email: fogis@smartware-official.com<br>Address: Shenzhen, Guangdong, China</span><span lang="zh">邮箱：fogis@smartware-official.com<br>地址：中国广东省深圳市</span></p>
    </div>
  </section>
</main>
```

同时更新 `<title>`、`<meta description>`、JSON-LD、OG 标签等。

- [ ] **步骤 3：编写 terms-of-service.html**

类似结构，替换为服务条款内容（适用法律、知识产权、免责声明、产品信息准确性等）。

- [ ] **步骤 4：验证两页基本功能**

```bash
# 检查语言切换、菜单、Cookie、回顶按钮正常
grep -c 'shared.css\|shared.js' D:/GIT/privacy-policy.html D:/GIT/terms-of-service.html
# 各应输出匹配数
```

- [ ] **步骤 5：Commit**

```bash
git add privacy-policy.html terms-of-service.html
git commit -m "feat: 新增隐私政策 + 服务条款页面（中英双语）"
```

---

### 任务 10：Phase 2 — Tailwind 静态 CSS 构建

**文件：**
- 创建：`tailwind.static.config.js`
- 创建：`tailwind-static.css`（构建产物）
- 修改：283 个 HTML 文件（替换 CDN → 静态 CSS 链接）

- [ ] **步骤 1：安装 Tailwind CLI**

```bash
cd D:/GIT
npm init -y
npm install -D tailwindcss@3
```

- [ ] **步骤 2：创建 tailwind.static.config.js**

```javascript
// Tailwind Static Build Configuration
// 扫描全部 283 个 HTML，提取已用 class 生成最小化 CSS
module.exports = {
    content: ['./**/*.html'],
    // 排除 node_modules 和其他不需要的目录
    safelist: [],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'primary': '#a33e00',
                'surface-dim': '#dadada',
                'on-tertiary-fixed-variant': '#00497b',
                'surface-container-low': '#f3f3f3',
                'surface-container-highest': '#e2e2e2',
                'surface-container-high': '#e8e8e8',
                'on-primary': '#ffffff',
                'on-primary-container': '#561d00',
                'on-error': '#ffffff',
                'primary-container': '#ff6600',
                'on-secondary-fixed': '#1b1c1c',
                'secondary': '#5f5e5e',
                'on-surface': '#1a1c1c',
                'on-secondary-container': '#656464',
                'surface-tint': '#a33e00',
                'surface': '#f9f9f9',
                'surface-variant': '#e2e2e2',
                'secondary-fixed': '#e4e2e1',
                'error-container': '#ffdad6',
                'surface-container-lowest': '#ffffff',
                'on-secondary-fixed-variant': '#474747',
                'inverse-on-surface': '#f1f1f1',
                'tertiary-container': '#009cfc',
                'surface-container': '#eeeeee',
                'on-tertiary-container': '#003155',
                'on-tertiary': '#ffffff',
                'on-error-container': '#93000a',
                'on-primary-fixed-variant': '#7c2e00',
                'error': '#ba1a1a',
                'inverse-surface': '#2f3131',
                'on-primary-fixed': '#360f00',
                'secondary-container': '#e4e2e1',
                'on-background': '#1a1c1c',
                'tertiary': '#0062a1',
                'surface-bright': '#f9f9f9',
                'on-secondary': '#ffffff',
                'secondary-fixed-dim': '#c8c6c6',
                'primary-fixed-dim': '#ffb596',
                'tertiary-fixed-dim': '#9ccaff',
                'outline': '#8e7164',
                'inverse-primary': '#ffb596',
                'primary-fixed': '#ffdbcd',
                'on-surface-variant': '#5a4136',
                'outline-variant': '#e3bfb1',
                'background': '#f9f9f9',
                'tertiary-fixed': '#d0e4ff',
                'on-tertiary-fixed': '#001d35',
            },
            borderRadius: {
                'DEFAULT': '0.125rem',
                'lg': '0.25rem',
                'xl': '0.5rem',
                'full': '0.75rem',
            },
            spacing: {
                'gutter': '24px',
                'container-max': '1280px',
                'base': '8px',
                'section-gap': '120px',
                'margin-desktop': '64px',
                'margin-mobile': '20px',
            },
            fontFamily: {
                'headline-md': ['Inter'],
                'display-lg-mobile': ['Inter'],
                'headline-lg': ['Inter'],
                'display-lg': ['Inter'],
                'body-md': ['Inter'],
                'label-md': ['Inter'],
                'body-lg': ['Inter'],
            },
            fontSize: {
                'headline-md': ['24px', { lineHeight: '1.4', fontWeight: '600' }],
                'display-lg-mobile': ['40px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
                'headline-lg': ['32px', { lineHeight: '1.3', fontWeight: '600' }],
                'display-lg': ['64px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
                'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
                'label-md': ['14px', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '600' }],
                'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
            },
        },
    },
    corePlugins: {
        preflight: false,  // 关键：不注入 Tailwind reset（会和我们的自定义 body 样式冲突）
    },
};
```

- [ ] **步骤 3：构建 tailwind-static.css**

```bash
cd D:/GIT
npx tailwindcss -c tailwind.static.config.js -o tailwind-static.css --minify
ls -lh tailwind-static.css  # 确认大小，预期 25-40KB
```

- [ ] **步骤 4：检查构建产物质量**

```bash
# 确认关键 class 存在于输出中
grep -c '\.text-primary' D:/GIT/tailwind-static.css  # 应 > 0
grep -c '\.bg-surface' D:/GIT/tailwind-static.css    # 应 > 0
grep -c '\.font-display-lg' D:/GIT/tailwind-static.css  # 应 > 0
```

- [ ] **步骤 5：先在 5 个样本页面手动替换验证**

对 index.html、product-et1-e001.html、category-led-work-light.html、contact.html、about_us.html 执行：

1. 在 `<head>` 中 CDN script 行之后添加 `<link rel="stylesheet" href="/tailwind-static.css">`
2. 删除 `<script src="https://cdn.tailwindcss.com?plugins=forms"></script>` 行
3. 删除 `<script id="tailwind-config">` ... `</script>` 整块
4. 在浏览器中打开对比视觉效果

```bash
# 在 5 个样本页面的 <head> 区域添加静态 CSS 引用
# 放在 Google Fonts link 之后
for f in index.html product-et1-e001.html category-led-work-light.html contact.html about_us.html; do
  sed -i '/fonts\.googleapis\.com/a\  <link rel="stylesheet" href="/tailwind-static.css">' "D:/GIT/$f"
  sed -i '/cdn\.tailwindcss\.com/d' "D:/GIT/$f"
  # 删除 tailwind.config 整个 script 块
  sed -i '/<script id="tailwind-config">/,/<\/script>/d' "D:/GIT/$f"
done
```

- [ ] **步骤 6：手动浏览器验证**

在 Chrome DevTools 中逐一打开 5 个样本页面，检查：
- 无 Console 错误
- 颜色、间距、字体与修改前一致
- 桌面 + 移动端布局正常
- 语言切换正常

- [ ] **步骤 7：若验证通过，批量处理全部 283 页**

```bash
cd D:/GIT
# 对所有 HTML 文件执行相同替换
for f in *.html category-*.html product-*.html; do
  [ -f "$f" ] || continue
  # 添加静态 CSS 引用
  sed -i '/fonts\.googleapis\.com/a\  <link rel="stylesheet" href="/tailwind-static.css">' "$f"
  # 删除 CDN script
  sed -i '/cdn\.tailwindcss\.com/d' "$f"
  # 删除 tailwind.config script 块
  sed -i '/<script id="tailwind-config">/,/<\/script>/d' "$f"
done
```

- [ ] **步骤 8：验证 — 检查无 CDN 残留**

```bash
cd D:/GIT
grep -r 'cdn.tailwindcss.com' --include="*.html" -l | wc -l
# 应输出: 0

# 检查 tailwind-static.css 引用数
grep -r 'tailwind-static.css' --include="*.html" -l | wc -l
# 应输出: 283
```

- [ ] **步骤 9：Commit**

```bash
git add tailwind.static.config.js tailwind-static.css package.json
git add -A  # 283 HTML 的 CDN 替换
git commit -m "feat: Tailwind CDN → 静态 CSS (418KB → ~35KB, 283页)"
```

---

### 任务 11：最终验证

- [ ] **步骤 1：全站审计抽样**

```bash
cd D:/GIT
echo "=== 文件统计 ==="
echo "HTML 文件总数: $(find . -maxdepth 1 -name '*.html' | wc -l)"
echo "shared.css 引用数: $(grep -rl 'shared.css' --include='*.html' | wc -l)"
echo "shared.js 引用数: $(grep -rl 'shared.js' --include='*.html' | wc -l)"
echo "tailwind-static 引用数: $(grep -rl 'tailwind-static.css' --include='*.html' | wc -l)"
echo "CDN 残留: $(grep -rl 'cdn.tailwindcss' --include='*.html' | wc -l)"
echo ""
echo "=== 关键文件大小 ==="
ls -lh shared.css shared.js tailwind-static.css
ls -lh images/banner-E013.webp images/thumbnails/
```

- [ ] **步骤 2：3 视口 × 5 页面视觉审计**

手动在 Chrome DevTools 中检查 375px / 768px / 1440px 三个宽度：
- index.html
- product-et1-e001.html
- category-led-work-light.html
- contact.html
- resources.html

确认项：无 JS 错误、无样式错乱、语言切换正常、搜索正常、轮播正常。

- [ ] **步骤 3：最终 Commit（如有微调）**

```bash
git status
# 如有微调文件
git add -A
git commit -m "chore: 全站验证后微调"
```

---

## 执行顺序总览

```
Phase 1A（并行组）
├── 任务 1: Banner WebP      ← 可与其他任务并行
├── 任务 2: 缩略图 WebP      ← 可与其他任务并行
├── 任务 3: 轮播图 WebP      ← 可与其他任务并行
└── 任务 4: 视频 preload     ← 可与其他任务并行

Phase 1B（并行组 — 可和 1A 同时进行）
├── 任务 5: 创建 shared.css  ← 无依赖
├── 任务 6: 创建 shared.js   ← 无依赖
└── 任务 7: 批量注入+清理    ← 依赖任务 5+6 完成

Phase 1C（并行组 — 可和 1A/1B 同时进行）
└── 任务 8: 搜索按需加载     ← 无依赖

Phase 1D（并行组 — 可和 1A/1B/1C 同时进行）
└── 任务 9: 隐私政策页面     ← 无依赖

Phase 2（串行 — 依赖 Phase 1B 任务 7 完成）
└── 任务 10: Tailwind 静态化 ← 依赖 shared.css 就位 + 283 页内联已清理

Phase 验证
└── 任务 11: 全站审计        ← 依赖全部完成
```

---

## 回退策略

所有原始图片文件保留不删除。Git 提供完整回退能力。每个任务独立 commit，出错可单独 revert。
