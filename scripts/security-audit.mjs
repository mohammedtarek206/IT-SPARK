import fs from 'fs';
import path from 'path';

console.log('=== IT-SPARK ACADEMY COMPREHENSIVE SECURITY AUDIT ===\n');

let pass = true;

function fail(msg) {
    console.error(`❌ [FAIL] ${msg}`);
    pass = false;
}

function ok(msg) {
    console.log(`✅ [PASS] ${msg}`);
}

// 1. Check robots.txt for scanner blackout
const robotsContent = fs.readFileSync('app/robots.ts', 'utf8');
const disallowMatches = [...robotsContent.matchAll(/disallow:\s*\[([\s\S]*?)\]/gi)];
let foundDisallowedAuth = [];
for (const match of disallowMatches) {
    const list = match[1];
    for (const p of ['/login', '/signup', '/forgot-password', '/checkout', '/payment']) {
        if (list.includes(`'${p}'`) || list.includes(`"${p}"`)) {
            foundDisallowedAuth.push(p);
        }
    }
}
if (foundDisallowedAuth.length > 0) {
    fail(`robots.txt blocks crawlers from critical public pages: ${[...new Set(foundDisallowedAuth)].join(', ')}`);
} else {
    ok('robots.txt disallow lists do NOT block crawlers from public auth, checkout, or recovery routes.');
}

// 2. Check obsolete payment redirect
const paymentContent = fs.readFileSync('app/payment/page.tsx', 'utf8');
if (paymentContent.includes('permanentRedirect')) {
    ok('/payment route is permanently redirected (308) to courses catalog.');
} else {
    fail('/payment route is not using permanent redirect.');
}

// 3. Scan for eval() and Function()
function scanForForbiddenFunctions(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const f of files) {
        const full = path.join(dir, f.name);
        if (f.isDirectory()) {
            if (!['node_modules', '.next', '.git', 'backups'].includes(f.name)) {
                scanForForbiddenFunctions(full);
            }
        } else if (/\.(ts|tsx|js|mjs)$/.test(f.name) && !full.includes('scripts\\security-audit.mjs')) {
            const code = fs.readFileSync(full, 'utf8');
            if (/\beval\s*\(/.test(code)) fail(`eval() found in ${full}`);
            if (/new\s+Function\s*\(/.test(code)) fail(`new Function() found in ${full}`);
        }
    }
}
scanForForbiddenFunctions('.');
ok('Zero eval() or new Function() code execution found.');

// 4. Verify admin routes have server-side authentication
function verifyAdminRoutes(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const f of files) {
        const full = path.join(dir, f.name);
        if (f.isDirectory()) {
            verifyAdminRoutes(full);
        } else if (f.name === 'route.ts') {
            const code = fs.readFileSync(full, 'utf8');
            if (!code.includes('authenticateRequest')) {
                fail(`Admin route missing authenticateRequest: ${full}`);
            }
            if (!code.includes("'admin'") && !code.includes('"admin"')) {
                fail(`Admin route missing admin role check: ${full}`);
            }
        }
    }
}
verifyAdminRoutes('app/api/admin');
ok('All app/api/admin/* route handlers enforce server-side authentication and role=admin verification.');

// 5. Verify CSP in next.config.mjs
const nextConfigContent = fs.readFileSync('next.config.mjs', 'utf8');
if (nextConfigContent.includes("'unsafe-eval'")) {
    fail("next.config.mjs still allows 'unsafe-eval' in script-src!");
} else {
    ok("Content-Security-Policy enforces strict script-src without 'unsafe-eval'.");
}

if (nextConfigContent.includes('upgrade-insecure-requests')) {
    ok('Content-Security-Policy enforces upgrade-insecure-requests.');
} else {
    fail('next.config.mjs missing upgrade-insecure-requests.');
}

// 6. Check for seed-admin backdoor file
if (fs.existsSync('app/api/seed-admin/route.ts')) {
    fail('Backdoor endpoint app/api/seed-admin/route.ts exists!');
} else {
    ok('Confirmed backdoor endpoint app/api/seed-admin/route.ts is eliminated.');
}

console.log('\n======================================================');
if (pass) {
    console.log('🎉 ALL APPLICATION SECURITY AUDIT CHECKS PASSED!');
    process.exit(0);
} else {
    console.error('⚠️ SOME SECURITY AUDIT CHECKS FAILED!');
    process.exit(1);
}
