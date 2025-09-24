import React, {useEffect, useState} from "react";
import {useApp} from "@/contexts/AppContext";
import {useTranslation} from "react-i18next";
import {FormSelect} from "@/components/ui/FormSelect";
import {Card} from "@/components/ui/Card";
import type {AppSettings} from "@/lib/types";

type TeamConfigProps = {
  onClose: () => void;
  settings?: Partial<AppSettings>;
  onChange?: (patch: Partial<AppSettings>) => Promise<void>;
};

const PROPERTY: Record<string, string> = {
  burst: "爆发",
  pierce: "贯穿",
  mystic: "神秘",
  shock: "振动",
  Unused: "未使用",
};

const MODE_DICT: Record<string, string> = {
  preset: "按预设编队",
  side: "按侧栏属性编队",
  order: "按侧栏顺序编队",
};

const COL_NUM_DICT: Record<string, number> = {
  preset_team_attribute: 4,
  side_team_attribute: 4,
};

const TeamConfig: React.FC<TeamConfigProps> = ({
                                                 onClose,
                                                 settings,
                                                 onChange,
                                               }) => {
  const {t} = useTranslation();
  const {activeProfile, updateProfile} = useApp();

  const [chooseMethod, setChooseMethod] = useState<string>(
    settings?.choose_team_method ?? "preset"
  );

  const [teamData, setTeamData] = useState<Record<string, string[][]>>({
    preset_team_attribute: Array(5).fill(Array(4).fill("Unused")),
    side_team_attribute: Array(4).fill(Array(1).fill("Unused")),
  });

  useEffect(() => {
    if (settings?.preset_team_attribute) {
      setTeamData((prev) => ({
        ...prev,
        preset_team_attribute: settings.preset_team_attribute as string[][],
      }));
    }
    if (settings?.side_team_attribute) {
      setTeamData((prev) => ({
        ...prev,
        side_team_attribute: settings.side_team_attribute as string[][],
      }));
    }
  }, [settings]);

  const handleCellChange =
    (tableKey: string, row: number, col: number) => (value: string) => {
      setTeamData((prev) => {
        const newTable = prev[tableKey].map((r, ri) =>
          ri === row ? r.map((c, ci) => (ci === col ? value : c)) : r
        );
        return {...prev, [tableKey]: newTable};
      });
    };

  const handleSave = async () => {
    const patch: Partial<AppSettings> = {
      choose_team_method: chooseMethod,
      ...teamData,
    };
    if (onChange) {
      await onChange(patch);
    } else if (activeProfile) {
      await updateProfile(activeProfile.id, {
        settings: {...activeProfile.settings, ...patch},
      });
    }
    onClose();
  };

  const renderTable = (key: string) => {
    const rows = teamData[key];
    return (
      <div
        className={`grid grid-cols-${key == 'preset_team_attribute' ? 4 : 1} gap-2 border rounded-lg p-2 bg-slate-50 dark:bg-slate-800`}>
        {rows.map((row, ri) =>
          row.map((val, ci) => (
            <FormSelect
              key={`${ri}-${ci}`}
              value={val}
              onChange={(v) => handleCellChange(key, ri, ci)(v)}
              options={Object.entries(PROPERTY).map(([k, v]) => ({
                value: k,
                label: v,
              }))}
              className="w-full"
            />
          ))
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 编队方式 */}
      <FormSelect
        label={t("team.chooseMethod")}
        value={chooseMethod}
        onChange={setChooseMethod}
        options={Object.entries(MODE_DICT).map(([k, v]) => ({
          value: k,
          label: v,
        }))}
      />

      {/* 表格区域 */}
      {chooseMethod === "preset" && renderTable("preset_team_attribute")}

      {chooseMethod === "side" && (
        <div className="space-y-4">{renderTable("side_team_attribute")}
        </div>
      )}

      {/* 保存按钮 */}
      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700"
        >
          {t("save")}
        </button>
      </div>
    </div>
  );
};

export default TeamConfig;
