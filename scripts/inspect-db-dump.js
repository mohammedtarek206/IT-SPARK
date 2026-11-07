const fs = require('fs');
const path = require('path');

const backupDir = path.join('backups', fs.readdirSync('backups').sort().reverse()[0]);
console.log('Inspecting backup directory:', backupDir);

const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json') && f !== 'manifest.json');

const urlRegex = /https?:\/\/[^\s"',<>]+/gi;
const scriptRegex = /<script|<\/script|<iframe|javascript:|data:text\/html/gi;

const allUrls = new Set();
const suspiciousFindings = [];

for (const file of files) {
    const filePath = path.join(backupDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // check scripts/iframes
    const scriptMatches = content.match(scriptRegex);
    if (scriptMatches) {
        suspiciousFindings.push({ file, matches: scriptMatches });
    }

    // collect URLs
    const urls = content.match(urlRegex) || [];
    for (const u of urls) {
        allUrls.add(u);
    }
}

console.log('--- SUSPICIOUS HTML/SCRIPT TAGS IN DB ---');
console.log(suspiciousFindings.length === 0 ? 'None found!' : JSON.stringify(suspiciousFindings, null, 2));

console.log('\n--- ALL UNIQUE HOSTNAMES FOUND IN DB ---');
const hostnames = new Set();
for (const u of allUrls) {
    try {
        const parsed = new URL(u);
        hostnames.add(parsed.hostname);
    } catch (e) {
        // ignore
    }
}
console.log(Array.from(hostnames).sort());

console.log('\n--- SAMPLE EXTERNAL URLS IN DB ---');
for (const u of Array.from(allUrls).slice(0, 50)) {
    console.log(u);
}
