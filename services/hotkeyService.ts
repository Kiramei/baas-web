import type { HotkeyConfig } from '@/components/HotkeyConfig';

// 你后续把这两个函数改成真实的 HTTP/WebSocket 调用即可
export type FetchHotkeys = () => Promise<HotkeyConfig[]>;
export type SaveHotkeys = (hotkeys: HotkeyConfig[]) => Promise<void>;

// 占位实现（返回空数组表示后端暂无配置）
export const fetchHotkeys: FetchHotkeys = async () => {
  // TODO: 接后端
  return [];
};

export const saveHotkeys: SaveHotkeys = async (_hotkeys: HotkeyConfig[]) => {
  // TODO: 接后端
};