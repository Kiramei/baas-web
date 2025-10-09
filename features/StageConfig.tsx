import React, {useEffect, useMemo, useState} from "react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {FormInput} from "@/components/ui/FormInput";
import SwitchButton from "@/components/ui/SwitchButton";
import CButton from "@/components/ui/CButton.tsx";
import {Card} from "@/components/ui/Card";
import {useTranslation} from "react-i18next";
import type {AppSettings} from "@/lib/types";
import {useApp} from "@/contexts/AppContext";
import {Separator} from "@/components/ui/separator.tsx";
import {useWebSocketStore} from "@/store/websocketStore.ts";
import {DynamicConfig} from "@/lib/type.dynamic.ts";
import {serverMap} from "@/lib/utils.ts";

type StageConfigProps = {
  profileId: string;
  onClose: () => void;
};

const PROPERTY_MAP: Record<string, string> = {
  burst: "爆发",
  pierce: "贯穿",
  mystic: "神秘",
  shock: "振动",
  Unused: "未使用",
};

interface Draft {
  manual_boss: boolean;
  explore_normal_task_list: string;
  explore_hard_task_list: string;
}

const StageConfig: React.FC<StageConfigProps> = (
    {
      profileId,
      onClose
    }
  ) => {
    const {t} = useTranslation();

    const staticConfig = useWebSocketStore(state => state.staticStore);
    const settings: Partial<DynamicConfig> = useWebSocketStore(state => state.configStore[profileId]);
    const modify = useWebSocketStore(state => state.modify);

    const ext = useMemo<Draft>(() => {
      return {
        manual_boss: settings.manual_boss,
        explore_normal_task_list: settings.explore_normal_task_list,
        explore_hard_task_list: settings.explore_hard_task_list,
      } as Draft;
    }, [settings]);

    const [draft, setDraft] = useState<Draft>(ext);
    const dirty = JSON.stringify(draft) !== JSON.stringify(ext);

    // mock 活动数据（真实数据应从 config.static_config 或接口获取）
    const eventName = staticConfig.current_game_activity[serverMap[settings.server]] ?? t("stage.noEvent");
    const [eventTable, setEventTable] = useState<[string, string][]>([
      ["故事1", PROPERTY_MAP.burst],
      ["任务1", PROPERTY_MAP.pierce],
      ["挑战1", PROPERTY_MAP.mystic],
      ["故事2", PROPERTY_MAP.shock],
    ]);

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
    }


    const handleChange = (key: keyof Draft) => (value: any) => {
      setDraft(prev => ({...prev, [key]: value}));
    }


    return (
      <div>
        <Tabs defaultValue="explore" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="explore">{t("stage.exploreTab")}</TabsTrigger>
            <TabsTrigger value="event">{t("stage.eventTab")}</TabsTrigger>
          </TabsList>

          {/* 普通推图 */}
          <TabsContent value="explore" className="space-y-2">
            <SwitchButton
              label={t("stage.manualBoss")}
              checked={draft.manual_boss}
              onChange={handleChange("manual_boss")}
              className="w-full"
            />

            <Separator/>

            <div className="w-full flex flex-row gap-2 items-end">
              <FormInput
                label={t("stage.normalTask")}
                value={draft.explore_normal_task_list}
                onChange={(e) => handleChange("explore_hard_task_list")(e.target.value)}
                placeholder={t("placeholder.config.insert")}
                className="flex-1"
              />
              <CButton
                onClick={() => console.log("开始普通关任务", draft.explore_normal_task_list)}
                className="h-9"
              >
                {t("execute")}
              </CButton>
            </div>

            <div className="w-full flex flex-row gap-2 items-end">
              <FormInput
                label={t("stage.hardTask")}
                value={draft.explore_hard_task_list}
                onChange={(e) => handleChange("explore_hard_task_list")(e.target.value)}
                placeholder={t("placeholder.config.insert")}
                className="flex-1"
              />

              <CButton
                onClick={() => console.log("开始困难关任务", draft.explore_hard_task_list)}
                className="h-9"
              >
                {t("execute")}
              </CButton>
            </div>

          </TabsContent>

          {/* 活动推图 */}
          <TabsContent value="event" className="space-y-4">
            <Card className="p-3">
              <p className="text-sm">
                {t("stage.currentEvent")}: <b>{eventName}</b>
              </p>
            </Card>

            <div className="flex gap-2 w-full">
              <CButton className="flex-1" onClick={() => console.log("推故事")}>{t("stage.story")}</CButton>
              <CButton className="flex-1" onClick={() => console.log("推任务")}>{t("stage.mission")}</CButton>
              <CButton className="flex-1" onClick={() => console.log("推挑战")}>{t("stage.challenge")}</CButton>
            </div>

            <div>
              <p className="mb-2">{t("stage.attrTable")}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {eventTable.map(([stage, attr], i) => (
                  <Card key={i} className="p-2 flex justify-between">
                    <span>{stage}</span>
                    <span className="font-medium">{attr}</span>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* 保存按钮 */}
        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
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
  }
;

export default StageConfig;
