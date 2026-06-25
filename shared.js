/**
 * Smartware Shared JavaScript
 * 全站公共脚本：语言切换、移动端菜单、动画观察器、回到顶部、Cookie 横幅
 * 浏览器首次加载后缓存，后续页面 0 额外传输
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        // ============================================================
        // 1. Copyright Year
        // ============================================================
        var yearEl = document.getElementById('copyright-year');
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }

        // ============================================================
        // 2. Scroll Animation Observer
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
            overlay.innerHTML = '<div style="text-align:center"><button class="mobile-close material-symbols-outlined" style="position:absolute;top:24px;right:24px;color:white;font-size:32px;cursor:pointer;background:none;border:none">close</button><nav style="display:flex;flex-direction:column;gap:32px"><a href="index.html" style="color:white;font-size:20px;font-weight:600;text-decoration:none"><span lang="en">HOME</span><span lang="zh">首页</span></a><a href="products.html" style="color:white;font-size:20px;font-weight:600;text-decoration:none"><span lang="en">PRODUCT</span><span lang="zh">产品</span></a><a href="resources.html" style="color:white;font-size:20px;font-weight:600;text-decoration:none"><span lang="en">RESOURCES</span><span lang="zh">资源中心</span></a><a href="contact.html" style="color:white;font-size:20px;font-weight:600;text-decoration:none"><span lang="en">CONTACT</span><span lang="zh">联系我们</span></a><a href="about_us.html" style="color:white;font-size:20px;font-weight:600;text-decoration:none"><span lang="en">ABOUT US</span><span lang="zh">关于我们</span></a><a href="contact.html" style="background:#a33e00;color:white;padding:12px 24px;border-radius:24px;font-size:18px;font-weight:600;text-decoration:none;margin-top:8px;display:inline-block"><span lang="en">Get a Quote</span><span lang="zh">获取报价</span></a></nav></div>';
            document.body.appendChild(overlay);
            menuBtn.addEventListener('click', function () { overlay.style.display = 'flex'; });
            overlay.querySelector('.mobile-close').addEventListener('click', function () { overlay.style.display = 'none'; });
            overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.style.display = 'none'; });
        }
    });

    // ============================================================
    // 5. Back to Top Scroll Listener
    // ============================================================
    window.addEventListener('scroll', function () {
        var b = document.getElementById('back-to-top');
        if (b) b.classList.toggle('show', window.scrollY > 400);
    });

    // ============================================================
    // 6. Cookie Consent Banner
    // ============================================================
    if (!localStorage.getItem('cookie-consent')) {
        function showBanner() {
            var b = document.getElementById('cookie-banner');
            if (b) setTimeout(function () { b.classList.add('show'); }, 500);
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', showBanner);
        } else {
            showBanner();
        }
    }

})();
