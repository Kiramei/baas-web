// StorageUtil.ts
export class StorageUtil {
  static async get<T = any>(key: string): Promise<T | null> {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error("[StorageUtil:get] error:", e);
      return null;
    }
  }

  static async set(key: string, value: any): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("[StorageUtil:set] error:", e);
    }
  }

  static async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("[StorageUtil:remove] error:", e);
    }
  }

  static async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (e) {
      console.error("[StorageUtil:clear] error:", e);
    }
  }
}
