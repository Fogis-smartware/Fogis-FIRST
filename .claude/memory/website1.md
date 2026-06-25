# Smartware 官网项目进度

## 🎯 核心目标
**新网站 (smartware-official.com) 的使命是完全替代旧网站 (sst-smartware.com)**。
旧站建于 wds168.cn SaaS 平台，新站为手写静态 HTML，在品牌形象、SEO、双语能力上全面超越旧站。

## ⚠️ 重要备注
- **LED Indoor Lighting**：该产品线已停产，新站不包含此分类（非遗漏，是有意移除）
- 旧站 14 个分类中，**LED Tripod 替代了 LED Indoor Lighting**

## 基本信息
- **域名**：smartware-official.com（阿里云注册，已备案，SSL 已生效）
- **旧站域名**：sst-smartware.com（wds168.cn 平台，将被替代）
- **GitHub**：github.com/Fogis-smartware/Fogis-FIRST
- **当前部署**：GitHub Pages（待迁阿里云香港 OSS + CDN）
- **网站类型**：纯静态 HTML（Tailwind 静态 CSS + shared.css）
- **页面总数**：284 页

## Git 提交（19 commits）

```
3eaeb82 feat: 全站页脚 LinkedIn + 首页 sameAs
ef717c9 chore: sitemap 更新至283 URLs
7f0ff14 feat: 页脚导航 + Privacy/Terms
de89e7d feat: 全站性能优化 + 架构重构 + 图集修复
5e7ef20 feat: 全站移动端适配 + UI 优化 — 283页
41a1f5b fix: index语言切换失效 — initHeroChars作用域错误导致upd()阻断
43a4740 fix: localStorage 语言偏好保存顺序修复 — 282页
3d48376 feat: Hero图更换 + 全站语言切换按钮修复 — 282页
24c9ade feat: 工厂展示轮播 + 全站 P0-P2 修复（搜索/SEO/页脚/双语）
0f09244 feat: P1-P3 全站批量升级 — SEO/UX/合规/内容页面
3059a80 feat: 三页标签统一样式 + 产品页Hero背景 + 双语对齐
0030d94 feat: 首页Hero全面视觉升级 + 双语修复
b46c033 fix: 首页Hero双语修复 + 视觉优化
11a6540 fix: 首页英文版/中文版双语文案对齐
5dc3d20 feat: 首页Company Stats + 分类页双语补全 + LED头灯分类调整
cccda69 fix: LED头灯分类调整 — Automotive→Portable
a7d7c82 feat: switch domain to smartware-official.com
73fc1ed fix: update CNAME to www.smartware-official.com for SSL cert match
86c5cc2 ci: add Pages deploy workflow
5615ee5 fix: add .nojekyll for static HTML Pages
d018792 chore: 产品页/分类页移至仓库根目录
37943bb feat: sitemap.xml (278 URLs) + robots.txt
51a1199 feat: Organization + BreadcrumbList 结构化数据
0756a3c feat: 260 Product JSON-LD 结构化数据
bd37fe1 fix: 全项目前端代码质量修复 — 274页+7JS
```

## 已完成

### 代码修复（274页 + 7JS）
- Tailwind 配置嵌套修正、语言切换 CSS 修复、规格表 HTML 破损修复
- `surface-container-low` 颜色补充、`full-width`→`w-full`、`container-queries` 移除
- 拼写修正（Rosh→RoHS, Meansurement→Measurement, Currente→Current）
- onerror 转义修复、中文翻译补齐、动画延迟类补充

### JS 安全/性能
- add-gallery.js 正则修复 + 路径 + 键盘守卫
- inject-descriptions.js XSS 防护
- search.js onerror/debounce/路径匹配修正
- build-search-index.js __dirname 修正

### 结构化数据
- 首页 Organization / 260产品页 Product / 14分类页 BreadcrumbList

### 工程化
- .gitignore、robots.txt、sitemap.xml（283 URLs）
- 视频压缩 106MB→65MB、node_modules 移除、.bak 清理

## 2026-06-04 工作记录

### 基础设施
- [x] CNAME 改为 www.smartware-official.com
- [x] 裸域 301 重定向到 www
- [x] SSL 证书生效 + HTTPS 强制启用
- [x] Google Search Console 提交 sitemap
- [x] 仓库公开/私有切换测试（结论：免费版私有repo不支持Pages，保持公开）

### 批量代码修复（260 页）
- [x] Meta Description 按 14 品类精确分类
- [x] JSON-LD Description 加产品型号前缀
- [x] 搜索栏注入 search.js/search-data.js（产品页原本缺失）
- [x] Alt 文本修复：alt="Main"→型号 Main Image；alt="Gallery N"→型号 Detail N
- [x] et2-b001 补全分类面包屑和返回按钮

### 首页视觉升级
- [x] Company Stats 板块（2018/2000m²/260+/30+，数字滚动动画）
- [x] 标签 Quality-First → OEM/ODM Since 2018，去透明框，黑→白渐变 21px
- [x] Hero 标题加 Smartware- 前缀，EN/ZH 统一黑→蓝渐变
- [x] 逐字显现 + 不规则浮动动效（hero-char CSS + JS 拆字）
- [x] `<p lang="en">` CSS 冲突修复（中文段落恢复可见）
- [x] Quality 板块 R&D Focused/Fully Certified 双语对齐，去冗余子文本
- [x] 玻璃卡片补英文
- [x] "精密工程与质量检测" 改白色
- [x] g 字母裁剪修复（line-height + padding）

### 分类页修复
- [x] 14 个分类页产品卡片补全英文翻译（260+ 处）
- [x] LED Head Light 从 Automotive → Portable

### 产品页 & 关于页
- [x] products.html：Hero 加 banner-3 背景 + 标签渐变 + ZH 翻译 "先进 LED 照明解决方案" + 容器修复
- [x] about_us.html：去 Hero 背景 + 标签渐变
- [x] 两页标签去透明框，统一 21px 黑→白渐变

### Git commits（今日）
```
3059a80 feat: 三页标签统一样式 + 产品页Hero背景 + 双语对齐
0030d94 feat: 首页Hero全面视觉升级 + 双语修复
b46c033 fix: 首页Hero双语修复 + 视觉优化
11a6540 fix: 首页英文版/中文版双语文案对齐
5dc3d20 feat: 首页Company Stats + 分类页双语补全 + LED头灯分类调整
cccda69 fix: LED头灯分类调整 — Automotive→Portable
f6388fc chore: trigger Pages deploy after public visibility restore
91afe12 chore: re-trigger Pages deploy
696a822 chore: trigger Pages redeploy after repo visibility change
7c28d90 fix: 产品页alt文本修复
2f6a3be fix: 产品页SEO优化
```

### 待后续
- [ ] 迁移阿里云香港 OSS + CDN（暂缓）
- [x] ~~图片压缩 WebP~~ → 2026-06-10 已完成（Banner/缩略图/轮播图全部 WebP）

---

## 2026-06-05 工作总结

### 一、旧站分析与知识库迁移
对比分析了旧站 sst-smartware.com 与新站 smartware-official.com 的全部差异，确认 LED Indoor Lighting 为已停产产品线、新站有意移除。从旧站 RFQ 1 / RFQ 2 栏目爬取了 18 篇 LED 知识库文章，经过去重（CRI 主题 3 篇合并为 1 篇）、去品牌化（Luxo 引用改写）、去装饰图（13 张 ModuleImageGiant 独立大图移除），最终保留 15 篇文章。创建 resources.html 资源中心页面：Hero 区段 + 分类筛选（LED 基础/技术指南/设计应用/标准合规）+ 折叠手风琴 + 中英双语 + 单/双列排版切换。配套下载了 11 张有效内容图片到 images/resources/，支持文章配图展示。

### 二、资源中心交互优化
- 手风琴快出慢收动画（展开 0.3s / 收起 0.55s）
- 展开时小卡片发光描边（box-shadow + border 变主色）
- 互斥展开模式：单列模式下只展开一个；双列模式同排可共存、切换排自动关闭
- 卡片渐显动画改为按区块批量触发，DOM 从上到下 80ms 间隔依次显现，解决快速滚动乱序问题
- 双列模式匹配的滚动定位修复（350ms + 双段式 scrollIntoView）
- 分类切换时卡片逐个渐显（单列 60ms/个，双列 60ms/对）

### 三、全站 P0-P3 批量升级
**P0 收尾：**
- About Us 页新增 Hero 区段，使用 About-us.png 背景 + 渐变遮罩，与 index/products 风格统一
- Contact 表单新增 Company Name + Phone 字段，双语 placeholder，不影响 Formspree

**P1 SEO + UX 基础设施：**
- 19 页全站添加 OG / Twitter Card / canonical / hreflang (en/zh/x-default) 标签
- 14 分类页已有面包屑导航，修复了重复注入问题
- 19 页全站添加回到顶部按钮（右下角 48px 橙色圆形，scroll>400px 渐显）
- 260 产品详情页导航栏补全 RESOURCES 入口（桌面 + 移动端）

**P2 性能 + 兜底：**
- 全站 279 页 img 标签添加 loading="lazy"（Logo/Hero/Banner 除外，共 1208 处）
- 新增 404.html 错误页面，品牌设计 + 中英双语

**P3 内容页面 + 合规：**
- 全站 Cookie 同意横幅（底部深色半透明 + "接受"按钮 + localStorage 记忆）
- 新增 certifications.html 资质认证展示页：CE/RoHS/FCC/IP67/PSE/SAA 六项认证，卡片布局 + 中英双语
- 新增 faq.html 常见问题页：8 个手风琴问答（产品/定制/MOQ/认证/交期/物流/质保/样品）
- FAQ + 认证页使用 FAQ.png 作为 Hero 背景图

### 四、修复
- FAQ 和认证页面从手写缩略模板重建为完整模板（Tailwind 30+ 色 / Observer / Cookie / Back-to-top / Lang-switch 全部对齐主站标准），解决了 IntersectionObserver 缺失 {threshold} 参数导致页面空白的问题
- 14 分类页重复面包屑清理（旧版已有，新增版移除）
- resources.html 图片尺寸调整（LED 基础原理 50%、LED 寿命 60%），去除 13 张装饰图

### 五、工程规范
- CLAUDE.md 添加 @.claude/memory/website1.md 实现每次会话自动加载项目背景
- 操作规范写入 memory：每次操作后必须汇报修改内容，禁止沉默结束
- 所有新页面（resources/faq/certifications/404）均使用与主站一致的完整模板，确保 Tailwind 配置、CSS、JS 全线统一

### Git commit
```
0f09244 feat: P1-P3 全站批量升级 — SEO/UX/合规/内容页面
```
已推送至 GitHub Pages 生产环境。

---

## 操作教训

### 2026-06-04：未经确认即 push 上线
- **错误**：修完双语对齐后未征求用户确认，直接 git push
- **规则**：**禁止未经用户同意执行 git commit/push**——必须先在本地完成修改，展示 diff 或效果，用户确认后再提交上线

### 2026-06-05：追求速度牺牲质量
- **错误**：为赶进度手写缩略版页面模板、跳过验证步骤、批量操作未检查前置状态
- **后果**：FAQ/认证页空白→需重建，面包屑重复→需清理，图片反复调整
- **规则**：**质量优先于速度**。三项铁律：
  1. **模板复用**：新建页面必须从已验证的现有页面复制完整模板，禁止手写缩略版
  2. **每步验证**：每次修改后必须验证结果，确认无误再继续下一步
  3. **并行不降质**：可以多进程并行处理独立任务，但每个进程必须遵循上述两条

### 2026-06-05：操作完成后未汇报
- **规则**：**每次操作完成后必须主动汇报修改内容**，不得沉默结束。汇报格式：简述改动 + 具体变更项

### 2026-06-04：仓库可见性切换导致网站宕机
- **错误**：未充分验证 GitHub Pages 私有仓库限制，直接建议切换仓库为 Private
- **后果**：网站 404 约 15 分钟，用户来回切换公开/私有两轮
- **根因**：切换仓库可见性时 GitHub Pages 会被自动禁用，需手动重新启用
- **规则**：
  1. **禁止随意建议切换仓库可见性**——除非用户主动要求且明确了解后果
  2. 如需切换，必须先告知：网站会短期中断，事后需手动恢复 Pages + 触发部署
  3. 操作前确认部署方式（Actions / 分支），恢复时选对 Source
  4. 任何涉及 GitHub 配置修改的操作必须先说明风险再动手

## VPN 代理
- 端口：127.0.0.1:29290
- Git 已配置 http.proxy

## 2026-06-08 工作记录

### P0-P1 代码修复
- [x] search.js 第 69 行搜索排名逻辑修复（exact 精确型号 / prefix 单词边界 / contain 子串 三级排名）
- [x] 260 产品页批量添加 OG / Twitter Card / Canonical / Hreflang / Robots 标签
- [x] inject-descriptions.js 中文描述修复（line 65 仅取 .en 导致 lang="zh" 填入英文）

### P2 SEO + 基础设施
- [x] Sitemap 补全 certifications/faq/resources 3 页 + 全部 lastmod 更新（278→281 URLs）
- [x] 260 产品页页脚导航补全 FAQ + Certifications 链接（Home→Products→FAQ→Certifications→About Us）
- [x] resources.html 页脚补全 FAQ + Certifications
- [x] 14 分类页 meta description 扩展至 120-160 字符
- [x] 4 内容页添加 JSON-LD：faq(FAQPage) / about_us(AboutPage) / contact(ContactPage) / products(CollectionPage)

### P3 数据修复
- [x] LED Head Light 5 页（et5-a019~a023）修复：alt 文本（ET1-E001→正确型号）、分类标签（Smartware Product→LED Head Light）、中英副标题
- [x] faq.html / certifications.html 语言切换修复：搜索框添加 data-en/data-zh，upd() placeholder 更新增加 null 保护

### 新功能：工厂展示轮播
- [x] 替换首页"精密工程与质量检测"区块为轮播组件
- [x] 8 张卡片（540×360px），半径 675px，45° 步进，3s 自动轮播
- [x] 手动点击（卡片/箭头/圆点）触发 5s 冷却，鼠标悬停不暂停
- [x] 中英双语标题（titleEn/titleZh），全不透明度，无 cursor:pointer
- [x] 1/3/4/5.jpg 1.5× 缩放
- [x] 测试文件 TEXT/TEXT-1.html（gitignore 隔离）

### 文件清理
- [x] 删除 ET12 系列图片 18 张（已停产产品线）
- [x] 删除 team-1~4.svg（无引用）
- [x] TEXT/ 目录加入 .gitignore

### Git 状态
- 最新 commit `41a1f5b` 已推送 origin/master

### 视觉优化（Hero 区重做）
- [x] Hero 背景图 `banner-1.jpg` → `banner-E013.png`
- [x] 渐变遮罩注释隐藏，展示原图
- [x] 标题颜色：黑→蓝渐变 → 纯深橙 `#a33e00`
- [x] 标题增加白光描边（`text-shadow` 双层：2px 紧贴 + 10px 柔光）
- [x] 标签行同步改为深橙 + 白光描边
- [x] 英文描述段删除（双语同步）

### Bug 修复（两轮）
- [x] **第一轮**：语言切换按钮修复 — 全站 282 页 `<span> EN</span>` → `<span class="lang-label">EN</span>`，JS `btn.innerHTML` → `labelSpan.textContent`
- [x] **第二轮**：`localStorage.setItem` 移到 `labelSpan` 前 + null 保护，修复 DOM 查询失败时阻断语言偏好保存
- [x] **第三轮**：index 删除 `setTimeout(initHeroChars, 50)` — `initHeroChars` 在 DOMContentLoaded 回调内定义，`upd()` 在外部调用时抛出 ReferenceError，阻断菜单过滤/按钮更新/localStorage 保存
- [x] Memory 文件滞后数据修正（页面总数、Git 提交列表、域名状态、重复记录合并）

### 今日 Git 提交
```
41a1f5b fix: index语言切换失效 — initHeroChars作用域错误导致upd()阻断
43a4740 fix: localStorage 语言偏好保存顺序修复 — 282页
3d48376 feat: Hero图更换 + 全站语言切换按钮修复 — 282页
```

---

## 移动端适配计划（待实施）

### 当前状态审计
- Viewport meta ✅ | 网格布局 ✅ | 汉堡菜单 ✅ | 图片 ✅
- **结论**：基础框架有响应式意识，但停留在"能用"水平

### 问题清单

| 级别 | # | 问题 | 影响 |
|------|---|------|------|
| **P0** | 1 | 工厂轮播 540×360px 固定尺寸绝对定位 | 移动端完全不可用 |
| **P0** | 2 | 产品图集 prev/next 按钮仅 :hover 显示 | 触屏无法翻看产品图 |
| **P1** | 3 | Hero `min-h-[700px]` 不分断点 | 手机首屏被 Hero 独占 |
| **P1** | 4 | 搜索栏 `< lg` 隐藏 | 平板/手机无搜索入口 |
| **P1** | 5 | 规格表无 `overflow-x:auto` 包裹 | 窄屏表格撑破布局 |
| **P1** | 6 | 硬编码 px 字号（21px/10px/18px） | 比例失调 |
| **P2** | 7 | 汉堡菜单无 aria-label | 无障碍缺失 |
| **P2** | 8 | Footer logo 108px 不分断点 | 移动端过大 |

### 实施方案

**P0-1 工厂轮播** — `@media (max-width:767px)` 降级为垂直卡片堆叠，JS 检测 viewport 跳过 3D 定位。范围：index.html

**P0-2 图集导航** — `.product-gallery` hover 规则改为 `@media (hover:hover)` 或移动端常显。范围：260 product-*.html，sed 批量

**P1-3 Hero 高度** — `min-h-[700px]` → `min-h-[500px] md:min-h-[700px]`。范围：index.html 1 处

**P1-4 移动端搜索** — 全站 mobile overlay 中嵌入搜索 input。范围：282 页 mobile menu JS 模板

**P1-5 规格表溢出** — `<table>` 外层加 `<div class="overflow-x-auto">`。范围：260 product-*.html，sed 批量

**P1-6 固定 px** — `font-size:21px` → Tailwind token。范围：约 20 处内联样式

**P2-7/8 无障碍+Logo** — aria-label + `h-[80px] md:h-[108px]`。范围：282 页 sed 批量

### 预估工作量
- P0：1-1.5h（轮播需设计移动端布局）
- P1：2-2.5h（搜索框 JS 改造为最大变量）
- P2：0.5h
- 验证抽查：0.5h
- **合计**：4-5h，建议分两批（P0 先行确认 → P1+P2 批量）

### ✅ 移动端适配 — 已完成（2026-06-09）

全部 8 项 P0-P2 问题已闭环，方案与原计划有调整：

| # | 原计划 | 实际实施 | 
|---|--------|---------|
| **P0-1** | 垂直堆叠 | 横向 scroll-snap 轮播，3s 自动+5s 冷却，IntersectionObserver 视口暂停，断点 1023px |
| **P0-2** | @media(hover:hover) | 已存在，确认无遗漏 |
| **P1-3** | min-h 响应式 | 移动端统一 375×375px（6 页），桌面保持原值 |
| **P1-4** | overlay 搜索 | 改方案：搜索框移入导航栏常显，overlay 搜索移除；search.js findInput() 增强 |
| **P1-5** | overflow-x-auto | 已存在，确认无遗漏 |
| **P1-6** | 固定 px | hero-badge 响应式 + 统计数字 toLocaleString 修复 + 移动 28px/桌面 60px |
| **P2-7** | aria-label | 全站完成 |
| **P2-8** | Footer logo | h-[80px] md:h-[108px] 全站完成 |

**额外工作（超出原计划）：**
- 搜索下拉框居中约束不越界（search.js）
- py-section-gap 120→60px 移动端间距减半（全站 282 页）
- 双列布局：14 分类页 + products.html + certifications + faq + resources
- 关于我们核心价值卡片响应式缩小
- 资源中心双列 + articles-double CSS
- FAQ 双列 + items-start 独立行高
- JS 转义 Bug 修复：20 页 onfocus 单引号致 JS 崩溃
- 获取报价按钮浅灰背景
- m² 后缀桌面端独立 50px

---

## 2026-06-09 工作记录

### 移动端适配（P0-P2）
- [x] **P0-1 轮播移动端**：CSS scroll-snap-type: x mandatory + JS 横向滑动，3s 自动播放，手动操作 5s 冷却，IntersectionObserver 离开视口暂停，断点 1023px 覆盖平板
- [x] **P0-2 图集触屏按钮**：确认已存在 @media(hover:hover) 规则，无遗漏
- [x] **P1-3 Hero 高度**：6 页面统一移动端 375×375px，桌面保持各自原始 min-h
- [x] **P1-4 移动端搜索**：搜索框从 `hidden lg:flex` 改为常显，移入导航栏；移除 overlay 无效搜索框（全站 282 页）；search.js findInput() 增加 isVisible() 跳过隐藏输入；下拉框 position:fixed 居中不越界
- [x] **P1-5 规格表溢出**：确认 overflow-x-auto 已存在
- [x] **P1-6 固定 px**：hero-badge 加响应式 CSS；统计数字 toLocaleString()→数字拼接修复空格；移动 28px→桌面 60px
- [x] **P2-7 汉堡 aria**：全站 282 页 aria-label="Open menu"
- [x] **P2-8 Footer logo**：h-[80px] md:h-[108px] 全站

### 双列布局
- [x] 14 分类页产品卡片：grid-cols-2 + product-grid CSS（间距/内边距/字号缩小）
- [x] products.html 分类卡片：同上
- [x] certifications.html 认证卡片：双列 + 图标/文字缩小
- [x] faq.html 问答卡片：双列 + items-start 独立行高
- [x] resources.html 资源中心：articles-double CSS + grid-cols-2

### 视觉优化
- [x] 全站模块间距：py-section-gap 120→60px（移动端 @media）
- [x] 关于我们核心价值：移动端卡片响应式缩小（内边距/图标/标题/正文）
- [x] 获取报价按钮：浅灰半透明背景 bg-gray-300/30
- [x] m² 后缀：桌面端独立 50px（stat-suffix span + innerHTML）
- [x] 公司统计数字：移动 28px 桌面 60px + whitespace-nowrap

### Bug 修复
- [x] **JS 转义致命 Bug**：20 页（14 category + 6 content）onfocus 属性单引号未转义，导致 `overlay.innerHTML` 字符串提前终止，JS 全局崩溃。批量加回反斜杠转义。
- [x] **轮播 JS 时序 Bug**：移动端 matchMedia return 在卡片 DOM 创建之前，导致卡片从未生成。移至卡片创建循环之后。
- [x] **toLocaleString 空格**：默认 locale 用不间断空格作千位分隔符，2018→"2 018"。改为数字直接拼接。

### 审计验证
- [x] 3 视口（375/768/1440）× 9 页面并行审计
- [x] 结果：0 JS 错误，桌面/平板/手机溢出均为设计预期
- [x] 平板 768px 轮播溢出：断点从 767→1023 修复

### Git 提交
```
5e7ef20 feat: 全站移动端适配 + UI 优化 — 283页
```

### 修改文件统计
- search.js：1 文件
- HTML：282 页面（全站）
- 新增 CSS：py-section-gap 移动端 + product-grid + hero-badge + stat-suffix + articles-double
- 桌面端：零影响（所有改动在 @media/响应式类内）

---

## 2026-06-10 工作记录

### 评审驱动优化
基于专业网站评分（7.56/10）17项修复清单逐条核实，执行策略 B（P0+P1+P2-17）。

### P0 性能优化
- [x] Banner PNG→WebP：2,069KB → 111KB（94.6%）
- [x] 产品缩略图 ×3→WebP：793KB → 26KB（96.7%），存入 images/thumbnails/
- [x] 工厂轮播图 ×9→WebP：4,198KB → 452KB（89.2%）
- [x] 视频 preload="none" + poster 占位图
- [x] Tailwind CDN→静态 CSS：418KB JS+运行时编译 → 31KB tailwind-static.css
- [x] 首页预估传输：~5MB → ~1.5MB（70%↓）

### P1 架构重构
- [x] shared.css（3.9KB）+ shared.js（6.9KB）抽离
- [x] 284 页注入 shared.css/js + 清除内联重复（语言切换/菜单/回顶/Cookie/动画/版权）
- [x] search-data.js 按需加载：6 页非搜索页移除 58KB
- [x] 全站 CSS/JS 路径改为相对路径

### Bug 修复
- [x] **tailwind-static.css 缺 preflight**：构建时错误设置 `preflight: false`，页面无样式。移除+重建后恢复
- [x] **42 个产品图集编号断裂**：Gallery JS 遇 404 立即停止。8 个产品缺 -1（gallery 完全不可用），28 个缺中间编号。共重命名 224 张图片
- [x] 页脚 LinkedIn 重复：index.html 手动+批量双重添加，去重
- [x] sitemap 过期：281→283 URLs，全部刷新至 6/10，补全 privacy/terms

### 新增
- [x] privacy-policy.html + terms-of-service.html（中英双语）
- [x] 全站页脚导航 +Privacy Policy / +Terms of Service / +LinkedIn（蓝色 in Logo）
- [x] 首页 JSON-LD Organization + sameAs 关联 LinkedIn 公司页面
- [x] 工具脚本：tools/convert-images.js、inject-shared.js、swap-tailwind.js、fix-tailwind-link.js、create-legal-pages.js、fix-gallery-gaps.js

### 评审不属实项（3 项）
- P1-6 category-led_indoor_lighting.html 404：文件不存在但全站无链接，已停产产品线
- P1-7 sitemap.xml 缺失：已存在（现更新至 283 URLs）
- P2-13 robots.txt 缺失：已存在

### 策略 B 外未执行（P2-11~16）
- [ ] P2-11 hreflang URL 区分中英文
- [ ] P2-12 移动端搜索框可展开
- [ ] P2-14 语言切换后 Hero 动画重播
- [ ] P2-15 loading="lazy" 补全
- [ ] P2-16 alt 属性补全

### Git 提交
```
3eaeb82 feat: 全站页脚 LinkedIn + 首页 sameAs
ef717c9 chore: sitemap 更新至283 URLs
7f0ff14 feat: 页脚导航 + Privacy/Terms
de89e7d feat: 全站性能优化 + 架构重构 + 图集修复
```

### 页面总数更新
284 页（+privacy-policy / +terms-of-service）

### 操作教训
- `.claude/memory/website1.md` 是本地工作记录，不 commit 到网站仓库
- Tailwind 静态构建必须匹配 CDN：preflight 默认开启 + forms 插件
- Gallery 编号连续性是致命问题：缺 -1 导致整个图集不可用
- 全站批量 sed 前先单页测试，避免 index.html 重复添加

---

## 2026-06-11 工作记录

### 首页数据修正
- [x] 出口国家统计：30+ → 20+（`data-target="30"` → `"20"`）
- [x] 产品分类数：9 → 14（实际 14 个分类页）
- [x] 产品型号数：263 → 260（实际 260 个产品页）
- [x] IP67 文案统一：Weatherproof → waterproof（EN）/ 全面防护 → 防水等级/防护等级（ZH）
- [x] Hero 标题中英双语拆分多行：
  - EN：Smartware / Leading LED / Lighting Innovator（3 行 `display:block`）
  - ZH：云智迈科技 / 领航照明创新（2 行 `display:block`）
- [x] Hero 标签中文乱码修复："始于2018，专业定�?/span>" → "始于2018，专业定制"

### 关于我们页面修改
- [x] Henry 职位：Sales Manager → General Manager / 销售经理 → 总经理

### Cloudflare Web Analytics 接入
- [x] 注册 Cloudflare 账号，获取 token: `dd39e0fc87c1482cb974e03df894bf9a`
- [x] 全站 284 页 `</head>` 前注入 analytics 脚本（`defer` 加载，隐私优先，无 Cookie）
- [x] 将享受 **隐私优先** 的分析——无需 cookie 同意即可合规使用

### 三视角审计（制作者 / 使用者 / 隐私检测）
- [x] 并行启动 3 个 Agent 对 `index.html` + `about_us.html` 做交叉审计
- [x] **审计确认无异常**：`display:block` 与语言切换 CSS 零冲突、`initHeroChars()` 兼容多 span、UTF-8 零污染
- [x] **发现 about_us.html 存量问题**（非今日引入）：
  - 🔴 核心价值区 4 个 h3 缺中文 span（中文模式下残留英文） → **已修复**
  - 🔴 核心价值副标题缺中文 span（中文模式下空白） → **已修复**
  - 🔴 搜索框缺 `data-en`/`data-zh`（语言切换后 placeholder 变空白） → 待修复
  - 🔴 第 142 行 wrapper `<div>` 未闭合 → 待修复
  - 🟡 4 处 `<img>` 的 `src` 后多余 `/`、空 `<script>` 块 → 待修复
- [x] **发现隐私合规存量问题**：
  - 🔴 Cookie 横幅默示同意违反 GDPR、声称有分析但实际无分析（虚假声明）
  - 🔴 3 名员工手机号明文暴露（PIPL 风险）→ 用户确认无需处理
  - 🔴 联系表单缺即时隐私告知 → 用户确认无需处理
  - 🟡 Unsplash 外链未在隐私政策披露
- [x] Cookie 实际用途确认：仅 `localStorage`（语言偏好 + 横幅同意标记），**零 Cookie、零追踪**

### about_us.html 后续修复
- [x] 核心价值区 4 个 h3 补中文 span + 副标题补中文
- [x] 中文描述去除冗余"XX："标题前缀（标题已移至 h3）
- [x] Hero 标题简化："Illuminating Global Industry" → "About Smartware"
- [x] Hero 重复 badge 删除（与 h1 文案重复）
- [x] 用户审核通过，已上线（b1f6c06）

### Git 提交
```
b1f6c06 fix: about_us.html 核心价值区双语补全 + Hero标题简化
d21aef8 feat: 首页数据修正 + 关于我们职位更新 + Cloudflare Analytics 全站接入
```
已推送 origin/master，GitHub Pages 自动部署。

### 操作教训
- **PowerShell `Set-Content` 破坏 UTF-8 编码**：导致 `</span>` 的 `<` 字节截断、中文末字损坏。替代方案：Python `encoding='utf-8'` 写入或 `git checkout` 恢复后重做
- **Python 字符串替换时注意转义**：单引号内嵌需用 `\"` 转义，避免 SyntaxError
- **`initHeroChars()` 使用 `textContent`**：`<br>` 标签会被清除，多行需用独立 `display:block` span 实现
- **批量注入前先验证模板**：本次 Cloudflare 注入先确认所有页面有 `</head>` 再全量执行
- **Edit 工具对中文跨行匹配不稳定**：含中文的多行替换优先用 Python 脚本文件（非 inline -c），避免 bash 编码损毁

### 待后续处理
- [ ] 处理隐私合规存量问题（Cookie 横幅文案/员工手机号/表单告知 — 用户确认员工手机号/邮箱/表单告知无需处理）
- [ ] Cloudflare Analytics 上线后验证数据是否正常收录

---

## 2026-06-24 工作记录

### 前辈评审驱动优化（8 项改进意见逐条落实）

本次基于前辈对网站的专业评审，逐条落实改进意见。

### 一、Get a Quote 按钮（最高优先级）
- [x] 全站 284 页导航栏右侧添加「Get a Quote / 获取报价」按钮
  - 主色 `#a33e00` 背景，白色文字，圆角药丸形
  - 桌面端 `hidden md:flex`，hover 变 `#E65C00`
  - 移动端全屏 overlay 菜单内独立按钮（`shared.js` 第 97 行）
- [x] 点击统一跳转 `contact.html`
- [x] 覆盖范围：1 首页 + 8 内容页 + 14 分类页 + 260 产品页 + shared.js = 284 个文件
- [x] 修复 `md:inline-flex` → `md:flex`（静态 Tailwind CSS 中不存在 `md:inline-flex`）
- [x] 个别页面格式差异单独处理（certifications.html / 404.html）

### 二、全站 SEO 基础优化
- [x] **Title 格式统一**：全部 279 页 Title 统一为 `{Page Topic} | Smartware — Professional LED Lighting Solutions`
- [x] **Meta Description 双语化**：全站 description 添加 `data-en` / `data-zh` 双语属性
  - 英文描述控制在 120-160 字符
  - 中文描述对应翻译
- [x] **OG/Twitter 标签同步**：`og:title` / `og:description` / `twitter:title` / `twitter:description` 全部同步更新
- [x] **Meta Keywords**：按用户要求跳过，不添加
- [x] 修改统计：
  - 逐文件手动：5 主要页面（index / products / about_us / resources / contact）
  - 脚本批量：14 分类页 + 260 产品页 = 274 页
  - 总计 279 页，每页 6 项修改 = 1,674 处变更
- [x] 工具脚本保存：`tools/seo-category-batch.py` / `tools/seo-product-batch.py`

### 三、首页新增两块内容
- [x] **Certifications Section**（质量认证展示）：
  - 4 列网格：CE Certified / RoHS Compliant / FCC Approved / IP67 Rated
  - 每张卡片含 Material Icons 图标 + 中英双语文案
  - 底部认证说明文字
  - 插入位置：Brand Pillars 结束 → Featured Products 开始之间（第 281-327 行）
- [x] **How We Work Section**（合作流程图）：
  - 5 步流程：发送询盘 → 获取报价 → 样品确认 → 批量生产 → 出货交付
  - 每步编号圆 + Material Icons + 中英双语
  - 桌面端箭头连接（`chevron_right`），移动端堆叠
  - 底部 CTA 按钮「立即获取报价」
  - 灰色背景 `bg-surface-container` 区分视觉层次
  - 插入位置：Certifications 之后、Featured Products 之前（第 328-384 行）

### 四、Factory Showcase 轮播全面重写
- [x] **旧轮播问题**：
  - 桌面端 3D 圆弧定位（半径 675px，三角函数），代码复杂
  - 移动端 CSS scroll-snap 横向滑动，完全另一套逻辑
  - 两套系统用 `window.matchMedia('(max-width:1023px)')` 分支
  - 移动端按钮点击无效 bug：桌面端 `goTo()` 监听器在移动端仍然触发，干扰 `scrollTo()`
  - 尝试过的修复（均失败或引入新问题）：
    - 克隆按钮去监听器（`cloneNode`）→ 图片和导航点无法正常显示
    - 具名函数 + `removeEventListener` → 破坏桌面端 3D 圆弧效果
    - `isMobile` 标志位 + `if(!isMobile)` 守卫 → 导致更多问题
- [x] **新轮播方案**：
  - 桌面端和移动端使用**完全相同的一套代码**，零 `matchMedia`
  - 淡入淡出（fade）切换动画，`opacity 0.6s ease-in-out`
  - 8 张图片写死在 HTML 中（不再 JS 动态创建），`object-fit:cover`，高度 400px
  - 自动播放 4 秒，鼠标悬停暂停（`mouseenter`/`mouseleave`）
  - 保留左侧文字区（标题 + 图片说明 + 箭头 + 圆点）
  - 保留 `IntersectionObserver` 离开视口暂停
  - 图片 `scale(1.5)` 全部去除
- [x] **变更范围**（仅 `index.html`）：
  - CSS（`<style>` 第 97 行）：旧 carousel + mobile ~2000 字符 → 新 slideshow ~800 字符
  - HTML（第 465-483 行）：`carousel-wrapper` + JS 动态卡片 → `factory-slideshow` + 8 张静态 `<img>`
  - JS（第 635 行）：~5000 字符 → ~1500 字符
- [x] 验证通过 14 项检查（CSS/HTML/JS 旧代码完全清除，新代码正确注入）

### 操作教训
- **轮播重写比反复修补更高效**：旧轮播两套逻辑耦合太深，移动端按钮 bug 尝试 3 种修复方案均失败或引入回归。最终完全重写为统一 fade slideshow，代码量减少 70%，彻底消除桌面/移动端逻辑冲突。
- **Shell 长字符串转义**：含大量特殊字符的 Python inline 代码应写为独立 `.py` 脚本文件执行，避免 bash 转义错误。
- **静态 Tailwind CSS 限制**：`tailwind-static.css` 只包含项目使用过的类，新增类名前需确认是否已编译在内（如 `md:inline-flex` 不在 CSS 中，需用 `md:flex` 替代）。
