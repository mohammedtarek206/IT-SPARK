const TARGET = 'https://www.itsparkacademy.com';

async function inspectHtml(path) {
    const res = await fetch(`${TARGET}${path}`);
    const html = await res.text();
    console.log(`\n=================== INSPECTING ${path} ===================`);
    console.log(`Status: ${res.status}`);
    
    // Scripts
    const scriptSrcs = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
    console.log(`\nExternal Scripts (${scriptSrcs.length}):`);
    scriptSrcs.forEach(s => console.log('  ', s));

    // Inline scripts (first 120 chars)
    const inlineScripts = [...html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1].trim());
    console.log(`\nInline Scripts (${inlineScripts.length}):`);
    inlineScripts.forEach((s, idx) => console.log(`  [Script #${idx + 1} (${s.length} chars)]:`, s.substring(0, 120).replace(/\s+/g, ' ')));

    // Iframes
    const iframes = [...html.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
    console.log(`\nIframes (${iframes.length}):`, iframes);

    // Forms
    const forms = [...html.matchAll(/<form[^>]*([\s\S]*?)<\/form>/gi)];
    console.log(`\nForms (${forms.length}):`);
    forms.forEach((f, idx) => {
        const action = (f[0].match(/action=["']([^"']+)["']/i) || [])[1] || 'none';
        const method = (f[0].match(/method=["']([^"']+)["']/i) || [])[1] || 'GET';
        console.log(`  [Form #${idx + 1}] action=${action} method=${method}`);
    });

    // Links to external domains
    const hrefs = [...html.matchAll(/href=["'](https?:\/\/[^"']+)["']/gi)].map(m => m[1]);
    const externalDomains = new Set(hrefs.map(h => {
        try { return new URL(h).hostname; } catch (e) { return h; }
    }));
    console.log(`\nExternal Domains in Links:`, Array.from(externalDomains));
}

async function main() {
    await inspectHtml('/');
    await inspectHtml('/login');
    await inspectHtml('/signup');
    await inspectHtml('/checkout');
    await inspectHtml('/forgot-password');
}

main().catch(console.error);
