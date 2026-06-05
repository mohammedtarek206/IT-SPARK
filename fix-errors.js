const fs = require('fs');
const path = require('path');

function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.ts') && !fullPath.includes('upload\\route.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            let index = 0;
            while ((index = content.indexOf('catch', index)) !== -1) {
                // Ensure it's not part of a word
                if (index > 0 && /[a-zA-Z0-9_]/.test(content[index - 1])) {
                    index += 5;
                    continue;
                }

                const catchSignatureRegex = /^catch\s*\(\s*([a-zA-Z0-9_]+)\s*(?::\s*(?:any|unknown|Error))?\s*\)\s*\{/;
                const substr = content.slice(index);
                const match = substr.match(catchSignatureRegex);
                
                if (match) {
                    const errName = match[1];
                    const startBraceIndex = index + match[0].length - 1;
                    let braceCount = 1;
                    let endBraceIndex = startBraceIndex + 1;
                    
                    while (braceCount > 0 && endBraceIndex < content.length) {
                        if (content[endBraceIndex] === '{') braceCount++;
                        if (content[endBraceIndex] === '}') braceCount--;
                        endBraceIndex++;
                    }
                    
                    if (braceCount === 0) {
                        const catchBody = content.slice(startBraceIndex + 1, endBraceIndex - 1);
                        
                        if (catchBody.includes('500') || catchBody.includes('NextResponse.json')) {
                            const newCatch = `catch (${errName}: any) {\n        console.error("API ERROR:", ${errName});\n        return NextResponse.json({ error: ${errName}?.message || 'Internal Server Error' }, { status: 500 });\n    }`;
                            content = content.slice(0, index) + newCatch + content.slice(endBraceIndex);
                            modified = true;
                            index = index + newCatch.length;
                            continue;
                        }
                    }
                }
                index += 5;
            }

            if (modified) {
                if (!content.includes('NextResponse')) {
                    content = "import { NextResponse } from 'next/server';\n" + content;
                }
                fs.writeFileSync(fullPath, content);
                console.log('Modified:', fullPath);
            }
        }
    }
}

processDirectory(path.join(__dirname, 'app', 'api'));
