// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

const src = path.join(__dirname, 'node_modules', 'tinymce');
const dest = path.join(__dirname, 'public', 'tinymce');

try {
  if (fs.existsSync(src)) {
    //- Xoá thư mục cũ nếu có để tránh file rác
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true });
    }
    //- Sao chép toàn bộ thư mục từ node_modules sang public
    fs.cpSync(src, dest, { recursive: true });
    console.log('👉 TinyMCE assets copied successfully to public/tinymce!');
  } else {
    console.warn('⚠️ node_modules/tinymce not found. Run npm install first.');
  }
} catch (err) {
  console.error('❌ Error copying TinyMCE assets:', err);
}
