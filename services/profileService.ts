// 你后续把这些函数改成真实 HTTP/WebSocket 调用；返回/入参类型可以按需细化
import {AppSettings} from "@/lib/types.ts";

export type ServerCode = 'CN' | 'Global' | 'JP';

export const DEFAULT_CONFIG: AppSettings = {
  server: 'CN',
  adbIP: '127.0.0.1',
  adbPort: '16384',
  open_emulator_stat: true
}

export interface ProfileDTO {
  id: string;
  name: string;
  server: ServerCode;
  settings: AppSettings;
}

export async function listProfiles(): Promise<ProfileDTO[]> {
  // TODO: GET /api/profiles
  return [
    {
      id: '1',
      name: '默认配置',
      server: 'CN',
      settings: DEFAULT_CONFIG
    },
    {
      id: '2',
      name: '测试配置',
      server: 'Global',
      settings: {
        server: 'Global',
        adbIP: '127.0.0.1',
        adbPort: '16385',
        open_emulator_stat: false
      }
    }


  ]; // 返回空代表后端暂无数据；Header 会给出兜底
}

export async function createProfile(payload: {
  name: string;
  server: ServerCode,
  settings: AppSettings
}): Promise<ProfileDTO> {
  // TODO: POST /api/profiles
  // 返回后端分配的 id
  return {id: crypto.randomUUID(), name: payload.name, server: payload.server, settings: payload.settings};
}

export async function updateProfile(id: string, patch: Partial<Pick<ProfileDTO, 'name' | 'server'>>): Promise<void> {
  // TODO: PUT /api/profiles/:id
}

export async function deleteProfile(id: string): Promise<void> {
  // TODO: DELETE /api/profiles/:id
}

export async function reorderProfiles(idsInOrder: string[]): Promise<void> {
  // TODO: PUT /api/profiles/reorder   body: { order: [...] }
}
