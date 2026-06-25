const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src/components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('Modal.tsx'));

files.forEach(file => {
  const absolutePath = path.join(componentsDir, file);
  let content = fs.readFileSync(absolutePath, 'utf8');
  let original = content;
  
  content = content.replace(
    /className="fixed inset-0 z-50 flex items-center justify-center bg-black\/50 backdrop-blur-sm"/g,
    'className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"'
  );
  content = content.replace(
    /className="bg-white rounded-3xl p-8/g,
    'className="bg-white rounded-3xl p-6 md:p-8'
  );
  
  if (content !== original) {
    fs.writeFileSync(absolutePath, content);
    console.log('Updated ' + file);
  }
});
