// Lớp lưu trữ dữ liệu. Trên Netlify dùng Netlify Blobs; khi chạy máy local
// (LOCAL_DATA_DIR được đặt) thì lưu thành file JSON trong thư mục đó.
import fs from 'node:fs/promises';
import path from 'node:path';

const STORE_NAME = 'seiu-hoc-vien';

const createFileStore = dir => {
  const fileFor = key => path.join(dir, `${key}.json`);
  return {
    async get(key) {
      try {
        return JSON.parse(await fs.readFile(fileFor(key), 'utf8'));
      } catch (error) {
        if (error.code === 'ENOENT') return null;
        throw error;
      }
    },
    async set(key, value) {
      const file = fileFor(key);
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, JSON.stringify(value, null, 2));
    },
    async delete(key) {
      await fs.rm(fileFor(key), { force: true });
    },
    async list(prefix) {
      const folder = path.join(dir, prefix);
      let names = [];
      try {
        names = await fs.readdir(folder);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      const items = await Promise.all(
        names.filter(name => name.endsWith('.json')).map(name => this.get(`${prefix}/${name.slice(0, -5)}`)),
      );
      return items.filter(Boolean);
    },
  };
};

const createBlobStore = async () => {
  const { getStore } = await import('@netlify/blobs');
  const store = getStore({ name: STORE_NAME, consistency: 'strong' });
  return {
    get: key => store.get(key, { type: 'json', consistency: 'strong' }),
    set: (key, value) => store.setJSON(key, value),
    delete: key => store.delete(key),
    async list(prefix) {
      const { blobs } = await store.list({ prefix: `${prefix}/` });
      const items = await Promise.all(
        blobs.map(({ key }) => store.get(key, { type: 'json', consistency: 'strong' }).catch(() => null)),
      );
      return items.filter(Boolean);
    },
  };
};

export const openStore = async () => {
  const localDir = process.env.LOCAL_DATA_DIR;
  return localDir ? createFileStore(localDir) : createBlobStore();
};

export { createFileStore };
