import React, {useEffect, useMemo, useState} from "react";
import {useApp} from "@/contexts/AppContext";
import {useTranslation} from "react-i18next";
import {FormSelect} from "@/components/ui/FormSelect";
import type {AppSettings} from "@/lib/types";
import {DynamicConfig} from "@/lib/type.dynamic.ts";
import {useWebSocketStore} from "@/store/websocketStore.ts";

type TeamConfigProps = {
  profileId: string;
  onClose: () => void;
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

interface Draft {
  choose_team_method: string,
  side_team_attribute: string[][],
  preset_team_attribute: string[][],
}

const TeamConfig: React.FC<TeamConfigProps> = (
  {
    profileId,
    onClose
  }
) => {
  const {t} = useTranslation();

  const settings: Partial<DynamicConfig> = useWebSocketStore(state => state.configStore[profileId]);
  const modify = useWebSocketStore(state => state.modify);

  const ext = useMemo<Draft>(() => {
    return {
      choose_team_method: settings.choose_team_method,
      side_team_attribute: settings.side_team_attribute,
      preset_team_attribute: settings.preset_team_attribute
    } as Draft;
  }, [settings]);

  const [draft, setDraft] = useState<Draft>(ext);

  const dirty = JSON.stringify(draft) !== JSON.stringify(ext);

  const handleCellChange =
    (tableKey: string, row: number, col: number) => (value: string) => {
      setDraft((prev) => {
        const newTable = prev[tableKey].map((r, ri) =>
          ri === row ? r.map((c, ci) => (ci === col ? value : c)) : r
        );
        return {...prev, [tableKey]: newTable};
      });
    };

  const handleChange = (key: string) => (value: string) => {
    setDraft((d) => ({...d, [key]: value}))
  };

  const handleSave = async () => {
    const patch: Partial<AppSettings> = {};
    (Object.keys(draft) as (keyof Draft)[]).forEach((k) => {
      if (JSON.stringify(draft[k]) !== JSON.stringify(ext[k])) {
        (patch as any)[k] = draft[k];
      }
    });

    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }
    modify(`${profileId}::config`, patch)

    onClose();
  };

  const renderTable = (key: string) => {
    const rows = draft[key];
    const cols = key == 'preset_team_attribute' ? 4 : 1;
    return (
      <div
        className={`grid gap-2 border rounded-lg p-2 bg-slate-50 dark:bg-slate-800`}
        style={
          {
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
          }
        }
      >
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
        value={draft.choose_team_method}
        onChange={handleChange("choose_team_method")}
        options={Object.entries(MODE_DICT).map(([k, v]) => ({
          value: k,
          label: v,
        }))}
      />

      {/* 表格区域 */}
      {draft.choose_team_method === "preset" && renderTable("preset_team_attribute")}

      {draft.choose_team_method === "side" && (
        <div className="space-y-4">{renderTable("side_team_attribute")}
        </div>
      )}

      {/* 保存按钮 */}
      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={handleSave}
          disabled={!dirty}
          className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-60"
        >
          {t("save")}
        </button>
      </div>
    </div>
  );
};

export default TeamConfig;
