// Đưa app vào website SEIU tại đường dẫn /hoc-vu:
// - giao diện build vào seiu-web-v3/public/hoc-vu/ (Vite của website sẽ copy sang dist/)
// - mã API copy vào seiu-web-v3/netlify/hoc-vu/ (dùng bởi netlify/functions/hoc-vu-api.mjs)
// Chạy lại lệnh này (`npm run build:web`) mỗi khi sửa app.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const web = path.resolve('../seiu-web-v3');
if (!fs.existsSync(path.join(web, 'package.json'))) throw new Error(`Không tìm thấy website tại ${web}`);

const uiDir = path.join(web, 'public/hoc-vu');
execFileSync('npx', ['vite', 'build', '--base', '/hoc-vu/', '--outDir', uiDir, '--emptyOutDir'], { stdio: 'inherit' });

const serverDir = path.join(web, 'netlify/hoc-vu');
fs.rmSync(serverDir, { recursive: true, force: true });
fs.mkdirSync(serverDir, { recursive: true });
for (const file of ['api.mjs', 'auth.mjs', 'store.mjs']) {
  const source = fs.readFileSync(path.join('server', file), 'utf8');
  fs.writeFileSync(
    path.join(serverDir, file),
    `// TỰ SINH từ seiu-hoc-vien/server/${file} bởi \`npm run build:web\`. Đừng sửa trực tiếp file này.\n${source}`,
  );
}
console.log(`\nĐã cập nhật ${path.relative(process.cwd(), uiDir)} và ${path.relative(process.cwd(), serverDir)}`);
