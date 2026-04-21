import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localesPath = path.join(__dirname, 'src/utils/locales.js');

let content = fs.readFileSync(localesPath, 'utf8');

// Fix the syntax error: Mom's Pride should be Mom\'s Pride
content = content.replace(/Mom's Pride/g, "Mom\\'s Pride");

fs.writeFileSync(localesPath, content, 'utf8');
console.log("Fixed syntax error");
