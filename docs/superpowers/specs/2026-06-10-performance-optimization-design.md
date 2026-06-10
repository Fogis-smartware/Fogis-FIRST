# 性能优化与架构重构 — 设计方案

**日期**：2026-06-10
**评审来源**：专业网站评分 7.56/10，17 项修复建议
**实施策略**：策略 B — P0 性能 + P1 架构，附带 P2-17 隐私合规页

---

## 范围

| 阶段 | 编号 | 项目 | 类型 |
|------|------|------|------|
| Phase 1A | P0-1 | Banner 2.1MB PNG → WebP | 图片压缩 |
| Phase 1A | P0-2 | 产品缩略图压缩 (3张) | 图片压缩 |
| Phase 1A | P0-4 | 工厂轮播图压缩 (8张) | 图片压缩 |
| Phase 1A | P1-9 | 视频 preload="none" + poster | 性能优化 |
| Phase 1B | P1-5 | 共享 CSS/JS 抽离 | 架构重构 |
| Phase 1C | P1-8 | 搜索数据按需加载 | 性能优化 |
| Phase 2 | P0-3 | Tailwind CDN → 静态 CSS | 架构重构 |
| Phase 1D | P2-17 | 隐私政策 + 服务条款页面 | 法律合规 |

---

## 技术决策

### 图片转换
- **工具**：cwebp（Google 官方 WebP 编码器）
- **Banner**：`-q 80 -resize 1920 0`，目标 ≤250KB
- **缩略图**：`-q 75 -resize 400 0`，目标 ≤60KB，存入 `images/thumbnails/`
- **轮播图**：`-q 75 -resize 1080 0`，目标 ≤100KB
- **回退**：所有原文件保留不删除

### 共享 CSS/JS
- **shared.css**：约 150 行，含全局变量、动画关键帧、组件 CSS、响应式断点
- **shared.js**：约 100 行，含语言切换、移动端菜单、回顶按钮、Cookie 横幅
- **引用方式**：`<link rel="stylesheet" href="/shared.css">` + `<script src="/shared.js" defer>`

### Tailwind 静态化
- **工具**：Tailwind CLI (`npx tailwindcss`)
- **配置**：`tailwind.static.config.js`，content 扫描全部 `./**/*.html`
- **输出**：`tailwind-static.css`（minified，预计 35KB）
- **替换**：删除 CDN `<script>` + 内联 `tailwind.config`，换为 `<link>` 引用

### 隐私页面
- 参考通用 GDPR/隐私政策模板
- 去除品牌特定信息，采用行业通用措辞
- 中英双语

---

## 执行顺序

```
Phase 1（全部并行，互不依赖）
├── A 组：图片压缩 + 视频优化
├── B 组：共享 CSS/JS 抽离
├── C 组：搜索数据按需加载
└── D 组：隐私政策 + 服务条款页面

Phase 2（依赖 B 组完成）
└── Tailwind 静态化（必须在 shared.css 就位后，避免重复扫描/遗漏）

验证抽查（Phase 2 完成后）
└── 3 视口 × 5 页面 抽样检查
```

---

## 影响页面

| 操作 | 影响范围 |
|------|---------|
| 图片路径更新 (Banner) | 6 页（index/about/products/faq/certifications/resources） |
| 图片路径更新 (缩略图) | 1 页（index.html） |
| 图片路径更新 (轮播) | 1 页（index.html） |
| 视频属性添加 | 1 页（index.html） |
| 共享 CSS/JS 注入 | 283 页全站 |
| 内联代码删除 | 283 页全站 |
| 搜索数据移除 | 6 页（index/about/contact/faq/certifications/resources） |
| Tailwind CDN 替换 | 283 页全站 |
| 新增页面 | 2 页（privacy-policy / terms-of-service） |

---

## 风险与缓解

| 风险 | 缓解措施 |
|------|---------|
| Tailwind 静态化后样式差异 | 先 5 页样本验证，用浏览器 DevTools 截图对比 |
| 批量 sed 误匹配 | 每次操作后 `git diff --stat` 抽查 10 页 |
| WebP 浏览器兼容 | 全球支持率 97.6%，原文件保留可随时回退 |
| 共享 JS 变量冲突 | 所有函数已用独立作用域包裹，提取过程不修改逻辑 |
| 构建文件未推送 | Phase 2 确认 tailwind-static.css 存在后再批量替换 |

---

## 预期效果

| 指标 | 当前 | 目标 |
|------|------|------|
| 首页总传输 | ~5MB | ≤1.5MB |
| banner 图片 | 2.1MB PNG | ≤250KB WebP |
| 轮播图总计 | 3.7MB JPG | ≤800KB WebP |
| 全站 CSS | CDN 418KB + 运行时编译 | 静态 35KB + 浏览器缓存 |
| 重复代码传输 | ~500KB/会话 | 0（shared.css/js 被缓存） |
| FCP（估计） | 3-4s | ≤2s |
| 代码维护点 | 283 文件各自内联 | 双文件统一维护 |
| 评分预估 | 7.56 | 8.2+ |
