const fs = require('fs');
const path = require('path');

function convertCommonJSToESM(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    // Convert `require` to `import` for regular imports
    content = content.replace(/const (\w+) = require\((['"].+?['"])\);/g, 'import $1 from $2;');

    // Convert `exports.functionName = async function` to `export async function functionName`
    content = content.replace(/exports\.(\w+)\s*=\s*async function\s*(\w*)/g, 'export async function $1');

    // Convert `exports.functionName = function` to `export function functionName`
    content = content.replace(/exports\.(\w+)\s*=\s*function\s*(\w*)/g, 'export function $1');

    // Convert `exports.variableName =` to `export const variableName =`
    content = content.replace(/exports\.(\w+)\s*=\s*(?!function|async function)(.+);/g, 'export const $1 = $2;');

    // Convert `module.exports = new Logger();` to `export default new Logger();`
    content = content.replace(/module\.exports\s*=\s*new\s+(\w+)\(\);/g, 'export default new $1();');

    // Convert `module.exports = functionName;` to `export default functionName;`
    content = content.replace(/module\.exports\s*=\s*(?!function|async function|{)(\w+);/g, 'export default $1;');

    // Convert anonymous function exports like `module.exports = async (req, res) => {...}` to `export default async (req, res) => {...}`
    content = content.replace(/module\.exports\s*=\s*async\s*\(([\s\S]*?)\)\s*=>/g, 'export default async ($1) =>');
    content = content.replace(/module\.exports\s*=\s*function\s*\(([\s\S]*?)\)/g, 'export default function ($1)');
    content = content.replace(/module\.exports\s*=\s*\(([\s\S]*?)\)\s*=>/g, 'export default ($1) =>');


    // Save the updated file
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Converted: ${filePath}`);
}

// Path to the directory containing your JavaScript files
const dirPath = path.join(__dirname, 'src'); // Adjust to your directory

function processDirectory(directory) {
    fs.readdirSync(directory).forEach(file => {
        const fullPath = path.join(directory, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            processDirectory(fullPath); // Recursively process directories
        } else if (file.endsWith('.js')) {
            convertCommonJSToESM(fullPath);
        }
    });
}

processDirectory(dirPath);
