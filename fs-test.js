const fs = require('fs');
const path = require('path');

const testDir = path.join(process.cwd(), 'public', 'uploads', 'test');
try {
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
        console.log('Directory created');
    }
    const testFile = path.join(testDir, 'test.txt');
    fs.writeFileSync(testFile, 'test');
    console.log('File written');
    fs.unlinkSync(testFile);
    fs.rmdirSync(testDir);
    console.log('Test successful');
} catch (err) {
    console.error('Test failed:', err);
}
