const fs = require('fs');
const path = require('path');

function checkTryCatch(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            checkTryCatch(fullPath);
        } else if (fullPath.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('export async function') && !content.includes('catch')) {
                console.log('Missing catch in:', fullPath);
            }
        }
    }
}
checkTryCatch(path.join(__dirname, 'app', 'api'));
