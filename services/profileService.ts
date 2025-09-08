// 你后续把这些函数改成真实 HTTP/WebSocket 调用；返回/入参类型可以按需细化
export type ServerCode = 'CN' | 'Global' | 'JP';

export interface ProfileDTO {
  id: string;
  name: string;
  server: ServerCode;
}

export async function listProfiles(): Promise<ProfileDTO[]> {
  // TODO: GET /api/profiles
  return []; // 返回空代表后端暂无数据；Header 会给出兜底
}

export async function createProfile(payload: { name: string; server: ServerCode }): Promise<ProfileDTO> {
  // TODO: POST /api/profiles
  // 返回后端分配的 id
  return { id: crypto.randomUUID(), name: payload.name, server: payload.server };
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
