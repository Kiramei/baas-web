import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import type { AppSettings } from '@/lib/types.ts';

// 可选的新接口（从 ConfigurationPage 里传进来）
type CafeConfigProps = {
  onClose: () => void;
  profileId?: string;
  settings?: Partial<AppSettings>;
  onChange?: (patch: Partial<AppSettings>) => Promise<void>;
};

type Draft = {
  cafe_use_invitation: boolean;
  cafe_pat_rounds: number | ''; // 输入过程中允许空串
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const CafeConfig: React.FC<CafeConfigProps> = ({ onClose, profileId, settings, onChange }) => {
  const { t } = useTranslation();
  const { activeProfile, updateProfile, saveProfile } = useApp();

  // 计算“当前生效的外部设置”（优先 props.settings）
  const ext = useMemo(() => {
    const s = settings ?? activeProfile?.settings ?? {};
    return {
      cafe_use_invitation: s.cafe_use_invitation ?? true,
      cafe_pat_rounds: s.cafe_pat_rounds ?? 5,
    };
  }, [settings, activeProfile]);

  // 本地草稿
  const [draft, setDraft] = useState<Draft>({
    cafe_use_invitation: ext.cafe_use_invitation,
    cafe_pat_rounds: ext.cafe_pat_rounds,
  });

  // 外部设置变化时同步草稿（切换配置/回退等）
  useEffect(() => {
    setDraft({
      cafe_use_invitation: ext.cafe_use_invitation,
      cafe_pat_rounds: ext.cafe_pat_rounds,
    });
  }, [ext.cafe_use_invitation, ext.cafe_pat_rounds]);

  // 变更检测
  const dirty =
    draft.cafe_use_invitation !== ext.cafe_use_invitation ||
    draft.cafe_pat_rounds !== ext.cafe_pat_rounds;

  // 事件处理
  const onBoolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setDraft((d) => ({ ...d, cafe_use_invitation: checked }));
  };

  const onNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') return setDraft((d) => ({ ...d, cafe_pat_rounds: '' }));
    const n = Number(raw);
    if (Number.isFinite(n)) {
      setDraft((d) => ({ ...d, cafe_pat_rounds: clamp(Math.trunc(n), 1, 15) }));
    }
  };

  const handleSave = async () => {
    // 只提交“变更过”的字段
    const patch: Partial<AppSettings> = {};
    if (draft.cafe_use_invitation !== ext.cafe_use_invitation) {
      patch.cafe_use_invitation = draft.cafe_use_invitation;
    }
    if (draft.cafe_pat_rounds !== ext.cafe_pat_rounds && draft.cafe_pat_rounds !== '') {
      patch.cafe_pat_rounds = draft.cafe_pat_rounds as number;
    }

    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }

    // 优先走父级提供的 onChange（新架构）
    if (onChange) {
      await onChange(patch);
    } else if (activeProfile) {
      // 兼容旧架构：两种方式都支持
      // 方式 A（推荐）：调用 Context 的 updateProfile 做合并保存
      await updateProfile(activeProfile.id, { settings: { ...activeProfile.settings, ...patch } });
      // 方式 B（你原来的 saveProfile，若还需要完整落库）
      // await saveProfile({ ...activeProfile, settings: { ...activeProfile.settings, ...patch } });
    }
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <label htmlFor="cafe_use_invitation" className="text-slate-700 dark:text-slate-200 font-medium">
          {t('cafe.useInvitation')}
        </label>
        <input
          id="cafe_use_invitation"
          name="cafe_use_invitation"
          type="checkbox"
          className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
          checked={draft.cafe_use_invitation}
          onChange={onBoolChange}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="cafe_pat_rounds" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t('cafe.patRounds')}
        </label>
        <input
          id="cafe_pat_rounds"
          name="cafe_pat_rounds"
          type="number"
          className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          value={draft.cafe_pat_rounds}
          onChange={onNumberChange}
          min={1}
          max={15}
        />
        <p className="text-sm text-slate-500">{t('cafe.patRoundsDesc')}</p>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={handleSave}
          disabled={!dirty || draft.cafe_pat_rounds === ''}
          className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60"
        >
          {t('save')}
        </button>
      </div>
    </div>
  );
};

export default CafeConfig;
