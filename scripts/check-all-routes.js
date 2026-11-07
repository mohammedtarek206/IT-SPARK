const fs = require('fs');
const path = require('path');

function checkAllRoutes(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            checkAllRoutes(fullPath);
        } else if (entry.name === 'route.ts') {
            const content = fs.readFileSync(fullPath, 'utf8');
            const hasAuth = /authenticateRequest/.test(content);
            const methods = [...content.matchAll(/export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)/g)].map(m => m[1]);
            const relPath = fullPath.replace(/\\/g, '/').replace('app/api/', '');
            if (!relPath.startsWith('admin/')) {
                console.log(relPath, '-> Methods:', methods.join(','), '| Auth:', hasAuth);
            }
        }
    }
}

checkAllRoutes('app/api');
