/**
 * Create privacy-policy.html and terms-of-service.html from faq.html template
 */
const fs = require('fs');
const path = require('path');

const ROOT = 'D:/GIT';

function replaceBetween(str, start, end, replacement) {
    const si = str.indexOf(start);
    if (si === -1) return str;
    const ei = str.indexOf(end, si + start.length);
    if (ei === -1) return str;
    return str.substring(0, si) + start + replacement + end + str.substring(ei + end.length);
}

// ── privacy-policy.html ──
const privacyMain = `
<!-- Hero Section -->
<section class="relative h-[375px] md:h-[400px] flex items-center overflow-hidden">
<div class="absolute inset-0 z-0">
<img alt="Privacy Policy" class="w-full h-full object-cover" src="images/banner-E013.webp"/>
<div class="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent"></div>
</div>
<div class="relative z-10 px-gutter md:px-margin-desktop max-w-container-max mx-auto w-full">
<div class="fade-up">
<p class="hero-badge mb-6 font-bold uppercase tracking-wider" style="font-size:21px;background:linear-gradient(to right,#1a1c1c,#ffffff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text"><span lang="en">Legal</span><span lang="zh">法律条款</span></p>
<h1 class="font-display-lg text-display-lg-mobile md:text-display-lg mb-6">
    <span lang="en" style="background:linear-gradient(to right,#1a1c1c,#0062a1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Privacy Policy</span>
<span lang="zh" style="background:linear-gradient(to right,#1a1c1c,#0062a1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">隐私政策</span>
</h1>
<p class="font-body-lg text-body-lg text-secondary max-w-2xl">
    <span lang="en">How we collect, use, and protect your personal information.</span>
<span lang="zh" class="block mt-2">我们如何收集、使用和保护您的个人信息。</span>
</p>
</div>
</div>
</section>

<!-- Privacy Content -->
<section class="py-section-gap px-gutter md:px-margin-desktop max-w-container-max mx-auto">
<div class="max-w-[900px] mx-auto text-secondary space-y-8 fade-up">
<p class="text-sm opacity-60"><span lang="en">Last Updated: June 10, 2026</span><span lang="zh">最后更新：2026年6月10日</span></p>

<h2 class="font-headline-lg text-on-surface pt-4"><span lang="en">1. Information We Collect</span><span lang="zh">1. 我们收集的信息</span></h2>
<p><span lang="en">When you use our contact form or send us an email, we may collect the following personal information that you voluntarily provide:</span><span lang="zh">当您使用我们的联系表单或向我们发送电子邮件时，我们可能会收集您自愿提供的以下个人信息：</span></p>
<ul class="list-disc pl-6 space-y-2">
<li><span lang="en">Name</span><span lang="zh">姓名</span></li>
<li><span lang="en">Email address</span><span lang="zh">电子邮件地址</span></li>
<li><span lang="en">Phone number</span><span lang="zh">电话号码</span></li>
<li><span lang="en">Company name</span><span lang="zh">公司名称</span></li>
<li><span lang="en">Any other information you choose to include in your message</span><span lang="zh">您在消息中选择包含的任何其他信息</span></li>
</ul>
<p><span lang="en">We do not automatically collect personal data through cookies or tracking technologies for marketing purposes. Our cookie usage is limited to essential functionality (language preference) and basic analytics.</span><span lang="zh">我们不会通过 Cookie 或追踪技术为营销目的自动收集个人数据。我们的 Cookie 使用仅限于基本功能（语言偏好）和基础分析。</span></p>

<h2 class="font-headline-lg text-on-surface pt-6"><span lang="en">2. How We Use Your Information</span><span lang="zh">2. 我们如何使用您的信息</span></h2>
<p><span lang="en">The information you provide is used exclusively for:</span><span lang="zh">您提供的信息仅用于：</span></p>
<ul class="list-disc pl-6 space-y-2">
<li><span lang="en">Responding to your inquiries and providing customer support</span><span lang="zh">回复您的咨询并提供客户支持</span></li>
<li><span lang="en">Processing your requests for quotes, samples, or product information</span><span lang="zh">处理您的报价、样品或产品信息请求</span></li>
<li><span lang="en">Communicating about orders, deliveries, and business matters</span><span lang="zh">就订单、交付和业务事宜进行沟通</span></li>
</ul>
<p><span lang="en">We do not sell, rent, or share your personal information with third parties for their marketing purposes.</span><span lang="zh">我们不会向第三方出售、出租或共享您的个人信息用于其营销目的。</span></p>

<h2 class="font-headline-lg text-on-surface pt-6"><span lang="en">3. Data Storage and Security</span><span lang="zh">3. 数据存储与安全</span></h2>
<p><span lang="en">Your information is stored securely and is only accessible to authorized Smartware personnel who need it to fulfill your requests. Our contact form submissions are processed through Formspree, a third-party form processing service. Please refer to Formspree's privacy policy for details on how they handle data.</span><span lang="zh">您的信息安全存储，仅限需要履行您请求的授权 Smartware 人员访问。我们的联系表单提交通过 Formspree（第三方表单处理服务）处理。有关其数据处理方式的详细信息，请参阅 Formspree 的隐私政策。</span></p>

<h2 class="font-headline-lg text-on-surface pt-6"><span lang="en">4. Your Rights</span><span lang="zh">4. 您的权利</span></h2>
<p><span lang="en">You have the right to:</span><span lang="zh">您有权：</span></p>
<ul class="list-disc pl-6 space-y-2">
<li><span lang="en">Request access to the personal data we hold about you</span><span lang="zh">请求访问我们持有的关于您的个人数据</span></li>
<li><span lang="en">Request correction or deletion of your personal data</span><span lang="zh">请求更正或删除您的个人数据</span></li>
<li><span lang="en">Withdraw your consent at any time</span><span lang="zh">随时撤回您的同意</span></li>
<li><span lang="en">Contact us with privacy-related questions at fogis@smartware-official.com</span><span lang="zh">通过 fogis@smartware-official.com 联系我们咨询隐私相关问题</span></li>
</ul>

<h2 class="font-headline-lg text-on-surface pt-6"><span lang="en">5. Third-Party Services</span><span lang="zh">5. 第三方服务</span></h2>
<p><span lang="en">Our website uses the following third-party services that may process data:</span><span lang="zh">我们网站使用以下可能处理数据的第三方服务：</span></p>
<ul class="list-disc pl-6 space-y-2">
<li><span lang="en">Formspree — contact form processing</span><span lang="zh">Formspree — 联系表单处理</span></li>
<li><span lang="en">Google Fonts — web font delivery</span><span lang="zh">Google Fonts — 网页字体加载</span></li>
<li><span lang="en">GitHub Pages — website hosting</span><span lang="zh">GitHub Pages — 网站托管</span></li>
</ul>

<h2 class="font-headline-lg text-on-surface pt-6"><span lang="en">6. Contact Us</span><span lang="zh">6. 联系我们</span></h2>
<p><span lang="en">If you have any questions about this Privacy Policy, please contact us at:</span><span lang="zh">如果您对本隐私政策有任何疑问，请通过以下方式联系我们：</span></p>
<p class="pt-2"><span lang="en">Email: fogis@smartware-official.com<br/>Address: Shenzhen, Guangdong, China</span><span lang="zh">邮箱：fogis@smartware-official.com<br/>地址：中国广东省深圳市</span></p>
</div>
</section>`;

// ── terms-of-service.html ──
const termsMain = `
<!-- Hero Section -->
<section class="relative h-[375px] md:h-[400px] flex items-center overflow-hidden">
<div class="absolute inset-0 z-0">
<img alt="Terms of Service" class="w-full h-full object-cover" src="images/banner-E013.webp"/>
<div class="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent"></div>
</div>
<div class="relative z-10 px-gutter md:px-margin-desktop max-w-container-max mx-auto w-full">
<div class="fade-up">
<p class="hero-badge mb-6 font-bold uppercase tracking-wider" style="font-size:21px;background:linear-gradient(to right,#1a1c1c,#ffffff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text"><span lang="en">Legal</span><span lang="zh">法律条款</span></p>
<h1 class="font-display-lg text-display-lg-mobile md:text-display-lg mb-6">
    <span lang="en" style="background:linear-gradient(to right,#1a1c1c,#0062a1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Terms of Service</span>
<span lang="zh" style="background:linear-gradient(to right,#1a1c1c,#0062a1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">服务条款</span>
</h1>
<p class="font-body-lg text-body-lg text-secondary max-w-2xl">
    <span lang="en">Terms and conditions governing the use of this website and our services.</span>
<span lang="zh" class="block mt-2">使用本网站及我们服务的条款和条件。</span>
</p>
</div>
</div>
</section>

<!-- Terms Content -->
<section class="py-section-gap px-gutter md:px-margin-desktop max-w-container-max mx-auto">
<div class="max-w-[900px] mx-auto text-secondary space-y-8 fade-up">
<p class="text-sm opacity-60"><span lang="en">Last Updated: June 10, 2026</span><span lang="zh">最后更新：2026年6月10日</span></p>

<h2 class="font-headline-lg text-on-surface pt-4"><span lang="en">1. Acceptance of Terms</span><span lang="zh">1. 接受条款</span></h2>
<p><span lang="en">By accessing and using this website, you accept and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you should not use this website.</span><span lang="zh">访问和使用本网站即表示您接受并同意受本服务条款的约束。如果您不同意这些条款的任何部分，则不应使用本网站。</span></p>

<h2 class="font-headline-lg text-on-surface pt-6"><span lang="en">2. Intellectual Property</span><span lang="zh">2. 知识产权</span></h2>
<p><span lang="en">All content on this website, including but not limited to text, images, logos, product descriptions, and design elements, is the property of Smartware (Shenzhen) Technology Co., Ltd and is protected by applicable intellectual property laws. Unauthorized use, reproduction, or distribution of any content is prohibited without prior written consent.</span><span lang="zh">本网站上的所有内容，包括但不限于文字、图片、标识、产品描述和设计元素，均为云智迈科技（深圳）有限公司的财产，受适用知识产权法律的保护。未经事先书面同意，禁止未经授权使用、复制或分发任何内容。</span></p>

<h2 class="font-headline-lg text-on-surface pt-6"><span lang="en">3. Product Information</span><span lang="zh">3. 产品信息</span></h2>
<p><span lang="en">While we strive to provide accurate product specifications and information, all content on this website is provided for general informational purposes only. Product specifications, pricing, and availability are subject to change without notice. Images may not reflect exact product appearance due to manufacturing variations.</span><span lang="zh">尽管我们努力提供准确的产品规格和信息，但本网站所有内容仅供一般参考。产品规格、定价和供货情况可能随时变更，恕不另行通知。由于制造差异，图片可能无法反映确切的产品外观。</span></p>

<h2 class="font-headline-lg text-on-surface pt-6"><span lang="en">4. Limitation of Liability</span><span lang="zh">4. 责任限制</span></h2>
<p><span lang="en">Smartware (Shenzhen) Technology Co., Ltd shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of or inability to use this website. We make no warranties or representations about the accuracy or completeness of the website content.</span><span lang="zh">云智迈科技（深圳）有限公司对于因使用或无法使用本网站而产生的任何直接、间接、附带或后果性损害不承担责任。我们对网站内容的准确性或完整性不作任何保证或陈述。</span></p>

<h2 class="font-headline-lg text-on-surface pt-6"><span lang="en">5. External Links</span><span lang="zh">5. 外部链接</span></h2>
<p><span lang="en">This website may contain links to third-party websites. We are not responsible for the content, privacy practices, or terms of such external sites. Users access external links at their own risk.</span><span lang="zh">本网站可能包含指向第三方网站的链接。我们对这些外部网站的内容、隐私实践或条款不承担责任。用户自行承担访问外部链接的风险。</span></p>

<h2 class="font-headline-lg text-on-surface pt-6"><span lang="en">6. Governing Law</span><span lang="zh">6. 适用法律</span></h2>
<p><span lang="en">These Terms of Service shall be governed by and construed in accordance with the laws of the People's Republic of China. Any disputes arising from these terms shall be subject to the jurisdiction of the courts in Shenzhen, Guangdong, China.</span><span lang="zh">本服务条款受中华人民共和国法律管辖并依其解释。因本条款引起的任何争议均应提交中国广东省深圳市人民法院管辖。</span></p>

<h2 class="font-headline-lg text-on-surface pt-6"><span lang="en">7. Changes to Terms</span><span lang="zh">7. 条款变更</span></h2>
<p><span lang="en">We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to this website. Continued use of the website after changes constitutes acceptance of the modified terms.</span><span lang="zh">我们保留随时修改本服务条款的权利。修改将在本网站发布后立即生效。在变更后继续使用本网站即表示接受修改后的条款。</span></p>

<h2 class="font-headline-lg text-on-surface pt-6"><span lang="en">8. Contact Information</span><span lang="zh">8. 联系信息</span></h2>
<p><span lang="en">For questions regarding these Terms of Service, please contact us at:</span><span lang="zh">有关本服务条款的问题，请通过以下方式联系我们：</span></p>
<p class="pt-2"><span lang="en">Email: fogis@smartware-official.com<br/>Address: Shenzhen, Guangdong, China</span><span lang="zh">邮箱：fogis@smartware-official.com<br/>地址：中国广东省深圳市</span></p>
</div>
</section>`;

function createLegalPage(filename, mainContent, pageTitle, pageTitleZh, description) {
    const faq = fs.readFileSync(path.join(ROOT, 'faq.html'), 'utf8');

    let html = faq;

    // Replace <main>...</main>
    html = replaceBetween(html, '<main>', '</main>', mainContent);

    // Replace title
    html = html.replace(
        /<title data-en="[^"]*" data-zh="[^"]*">[^<]*<\/title>/,
        `<title data-en="${pageTitle} - Smartware" data-zh="${pageTitleZh} - 云智迈科技">${pageTitle} - Smartware</title>`
    );

    // Replace meta description
    html = html.replace(
        /<meta name="description" content="[^"]*"\/>/,
        `<meta name="description" content="${description}"/>`
    );

    // Replace OG title
    html = html.replace(
        /<meta property="og:title" content="[^"]*"\/>/,
        `<meta property="og:title" content="${pageTitle} — Smartware"/>`
    );

    // Replace OG description
    html = html.replace(
        /<meta property="og:description" content="[^"]*"\/>/,
        `<meta property="og:description" content="${description}"/>`
    );

    // Replace OG URL
    html = html.replace(
        /<meta property="og:url" content="[^"]*"\/>/,
        `<meta property="og:url" content="https://www.smartware-official.com/${filename}"/>`
    );

    // Replace Twitter title
    html = html.replace(
        /<meta name="twitter:title" content="[^"]*"\/>/,
        `<meta name="twitter:title" content="${pageTitle} — Smartware"/>`
    );

    // Replace Twitter description
    html = html.replace(
        /<meta name="twitter:description" content="[^"]*"\/>/,
        `<meta name="twitter:description" content="${description}"/>`
    );

    // Replace canonical
    html = html.replace(
        /<link rel="canonical" href="[^"]*"\/>/,
        `<link rel="canonical" href="https://www.smartware-official.com/${filename}"/>`
    );

    // Replace hreflang URLs
    html = html.replace(
        /<link rel="alternate" hreflang="en" href="[^"]*"\/>/,
        `<link rel="alternate" hreflang="en" href="https://www.smartware-official.com/${filename}"/>`
    );
    html = html.replace(
        /<link rel="alternate" hreflang="zh" href="[^"]*"\/>/,
        `<link rel="alternate" hreflang="zh" href="https://www.smartware-official.com/${filename}"/>`
    );
    html = html.replace(
        /<link rel="alternate" hreflang="x-default" href="[^"]*"\/>/,
        `<link rel="alternate" hreflang="x-default" href="https://www.smartware-official.com/${filename}"/>`
    );

    // Replace JSON-LD (simplify to WebPage)
    html = replaceBetween(html, '<script type="application/ld+json">', '</script>',
        `\n{\n  "@context": "https://schema.org",\n  "@type": "WebPage",\n  "name": "${pageTitle}",\n  "description": "${description}",\n  "url": "https://www.smartware-official.com/${filename}"\n}\n`);

    // Remove FAQ-specific accordion JS (the acc-content styles and accordion onclick handlers are in main section, which was replaced)
    // Remove FAQ-specific acc-content/acc-arrow CSS if any (these are inline in faq.html head)

    // Remove FAQ-specific CSS in head (acc-content, acc-arrow)
    html = html.replace(/\.acc-content[^}]*\}\s*\.acc-content\.open[^}]*\}\s*\.acc-arrow[^}]*\}\s*\.acc-arrow\.open[^}]*\}/g, '');
    html = html.replace(/\.acc-content\{max-height:0;overflow:hidden;transition:max-height 0\.3s ease\}\.acc-content\.open\{max-height:600px\}/g, '');
    html = html.replace(/\.acc-arrow\{transition:transform 0\.3s ease\}\.acc-arrow\.open\{transform:rotate\(180deg\)\}/g, '');

    fs.writeFileSync(path.join(ROOT, filename), html, 'utf8');
    console.log(`Created: ${filename}`);
}

createLegalPage(
    'privacy-policy.html',
    privacyMain,
    'Privacy Policy',
    '隐私政策',
    'Smartware (Shenzhen) Technology privacy policy. How we collect, use, and protect your personal information. GDPR-compliant data handling practices.'
);

createLegalPage(
    'terms-of-service.html',
    termsMain,
    'Terms of Service',
    '服务条款',
    'Smartware (Shenzhen) Technology terms of service. Conditions governing website use, intellectual property, liability limitations, and governing law.'
);

console.log('Done. Legal pages created.');
