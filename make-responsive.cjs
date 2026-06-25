const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src/pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const absolutePath = path.join(pagesDir, file);
  let content = fs.readFileSync(absolutePath, 'utf8');
  let original = content;
  
  content = content.replace(/className=\"p-8\"/g, 'className=\"p-4 md:p-8\"');
  content = content.replace(/className=\"bg-white p-8/g, 'className=\"bg-white p-4 md:p-8');
  
  if (content !== original) {
    fs.writeFileSync(absolutePath, content);
    console.log('Updated ' + file);
  }
});
