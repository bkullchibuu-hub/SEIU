// Bản demo chạy trên trình duyệt: server/api.mjs chỉ cần randomUUID từ node:crypto.
export default { randomUUID: () => globalThis.crypto.randomUUID() };
