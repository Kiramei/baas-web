import React, {useEffect, useState} from "react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {FormInput} from "@/components/ui/FormInput";
import SwitchButton from "@/components/ui/SwitchButton";
import Button from "@/components/ui/Button";
import {Card} from "@/components/ui/Card";
import {useTranslation} from "react-i18next";
import type {AppSettings} from "@/lib/types";
import {useApp} from "@/contexts/AppContext";
import {Separator} from "@/components/ui/separator.tsx";

type StageConfigProps = {
  onClose: () => void;
  settings?: Partial<AppSettings>;
  onChange?: (patch: Partial<AppSettings>) => Promise<void>;
};

const PROPERTY_MAP: Record<string, string> = {
  burst: "爆发",
  pierce: "贯穿",
  mystic: "神秘",
  shock: "振动",
  Unused: "未使用",
};

const StageConfig: React.FC<StageConfigProps> = ({
                                                   onClose,
                                                   settings,
                                                   onChange,
                                                 }) => {
  const {t} = useTranslation();
  const {activeProfile, updateProfile, staticConfig} = useApp();

  const [manualBoss, setManualBoss] = useState<boolean>(
    settings?.manual_boss ?? false
  );
  const [normalTask, setNormalTask] = useState<string>(
    settings?.explore_normal_task_list ?? ""
  );
  const [hardTask, setHardTask] = useState<string>(
    settings?.explore_hard_task_list ?? ""
  );

  // mock 活动数据（真实数据应从 config.static_config 或接口获取）
  const [eventName, setEventName] = useState<string>("夏日祭活动");
  const [eventTable, setEventTable] = useState<[string, string][]>([
    ["故事1", PROPERTY_MAP.burst],
    ["任务1", PROPERTY_MAP.pierce],
    ["挑战1", PROPERTY_MAP.mystic],
    ["故事2", PROPERTY_MAP.shock],
  ]);

  const handleSave = async () => {
    const patch: Partial<AppSettings> = {
      manual_boss: manualBoss,
      explore_normal_task_list: normalTask,
      explore_hard_task_list: hardTask,
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
            checked={manualBoss}
            onChange={setManualBoss}
            className="w-full"
          />

          <Separator/>

          <div className="w-full flex flex-row gap-2 items-end">
            <FormInput
              label={t("stage.normalTask")}
              value={normalTask}
              onChange={(e) => setNormalTask(e.target.value)}
              placeholder={t("placeholder.config.insert")}
              className="flex-1"
            />
            <Button
              onClick={() => console.log("开始普通关任务", normalTask)}
              className="h-9"
            >
              {t("execute")}
            </Button>
          </div>

          <div className="w-full flex flex-row gap-2 items-end">
            <FormInput
              label={t("stage.hardTask")}
              value={hardTask}
              onChange={(e) => setHardTask(e.target.value)}
              placeholder={t("placeholder.config.insert")}
              className="flex-1"
            />

            <Button
              onClick={() => console.log("开始困难关任务", hardTask)}
              className="h-9"
            >
              {t("execute")}
            </Button>
          </div>

        </TabsContent>

        {/* 活动推图 */}
        <TabsContent value="event" className="space-y-4">
          <Card className="p-3">
            <p className="text-sm">
              {t("stage.currentEvent")}: <b>{eventName}</b>
            </p>
          </Card>

          <div className="flex gap-2">
            <Button onClick={() => console.log("推故事")}>{t("stage.story")}</Button>
            <Button onClick={() => console.log("推任务")}>{t("stage.mission")}</Button>
            <Button onClick={() => console.log("推挑战")}>{t("stage.challenge")}</Button>
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
          className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700"
        >
          {t("save")}
        </button>
      </div>
    </div>
  );
};

export default StageConfig;
