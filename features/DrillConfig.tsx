import React, {useEffect, useMemo, useState} from "react";
import type {AppSettings} from "@/lib/types.ts";
import {useApp} from "@/contexts/AppContext.tsx";
import {useTranslation} from "react-i18next";
import {FormSelect} from "@/components/ui/FormSelect.tsx";
import SwitchButton from "@/components/ui/SwitchButton.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {useWebSocketStore} from "@/store/websocketStore.ts";
import {DynamicConfig} from "@/lib/type.dynamic.ts";

type DrillConfigProps = {
  onClose: () => void;
  profileId?: string;
};

const DrillConfig: React.FC<DrillConfigProps> = ({
                                                   onClose,
                                                   profileId
                                                 }) => {
  const {t} = useTranslation();
  const settings: Partial<DynamicConfig> = useWebSocketStore(state => state.configStore[profileId]);

  const party_nos = ["1", "2", "3", "4"];
  const total_assault_difficulties = ["1", "2", "3", "4"];

  // 从外部配置拿初始值
  const ext = useMemo(() => {
    return {
      drill_enable_sweep: settings.drill_enable_sweep ?? false,
      drill_fight_formation_list: Array.isArray(settings.drill_fight_formation_list)
        ? settings.drill_fight_formation_list.map(String)
        : ["1", "1", "1"],
      drill_difficulty_list: Array.isArray(settings.drill_difficulty_list)
        ? settings.drill_difficulty_list.map(String)
        : ["1", "1", "1"],
    };
  }, [settings]);

  const [draft, setDraft] = useState(ext);

  useEffect(() => {
    setDraft(ext);
  }, [ext]);

  // 更新数组选择
  const handleListChange =
    (key: "drill_fight_formation_list" | "drill_difficulty_list", idx: number) =>
      (value: string) => {
        setDraft((prev) => {
          const list = [...prev[key]];
          list[idx] = value;
          return {...prev, [key]: list};
        });
      };

  // 保存
  const handleSave = async () => {
    // const patch: Partial<AppSettings> = {
    //   drill_enable_sweep: draft.drill_enable_sweep,
    //   drill_fight_formation_list: draft.drill_fight_formation_list.map(Number),
    //   drill_difficulty_list: draft.drill_difficulty_list.map(Number),
    // };

    // if (onChange) {
    //   await onChange(patch);
    // } else if (activeProfile) {
    //   await updateProfile(activeProfile.id, {
    //     settings: {...activeProfile.settings, ...patch},
    //   });
    // }
    onClose();
  };

  return (
    <div className="space-y-2">
      {/* 开关 */}
      <SwitchButton
        label={t("drill.useAllAfterSweep")}
        checked={draft.drill_enable_sweep}
        onChange={(val) =>
          setDraft((prev) => ({...prev, drill_enable_sweep: val}))
        }
        className="w-full"
      />

      <Separator/>

      {/* 出击队伍编号 */}
      <div>
        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("drill.out_partyNo")}
        </label>
        <div className="flex items-center gap-2">
          {draft.drill_fight_formation_list.map((val, i) => (
            <React.Fragment key={i}>
              <FormSelect
                value={val}
                onChange={handleListChange("drill_fight_formation_list", i)}
                options={party_nos.map((p) => ({value: p, label: p}))}
                className="flex-1"
              />
              {i !== draft.drill_fight_formation_list.length - 1 && (
                <span className="text-slate-400">/</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 出击难度 */}
      <div>
        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("drill.difficulty")}
        </label>
        <div className="flex items-center gap-2">
          {draft.drill_difficulty_list.map((val, i) => (
            <React.Fragment key={i}>
              <FormSelect
                value={val}
                onChange={handleListChange("drill_difficulty_list", i)}
                options={total_assault_difficulties.map((d) => ({
                  value: d,
                  label: d,
                }))}
                className="flex-1"
              />
              {i !== draft.drill_difficulty_list.length - 1 && (
                <span className="text-slate-400">/</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          {t("save")}
        </button>
      </div>
    </div>
  );
};

export default DrillConfig;
