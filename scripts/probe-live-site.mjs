import https from 'https';

const TARGET = 'https://www.itsparkacademy.com';

const testCases = [
    {
        name: 'Desktop Chrome',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        }
    },
    {
        name: 'Googlebot Desktop',
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
    },
    {
        name: 'Googlebot Smartphone',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
    },
    {
        name: 'Mobile Safari',
        headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
    },
    {
        name: 'From Google Search Referrer',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'Referer': 'https://www.google.com/',
        }
    }
];

const paths = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/checkout',
    '/payment',
    '/courses',
    '/robots.txt',
    '/sitemap.xml'
];

async function fetchPath(urlPath, tc) {
    try {
        const fullUrl = `${TARGET}${urlPath}`;
        const res = await fetch(fullUrl, {
            headers: tc.headers,
            redirect: 'manual' // don't follow automatically to detect redirects
        });

        const status = res.status;
        const location = res.headers.get('location') || '';
        const csp = res.headers.get('content-security-policy') ? 'PRESENT' : 'MISSING';
        const server = res.headers.get('server') || '';
        const xVercelId = res.headers.get('x-vercel-id') || '';
        const text = await res.text();
        const length = text.length;

        return {
            status,
            location,
            csp,
            server,
            xVercelId,
            length,
            title: (text.match(/<title[^>]*>(.*?)<\/title>/i) || [])[1] || ''
        };
    } catch (e) {
        return { error: e.message };
    }
}

async function run() {
    console.log(`=== PROBING LIVE PRODUCTION SITE: ${TARGET} ===\n`);
    for (const p of paths) {
        console.log(`--- Path: ${p} ---`);
        for (const tc of testCases) {
            const res = await fetchPath(p, tc);
            if (res.error) {
                console.log(`  [${tc.name}]: ERROR: ${res.error}`);
            } else {
                console.log(`  [${tc.name}]: status=${res.status} redirect="${res.location}" length=${res.length} csp=${res.csp} vercel=${res.xVercelId ? 'yes' : 'no'}`);
            }
        }
    }
}

run();
