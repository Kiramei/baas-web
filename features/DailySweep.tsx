import React, {useState, useEffect, useMemo} from "react";
import {useTranslation} from "react-i18next";
import {useApp} from "@/contexts/AppContext";
import type {AppSettings} from "@/lib/types.ts";
import {BadgeQuestionMark} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

// 假定后端提供这个函数：把字符串转成任务
// 这里先写个 mock（你可以替换成实际 import）
function readTask(str: string, isNormal: boolean) {
  // 示例： "1-1-3" => { stage: "1-1", times: 3, type: "normal" }
  const parts = str.split("-");
  return {
    stage: parts.slice(0, 2).join("-"),
    times: Number(parts[2] ?? 1),
    type: isNormal ? "normal" : "hard",
  };
}

interface StageConfigProps {
  onClose: () => void;
  lessonConfig?: any; // 从外部传 config.static_config
}

const DailySweep: React.FC<StageConfigProps> = ({onClose, lessonConfig}) => {
  const {t} = useTranslation();
  const {activeProfile, saveProfile} = useApp();

  const ext = useMemo(() => {
    const s = activeProfile?.settings ?? {};
    return {
      mainlinePriority: (s as any).mainlinePriority ?? "",
      hardPriority: (s as any).hardPriority ?? "",
    };
  }, [activeProfile]);

  const [mainlineInput, setMainlineInput] = useState(ext.mainlinePriority);
  const [hardInput, setHardInput] = useState(ext.hardPriority);

  // 学生关卡字典
  const studentTaskDict = useMemo(() => {
    const dict: Record<string, string[]> = {
      [t("stage.byStudent")]: [],
      [t("stage.AliceBaby")]: [],
    };
    if (lessonConfig?.hard_task_student_material) {
      lessonConfig.hard_task_student_material.forEach(([stage, studentName]: any) => {
        const translated = studentName; // TODO: 调用 bt.getStudent(studentName)
        if (!dict[translated]) dict[translated] = [];
        dict[translated].push(stage + "-3");
      });
    }
    return dict;
  }, [lessonConfig, t]);

  const [selectedStudent, setSelectedStudent] = useState(Object.keys(studentTaskDict)[0]);

  const saveMainline = async () => {
    try {
      const cleaned = mainlineInput.replace(/ /g, "").replace(/，/g, ",");
      if (!activeProfile) return;
      if (cleaned === "") {
        await saveProfile({
          ...activeProfile,
          settings: {
            ...activeProfile.settings,
            mainlinePriority: "",
            unfinished_normal_tasks: [],
          } as AppSettings,
        });
        alert(t("stage.normalCleared"));
        return;
      }
      const parsed = cleaned.split(",").map((x) => readTask(x, true));
      await saveProfile({
        ...activeProfile,
        settings: {
          ...activeProfile.settings,
          mainlinePriority: cleaned,
          unfinished_normal_tasks: parsed,
        } as AppSettings,
      });
      alert(t("stage.normalSaved") + cleaned);
    } catch (e: any) {
      alert(t("stage.normalFailed") + e.message);
    }
  };

  const saveHard = async () => {
    try {
      const cleaned = hardInput.replace(/ /g, "").replace(/，/g, ",");
      if (!activeProfile) return;
      if (cleaned === "") {
        await saveProfile({
          ...activeProfile,
          settings: {
            ...activeProfile.settings,
            hardPriority: "",
            unfinished_hard_tasks: [],
          } as AppSettings,
        });
        alert(t("stage.hardCleared"));
        return;
      }
      const parsed = cleaned.split(",").map((x) => readTask(x, false));
      await saveProfile({
        ...activeProfile,
        settings: {
          ...activeProfile.settings,
          hardPriority: cleaned,
          unfinished_hard_tasks: parsed,
        } as AppSettings,
      });
      alert(t("stage.hardSaved") + cleaned);
    } catch (e: any) {
      alert(t("stage.hardFailed") + e.message);
    }
  };

  // 下拉框选择学生时，往 input_hard 里追加
  const handleStudentSelect = (student: string) => {
    setSelectedStudent(student);
    if (student === t("stage.byStudent")) return;
    const stages = studentTaskDict[student];
    if (!stages) return;
    const current = hardInput ? hardInput + "," : "";
    setHardInput(current + stages.join(","));
  };

  return (
    <div className="space-y-6">
      {/* 普通关卡 */}
      <div>
        <label className="text-sm font-medium mb-2 flex items-center">
          <span>{t("stage.normalLabel")}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="ml-1">
                <BadgeQuestionMark size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-sm">
              {t("stage.normalDesc")}
            </TooltipContent>
          </Tooltip>
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            value={mainlineInput}
            onChange={(e) => setMainlineInput(e.target.value)}
            className="flex-1 px-3 py-2 border rounded"
            placeholder={t('placeholder.config.insert')}
          />
          <button
            onClick={saveMainline}
            className="px-4 py-2 bg-primary-600 text-white rounded"
          >
            {t("confirm")}
          </button>
        </div>
      </div>


      {/* 困难关卡 */}
      <div>
        <label className="block text-sm font-medium mb-1">
          {t("stage.hardLabel")}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={hardInput}
            onChange={(e) => setHardInput(e.target.value)}
            className="flex-1 px-3 py-2 border rounded"
            placeholder={t('placeholder.config.insert')}
          />
          <button
            onClick={saveHard}
            className="px-4 py-2 bg-primary-600 text-white rounded"
          >
            {t("confirm")}
          </button>
        </div>
        <p className="text-xs text-slate-500">
          {t("stage.hardDesc")}
        </p>

        {/* 学生选择 */}
        <div className="mt-2">
          <select
            value={selectedStudent}
            onChange={(e) => handleStudentSelect(e.target.value)}
            className="px-2 py-1 border rounded"
          >
            {Object.keys(studentTaskDict).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default DailySweep;
