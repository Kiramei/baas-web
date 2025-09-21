import React, {useEffect, useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import {useApp} from "@/contexts/AppContext";
import type {AppSettings} from "@/lib/types.ts";
import {X} from "lucide-react";
import StudentSelectorModal from "@/components/StudentSelectorModal.tsx";
import { FormSelect } from "@/components/ui/FormSelect";
import { FormInput } from "@/components/ui/FormInput";
import { stat } from "fs";

// 学生结构
type Student = {
  CN_name: string;
  Global_name: string;
  JP_name: string;
  CN_implementation: boolean;
  Global_implementation: boolean;
  JP_implementation: boolean;
};

// props 定义
type CafeConfigProps = {
  onClose: () => void;
  profileId?: string;
  settings?: Partial<AppSettings>;
  onChange?: (patch: Partial<AppSettings>) => Promise<void>;
  studentNames?: Student[]; // 外部传入学生列表
};

// 草稿定义
type Draft = {
  cafe_collect_reward: boolean;
  cafe_use_invitation: boolean;
  cafe_exchange_student: boolean;
  cafe_duplicate_invite: boolean;
  cafe_has_no2_cafe: boolean;
  cafe_pat_rounds: number | "";
  pat_style: string;
  cafe_invite1_criterion: string;
  cafe_invite2_criterion: string;
  cafe_invite1_starred_position: string;
  cafe_invite2_starred_position: string;
  favorStudent1: string[];
  favorStudent2: string[];
};

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));


/* ---------- 主组件 ---------- */
const CafeConfig: React.FC<CafeConfigProps> = ({
                                                 onClose,
                                                 profileId,
                                                 settings,
                                                 onChange
                                               }) => {
  const { staticConfig } = useApp();
  const studentNames = staticConfig.student_names
  const {t} = useTranslation();
  const {activeProfile, updateProfile} = useApp();

  // 外部设置
  const ext = useMemo(() => {
    const s = settings ?? activeProfile?.settings ?? {};
    return {
      cafe_collect_reward: s.cafe_collect_reward ?? false,
      cafe_use_invitation: s.cafe_use_invitation ?? true,
      cafe_exchange_student: s.cafe_exchange_student ?? true,
      cafe_duplicate_invite: s.cafe_duplicate_invite ?? false,
      cafe_has_no2_cafe: s.cafe_has_no2_cafe ?? false,
      cafe_pat_rounds: s.cafe_pat_rounds ?? 5,
      pat_style: s.pat_style ?? "普通",
      cafe_invite1_criterion: s.cafe_invite1_criterion ?? "lowest_affection",
      cafe_invite2_criterion: s.cafe_invite2_criterion ?? "lowest_affection",
      cafe_invite1_starred_position: String(
        s.cafe_invite1_starred_position ?? "1"
      ),
      cafe_invite2_starred_position: String(
        s.cafe_invite2_starred_position ?? "1"
      ),
      favorStudent1: s.favorStudent1 ?? [],
      favorStudent2: s.favorStudent2 ?? [],
    };
  }, [settings, activeProfile]);

  const [draft, setDraft] = useState<Draft>(ext);
  const [showSelector1, setShowSelector1] = useState(false);
  const [showSelector2, setShowSelector2] = useState(false);

  useEffect(() => setDraft(ext), [ext]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(ext);

  // 通用布尔
  const onBoolChange = (key: keyof Draft) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setDraft((d) => ({...d, [key]: e.target.checked}));

  // 数字输入
  const onNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") return setDraft((d) => ({...d, cafe_pat_rounds: ""}));
    const n = Number(raw);
    if (Number.isFinite(n)) {
      setDraft((d) => ({...d, cafe_pat_rounds: clamp(Math.trunc(n), 4, 15)}));
    }
  };

  // 下拉
  // const onSelectChange = (key: keyof Draft) =>
  //   (e: React.ChangeEvent<HTMLSelectElement>) =>
  //     setDraft((d) => ({...d, [key]: e.target.value}));

  const onSelectChange = (key: string) => (value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  // 保存
  const handleSave = async () => {
    const patch: Partial<AppSettings> = {};
    (Object.keys(draft) as (keyof AppSettings)[]).forEach((k) => {
      if (draft[k] !== ext[k]) {
        patch[k] = draft[k] as AppSettings[typeof k];
      }
    });

    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }

    if (onChange) {
      await onChange(patch);
    } else if (activeProfile) {
      await updateProfile(activeProfile.id, {
        settings: {...activeProfile.settings, ...patch},
      });
    }
    onClose();
  };

  return (
    <div className="space-y-6">
      {/* 基础开关 */}
      {[
        ["cafe_collect_reward", "cafe.collectReward"],
        ["cafe_use_invitation", "cafe.useInvitation"],
        ["cafe_exchange_student", "cafe.exchangeStudent"],
        ["cafe_duplicate_invite", "cafe.duplicateInvite"],
        ["cafe_has_no2_cafe", "cafe.hasNo2Cafe"],
      ].map(([key, label]) => (
        <div
          key={key}
          className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
        >
          <label className="font-medium">{t(label)}</label>
          <input
            type="checkbox"
            checked={draft[key as keyof Draft] as boolean}
            onChange={onBoolChange(key as keyof Draft)}
          />
        </div>
      ))}

      {/* 摸头轮数 */}
      <FormInput
        label={t("cafe.patRounds")}
        type="number"
        value={draft.cafe_pat_rounds}
        onChange={onNumberChange}
        min={4}
        max={15}
      />



      <FormSelect
        label={t("cafe.patStyle")}
        value={draft.pat_style}
        onChange={onSelectChange("pat_style")}
        options={[
          { value: "普通", label: t("cafe.patStyleNormal") },
          { value: "拖动礼物", label: t("cafe.patStyleDragGift") },
        ]}
      />


      {/* 咖啡厅1 邀请模式 */}

      <FormSelect
        label={t("cafe.invite1Mode")}
        value={draft.cafe_invite1_criterion}
        onChange={onSelectChange("cafe_invite1_criterion")}
        options={[
          { value: "lowest_affection", label: t("cafe.lowestAffection") },
          { value: "highest_affection", label: t("cafe.highestAffection") },
          { value: "starred", label: t("cafe.starred") },
          { value: "name", label: t("cafe.byName") },
        ]}
      />

      {draft.cafe_invite1_criterion === "starred" && (
        <FormSelect
          label={t("cafe.starredPosition")}
          value={draft.cafe_invite1_starred_position}
          onChange={onSelectChange("cafe_invite1_starred_position")}
          options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))}
        />
      )}

      {/* 指定学生 (咖啡厅1) */}
      {draft.cafe_invite1_criterion === "name" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">咖啡厅1 指定学生</label>
          <div className="flex flex-wrap gap-2">
            {draft.favorStudent1.map((name) => (
              <span
                key={name}
                className="flex items-center gap-1 px-2 py-1 bg-slate-200 rounded-full text-sm dark:bg-slate-700"
              >
                {name}
                <button
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      favorStudent1: d.favorStudent1.filter((n) => n !== name),
                    }))
                  }
                >
                  <X className="w-3 h-3"/>
                </button>
              </span>
            ))}
            <button
              onClick={() => setShowSelector1(true)}
              className="px-3 py-1 text-sm border rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              {t('Add Student')}
            </button>
          </div>
        </div>
      )}

      {/* 咖啡厅2 邀请模式 */}
      {draft.cafe_has_no2_cafe && (
        <FormSelect
          label={t("cafe.invite2Mode")}
          value={draft.cafe_invite2_criterion}
          onChange={onSelectChange("cafe_invite2_criterion")}
          options={[
            { value: "lowest_affection", label: t("cafe.lowestAffection") },
            { value: "highest_affection", label: t("cafe.highestAffection") },
            { value: "starred", label: t("cafe.starred") },
            { value: "name", label: t("cafe.byName") },
          ]}
        />
      )}

      {draft.cafe_invite2_criterion === "starred" && (
        <FormSelect
          label={t("cafe.starredPosition")}
          value={draft.cafe_invite2_starred_position}
          onChange={onSelectChange("cafe_invite2_starred_position")}
          options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))}
        />
      )}

      {/* 指定学生 (咖啡厅2) */}
      {draft.cafe_has_no2_cafe && draft.cafe_invite2_criterion === "name" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">咖啡厅2 指定学生</label>
          <div className="flex flex-wrap gap-2">
            {draft.favorStudent2.map((name) => (
              <span
                key={name}
                className="flex items-center gap-1 px-2 py-1 bg-slate-200 rounded-full text-sm"
              >
                {name}
                <button
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      favorStudent2: d.favorStudent2.filter((n) => n !== name),
                    }))
                  }
                >
                  <X className="w-3 h-3"/>
                </button>
              </span>
            ))}
            <button
              onClick={() => setShowSelector2(true)}
              className="px-3 py-1 text-sm border rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              {t('Add Student')}
            </button>
          </div>
        </div>
      )}

      {/* Modal 集成 */}
      <StudentSelectorModal
        isOpen={showSelector1}
        onClose={() => setShowSelector1(false)}
        allStudents={studentNames}
        selected={draft.favorStudent1}
        onChange={(list) => setDraft((d) => ({...d, favorStudent1: list}))}
        lang="JP"
        mode="multiple"
      />

      <StudentSelectorModal
        isOpen={showSelector2}
        onClose={() => setShowSelector2(false)}
        allStudents={studentNames}
        selected={draft.favorStudent2}
        onChange={(list) => setDraft((d) => ({...d, favorStudent2: list}))}
        lang="JP"
        mode="multiple"
      />

      {/* 保存按钮 */}
      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={!dirty || draft.cafe_pat_rounds === ""}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-60"
        >
          {t("save")}
        </button>
      </div>
    </div>
  );
};

export default CafeConfig;
