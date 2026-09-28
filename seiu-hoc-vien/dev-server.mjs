// Chạy app trên máy: API + giao diện (Vite) ở cùng một cổng.
// Dữ liệu được lưu thành file JSON trong thư mục .data/
import http from 'node:http';
import path from 'node:path';
import { createServer as createVite } from 'vite';

process.env.LOCAL_DATA_DIR ||= path.resolve('.data');
const { handleApi } = await import('./server/api.mjs');
const { openStore } = await import('./server/store.mjs');

const env = {
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  AUTH_SECRET: process.env.AUTH_SECRET || '',
};
const store = await openStore();
const vite = await createVite({ server: { middlewareMode: true }, appType: 'spa' });
const port = Number(process.env.PORT) || 5173;

http.createServer(async (req, res) => {
  if (!req.url.startsWith('/api/')) return vite.middlewares(req, res);
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const request = new Request(`http://localhost:${port}${req.url}`, {
    method: req.method,
    headers: req.headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks),
  });
  const response = await handleApi(request, { store, env });
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(Buffer.from(await response.arrayBuffer()));
}).listen(port, () => {
  console.log(`SEIU Quản lý học viên: http://localhost:${port}`);
  console.log(`Tài khoản admin: ${env.ADMIN_USERNAME} / ${process.env.ADMIN_PASSWORD ? '(từ biến môi trường)' : env.ADMIN_PASSWORD}`);
});
