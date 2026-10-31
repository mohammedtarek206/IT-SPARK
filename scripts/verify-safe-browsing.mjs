/**
 * External Health & Safe Browsing Verification Script
 * Run with: node scripts/verify-safe-browsing.mjs
 */

const TARGET_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.itsparkacademy.com';

async function checkUrl(url) {
    try {
        console.log(`Checking ${url}...`);
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) IT-SPARK-HealthCheck/1.0' },
            redirect: 'follow',
        });
        console.log(` -> Status: ${res.status} ${res.statusText}`);
        return { ok: res.ok, status: res.status };
    } catch (err) {
        console.error(` -> Failed to reach ${url}:`, err.message);
        return { ok: false, error: err.message };
    }
}

async function main() {
    console.log('=== IT-SPARK ACADEMY SECURITY POSTURE CHECK ===');
    console.log(`Target Domain: ${TARGET_URL}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);

    const pages = [
        `${TARGET_URL}/`,
        `${TARGET_URL}/courses`,
        `${TARGET_URL}/training-courses`,
        `${TARGET_URL}/login`,
        `${TARGET_URL}/forgot-password`,
        `${TARGET_URL}/checkout`,
        `${TARGET_URL}/contact`,
    ];

    for (const page of pages) {
        await checkUrl(page);
    }

    console.log('\n--- Google Safe Browsing Transparency Link ---');
    console.log(`Check live verdict at: https://transparencyreport.google.com/safe-browsing/search?url=${encodeURIComponent(TARGET_URL)}`);
    console.log('================================================\n');
}

main();
