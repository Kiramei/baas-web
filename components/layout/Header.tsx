import React from 'react';
import {useTranslation} from 'react-i18next';
import {useApp} from '@/contexts/AppContext';
import {ChevronLeft, ChevronRight, FilePlus2, Loader2, Pencil, Trash2, X} from 'lucide-react';
import {AnimatePresence, motion, Reorder} from 'framer-motion';
import {
  createProfile, DEFAULT_CONFIG,
  deleteProfile as apiDelete,
  listProfiles,
  type ProfileDTO,
  reorderProfiles,
  type ServerCode,
  updateProfile
} from '@/services/profileService';
import {AppSettings} from "@/lib/types.ts";

// 小工具：去抖，避免拖拽过程中频繁打后端
const useDebounce = <T, >(fn: (arg: T) => void, ms = 300) => {
  const t = React.useRef<number | null>(null);
  return React.useCallback((arg: T) => {
    if (t.current) window.clearTimeout(t.current);
    t.current = window.setTimeout(() => fn(arg), ms);
  }, [fn, ms]);
};

// 用于隐藏滚动条的辅助 class（如果你没有 scrollbar 插件）
const noScrollbarStyle = '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

type Tab = ProfileDTO;

const Header: React.FC = () => {
  const {t} = useTranslation();
  const {activeProfile, setActiveProfile} = useApp();

  // Tabs（配置）本地状态；从后端拉取为准
  const [tabs, setTabs] = React.useState<Tab[]>([]);
  const [_, setLoading] = React.useState(false);

  // 溢出滚动控制
  const stripRef = React.useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = React.useState({left: false, right: false});
  const updateScrollButtons = React.useCallback(() => {
    const el = stripRef.current;
    if (!el) return;
    setCanScroll({
      left: el.scrollLeft > 0,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1
    });
  }, []);
  React.useEffect(() => {
    updateScrollButtons();
    const el = stripRef.current;
    if (!el) return;
    const onResize = () => updateScrollButtons();
    const onScroll = () => updateScrollButtons();
    window.addEventListener('resize', onResize);
    el.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      window.removeEventListener('resize', onResize);
      el.removeEventListener('scroll', onScroll as any);
    };
  }, [updateScrollButtons]);

  const scrollBy = (dx: number) => {
    stripRef.current?.scrollBy({left: dx, behavior: 'smooth'});
  };

  // 右键菜单
  const [ctxMenu, setCtxMenu] = React.useState<{ x: number; y: number; tab?: Tab } | null>(null);

  // 对话框：新建 / 编辑
  const [editor, setEditor] = React.useState<null | { mode: 'create' | 'edit'; tab?: Tab }>(null);
  // 对话框：删除确认
  const [confirmDelete, setConfirmDelete] = React.useState<null | Tab>(null);

  const hideCtxMenu = () => setCtxMenu(null);

  // 打开时列出配置（第 5 点：列出配置）
  React.useEffect(() => {

    (async () => {
      setLoading(true);
      try {
        const list = await listProfiles();
        if (list.length) {
          setTabs(list);
          // activeProfile 不存在或不在列表里，就切到第一个
          const exists = list.find(p => p.id === activeProfile?.id);
          setActiveProfile(exists ?? list[0]);
          setTimeout(() => {
            // 滚动使激活 tab 可见
            const el = document.getElementById(`tab-${(exists ?? list[0]).id}`);
            el?.scrollIntoView({behavior: 'smooth', inline: 'center', block: 'nearest'});
          }, 0);
        } else {
          // 后端为空时，给个兜底（创建一个默认配置，但不立刻打后端）
          const fallback: Tab = {
            id: crypto.randomUUID(),
            name: t('defaultProfile') || 'Default',
            server: 'CN' as ServerCode,
            settings: {
              server: 'CN',
              adbIP: '127.0.0.1',
              adbPort: '16384',
              open_emulator_stat: true
            } as AppSettings
          };
          setTabs([fallback]);
          setActiveProfile(fallback);
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 拖拽排序（第 7 点）
  const debouncedPersistOrder = useDebounce((tabsNow: Tab[]) => {
    reorderProfiles(tabsNow.map(t => t.id)).catch(() => {
    });
  }, 500);

  const onReorder = (next: Tab[]) => {
    setTabs(next);
    debouncedPersistOrder(next);
  };

  const onSelect = (tab: Tab) => {
    setActiveProfile(tab);
    // 确保选中项出现在视野内
    const el = document.getElementById(`tab-${tab.id}`);
    el?.scrollIntoView({behavior: 'smooth', inline: 'center', block: 'nearest'});
  };

  // 新建配置（第 5/6 点）
  const handleCreate = async (name: string, server: ServerCode) => {
    // 重名校验
    if (tabs.some(t => t.name.trim() === name.trim())) throw new Error(t('nameExists') || 'Name already exists');
    const created = await createProfile({name: name.trim(), server, settings: DEFAULT_CONFIG});
    setTabs(prev => [...prev, created]);
    setActiveProfile(created);
    // 轻微“出现”动画由 motion 在 Tab 上处理（mount 时从 0→1）
    setTimeout(() => {
      const el = document.getElementById(`tab-${created.id}`);
      el?.scrollIntoView({behavior: 'smooth', inline: 'center', block: 'nearest'});
    }, 0);
  };

  // 编辑配置（第 5 点：修改配置）
  const handleEdit = async (id: string, name: string, server: ServerCode) => {
    const trimmed = name.trim();
    if (tabs.some(t => t.id !== id && t.name.trim() === trimmed)) throw new Error(t('nameExists') || 'Name already exists');
    await updateProfile(id, {name: trimmed, server});
    setTabs(prev => prev.map(t => t.id === id ? {...t, name: trimmed, server} : t));
    if (activeProfile?.id === id) setActiveProfile({...activeProfile, name: trimmed});
  };

  // 删除配置（第 2/5 点）
  const handleDelete = async (tab: Tab) => {
    if (tabs.length <= 1) {
      alert(t('cannotDeleteLast') || 'Cannot delete the last profile.');
      return;
    }
    await apiDelete(tab.id);
    setTabs(prev => {
      const idx = prev.findIndex(p => p.id === tab.id);
      const next = prev.filter(p => p.id !== tab.id);
      // 如果删的是当前激活，跳到相邻可用配置
      if (activeProfile?.id === tab.id) {
        const neighbor = next[Math.max(0, Math.min(idx, next.length - 1))];
        if (neighbor) setActiveProfile(neighbor);
      }
      return next;
    });
  };
  // 关闭右键菜单
  React.useEffect(() => {


    window.addEventListener('click', hideCtxMenu);
    // window.addEventListener('contextmenu', hide);
    return () => {
      window.removeEventListener('click', hideCtxMenu);
      window.removeEventListener('contextmenu', hideCtxMenu);
    };
  }, []);

  return (
    <header
      className="h-16 flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center px-3">
      {/* 左侧：滚动控制 */}
      <div className="flex items-center gap-1 mr-2">
        <button
          className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${!canScroll.left ? 'opacity-40 pointer-events-none' : ''}`}
          onClick={() => scrollBy(-200)}
          aria-label="scroll-left"
        >
          <ChevronLeft className="w-5 h-5"/>
        </button>
        <button
          className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${!canScroll.right ? 'opacity-40 pointer-events-none' : ''}`}
          onClick={() => scrollBy(200)}
          aria-label="scroll-right"
        >
          <ChevronRight className="w-5 h-5"/>
        </button>
      </div>

      {/* 中间：标签条 */}
      <div ref={stripRef} className={`flex-1 overflow-x-auto ${noScrollbarStyle}`}>
        <Reorder.Group
          axis="x"
          values={tabs}
          onReorder={onReorder}
          className="flex items-stretch h-10 gap-1"
        >
          <AnimatePresence initial={false}>
            {tabs.map((tab) => {
              const active = activeProfile?.id === tab.id;
              return (
                <Reorder.Item
                  id={`tab-${tab.id}`}
                  key={tab.id}
                  value={tab}
                  layout
                  whileDrag={{scale: 1.1}}
                  className={`group relative flex items-center max-w-xs shrink-0 rounded-lg px-3 h-10 select-none
                              border transition-colors cursor-pointer
                              ${active
                    ? 'bg-primary-900/15 dark:bg-slate-700/60 border-slate-300 dark:border-slate-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'}
                            `}
                  onPointerDown={(e) => {
                    // 中键关闭（浏览器行为）
                    if ((e as any).button === 1) {
                      e.preventDefault();
                      setConfirmDelete(tab);
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setCtxMenu({x: e.clientX, y: e.clientY, tab});
                  }}
                  onClick={() => onSelect(tab)}
                >

                  {/* 左侧运行中图标 */}
                  {(
                    false &&
                    <Loader2 className="w-4 h-4 mr-2 text-primary-500 animate-spin"/>
                  )}

                  {/* 标题（配置名） */}
                  <motion.span
                    className="truncate pr-5"
                    layout
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                  >
                    {tab.name}
                  </motion.span>

                  {/* 关闭按钮 */}
                  <button
                    title={t('delete') || 'Delete'}
                    className="absolute right-1 p-1 rounded opacity-60 hover:opacity-100 hover:bg-slate-200/70 dark:hover:bg-slate-700/70"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(tab);
                    }}
                  >
                    <X className="w-3.5 h-3.5"/>
                  </button>
                </Reorder.Item>
              );
            })}
          </AnimatePresence>
        </Reorder.Group>
      </div>

      {/* 右侧：新建按钮 */}
      <div className="ml-3">
        <button
          onClick={() => setEditor({mode: 'create'})}
          className="flex items-center px-3 h-9 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          <FilePlus2 className="w-4 h-4 mr-2"/>
          {t('addProfile')}
        </button>
      </div>

      {/* 右键菜单 */}
      <AnimatePresence>
        {ctxMenu && ctxMenu.tab && (
          <motion.div
            initial={{opacity: 0, scale: 0.96}}
            animate={{opacity: 1, scale: 1}}
            exit={{opacity: 0, scale: 0.96}}
            transition={{type: 'tween', duration: 0.12}}
            className="fixed z-50 min-w-[160px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg py-1"
            style={{top: ctxMenu.y + 2, left: ctxMenu.x + 2}}
          >
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={() => {
                setEditor({mode: 'edit', tab: ctxMenu.tab!});
                setCtxMenu(null);
              }}
            >
              <Pencil className="w-4 h-4"/> {t('rename') || 'Edit'}
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={() => {
                setConfirmDelete(ctxMenu.tab!);
                setCtxMenu(null);
              }}
            >
              <Trash2 className="w-4 h-4"/> {t('delete') || 'Delete'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 编辑/新建 Modal */}
      <ProfileEditorModal
        open={!!editor}
        mode={editor?.mode || 'create'}
        initial={editor?.tab || null}
        onClose={() => setEditor(null)}
        onSubmit={async (vals) => {
          if (editor?.mode === 'create') {
            await handleCreate(vals.name, vals.server);
          } else if (editor?.mode === 'edit' && editor?.tab) {
            await handleEdit(editor.tab.id, vals.name, vals.server);
          }
          setEditor(null);
        }}
        // 重名校验（本地）
        checkName={(name, selfId) => tabs.some(t => t.id !== selfId && t.name.trim() === name.trim())}
      />

      {/* 删除确认 Modal（第 2 点，带图标） */}
      <ConfirmDeleteModal
        open={!!confirmDelete}
        name={confirmDelete?.name || ''}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (confirmDelete) await handleDelete(confirmDelete);
          setConfirmDelete(null);
        }}
        disabled={tabs.length <= 1}
      />
    </header>
  );
};

export default Header;

/** ---------------- 辅助组件（Modal） ---------------- */

const overlayCls = "fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50";

function ProfileEditorModal(props: {
  open: boolean;
  mode: 'create' | 'edit';
  initial: ProfileDTO | null;
  onClose: () => void;
  onSubmit: (vals: { name: string; server: ServerCode }) => Promise<void>;
  checkName: (name: string, selfId?: string) => boolean;
}) {
  const {t} = useTranslation();
  const [name, setName] = React.useState(props.initial?.name ?? '');
  const [server, setServer] = React.useState<ServerCode>(props.initial?.server ?? 'CN');
  const [err, setErr] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (props.open) {
      setName(props.initial?.name ?? '');
      setServer(props.initial?.server ?? 'CN');
      setErr(null);
    }
  }, [props.open, props.initial]);

  const handleSubmit = async () => {
    const nm = name.trim();
    if (!nm) return setErr(t('nameRequired') || 'Name is required');
    if (props.checkName(nm, props.initial?.id)) return setErr(t('nameExists') || 'Name already exists');
    try {
      setSubmitting(true);
      await props.onSubmit({name: nm, server});
    } catch (e: any) {
      setErr(e?.message || t('saveFailed') || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!props.open) return null;
  return (
    <div className={overlayCls} onMouseDown={(e) => {
      if (e.target === e.currentTarget) props.onClose();
    }}>
      <motion.div
        initial={{opacity: 0, y: 12, scale: 0.98}}
        animate={{opacity: 1, y: 0, scale: 1}}
        exit={{opacity: 0, y: 12, scale: 0.98}}
        transition={{duration: 0.18, type: 'tween', ease: 'easeOut'}}
        className="w-[420px] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="text-lg font-semibold mb-4">
          {props.mode === 'create' ? (t('createProfile') || 'Create Profile') : (t('editProfile') || 'Edit Profile')}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              {t('profileName') || 'Profile Name'}
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder={t('profileName') || 'Profile Name'}
            />
          </div>

          {/* 你的服务器下拉（原样整合） */}
          <div>
            <label htmlFor="server" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              {t('server.server')}
            </label>
            <select
              id="server"
              name="server"
              value={server}
              onChange={(e) => setServer(e.target.value as ServerCode)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="CN">{t('server.cn')}</option>
              <option value="Global">{t('server.global')}</option>
              <option value="JP">{t('server.jp')}</option>
            </select>
          </div>

          {err && <div className="text-red-600 text-sm">{err}</div>}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={props.onClose}
            className="px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
            disabled={submitting}
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
            disabled={submitting}
          >
            {props.mode === 'create' ? (t('create') || 'Create') : (t('save') || 'Save')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ConfirmDeleteModal(props: {
  open: boolean;
  name: string;
  disabled?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  const {t} = useTranslation();
  if (!props.open) return null;
  return (
    <div className={overlayCls} onMouseDown={(e) => {
      if (e.target === e.currentTarget) props.onCancel();
    }}>
      <motion.div
        initial={{opacity: 0, y: 8}}
        animate={{opacity: 1, y: 0}}
        exit={{opacity: 0, y: 8}}
        transition={{duration: 0.16}}
        className="w-[420px] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="mt-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 p-2">
            <Trash2 className="w-5 h-5"/>
          </div>
          <div className="flex-1">
            <div className="text-lg font-semibold">{t('confirmDeleteTitle') || 'Delete configuration?'}</div>
            <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {t('confirmDeleteMessage', {name: props.name}) || `Are you sure you want to delete "${props.name}"?`}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={props.onCancel}
            className="px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            {t('cancel')}
          </button>
          <button
            onClick={props.onConfirm}
            disabled={props.disabled}
            className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
          >
            {t('delete')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
