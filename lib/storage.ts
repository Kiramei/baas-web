let Store: any = null;

try {
  if ("__TAURI_INTERNALS__" in window) {
    Store = (await import.meta.glob("./fakeStore.ts")["./fakeStore.ts"]()).Store
    console.log("[debug]", Store)
  }
} catch (e) {
  console.error(e);
}

export class StorageUtil {
  private static store: any | null = null;

  private static async ensureStore() {
    if (this.store || !Store) return;
    this.store = new Store(".app_storage.dat");
  }

  private static isTauri(): boolean {
    return "__TAURI_INTERNALS__" in window && !!Store;
  }

  // 获取值
  static async get<T = any>(key: string): Promise<T | null> {
    if (this.isTauri()) {
      await this.ensureStore();
      return (await this.store.get(key)) ?? null;
    } else {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    }
  }

  // 设置值
  static async set(key: string, value: any): Promise<void> {
    if (this.isTauri()) {
      await this.ensureStore();
      await this.store.set(key, value);
      await this.store.save();
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  // 删除值
  static async remove(key: string): Promise<void> {
    if (this.isTauri()) {
      await this.ensureStore();
      await this.store.delete(key);
      await this.store.save();
    } else {
      localStorage.removeItem(key);
    }
  }

  // 清空存储
  static async clear(): Promise<void> {
    if (this.isTauri()) {
      await this.ensureStore();
      await this.store.clear();
      await this.store.save();
    } else {
      localStorage.clear();
    }
  }
}
