const fs = require('fs');
const path = require('path');

function checkAdminRoutes(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            checkAdminRoutes(fullPath);
        } else if (entry.name === 'route.ts') {
            const content = fs.readFileSync(fullPath, 'utf8');
            const hasAuth = /authenticateRequest/.test(content);
            const checksAdmin = /user\.role\s*===\s*['"]admin['"]|role\s*!==\s*['"]admin['"]|role\s*===\s*['"]admin['"]/.test(content);
            const methods = [...content.matchAll(/export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)/g)].map(m => m[1]);
            console.log(fullPath.replace(/\\/g, '/'), '-> Methods:', methods.join(','), '| Auth:', hasAuth, '| AdminCheck:', checksAdmin);
        }
    }
}

checkAdminRoutes('app/api/admin');
