import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localesPath = path.join(__dirname, 'src/utils/locales.js');

let content = fs.readFileSync(localesPath, 'utf8');

// The replacement replaced \' with ' in single quotes causing a syntax error.
content = content.replace(/ac_MOM_LOVES_ME_name: 'Mom's Pride'/g, "ac_MOM_LOVES_ME_name: 'Mom\\'s Pride'");

fs.writeFileSync(localesPath, content, 'utf8');
console.log("Fixed syntax error again");
