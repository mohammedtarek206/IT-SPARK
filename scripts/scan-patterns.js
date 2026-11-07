const fs = require('fs');
const path = require('path');

function searchDir(dir, patterns) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            if (file.name !== 'node_modules' && file.name !== '.next' && file.name !== '.git' && file.name !== 'backups') {
                searchDir(fullPath, patterns);
            }
        } else if (/\.(js|mjs|ts|tsx)$/.test(file.name)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            for (const [name, regex] of Object.entries(patterns)) {
                const matches = content.match(regex);
                if (matches) {
                    console.log(`[${name}] in ${fullPath}: ${matches.length} matches (sample: ${matches[0].substring(0, 60).replace(/\n/g, ' ')})`);
                }
            }
        }
    }
}

const patterns = {
    'eval': /\beval\s*\(/g,
    'Function-constructor': /new\s+Function\s*\(/g,
    'iframe': /<iframe/gi,
    'dangerouslySetInnerHTML': /dangerouslySetInnerHTML/g,
    'window-location': /window\.location/g,
    'user-agent-check': /user-agent|userAgent/gi,
    'referer-check': /referer|referrer/gi,
    'googlebot': /googlebot/gi,
    'setTimeout-fake': /setTimeout\s*\([^,]+,\s*[1-9][0-9]{3,}\)/g
};

searchDir('.', patterns);
