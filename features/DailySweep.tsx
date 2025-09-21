import React, {useState, useEffect, useMemo} from "react";
import {useTranslation} from "react-i18next";
import {useApp} from "@/contexts/AppContext";
import type {AppSettings} from "@/lib/types.ts";
import {BadgeQuestionMark} from "lucide-react";
import {Tooltip, TooltipTrigger, TooltipContent} from "@/components/ui/tooltip"
import { FormSelect } from "@/components/ui/FormSelect";
import { FormInput } from "@/components/ui/FormInput";

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

  const [errorEmit1, setErrorEmit1] = useState<string | null>(null);
  const [errorEmit2, setErrorEmit2] = useState<string | null>(null);

  // 学生关卡字典
  const studentTaskDict = useMemo(() => {
    const dict: Record<string, string[]> = {
      [t("placeholder.stage")]: [],
      [t("stage.byStudent")]: ['1-1-1'],
      [t("stage.AliceBaby")]: ['1-1-2'],
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
    // try {
    //   const cleaned = mainlineInput.replace(/ /g, "").replace(/，/g, ",");
    //   if (!activeProfile) return;
    //   if (cleaned === "") {
    //     await saveProfile({
    //       ...activeProfile,
    //       settings: {
    //         ...activeProfile.settings,
    //         mainlinePriority: "",
    //         unfinished_normal_tasks: [],
    //       } as AppSettings,
    //     });
    //     alert(t("stage.normalCleared"));
    //     return;
    //   }
    //   const parsed = cleaned.split(",").map((x) => readTask(x, true));
    //   await saveProfile({
    //     ...activeProfile,
    //     settings: {
    //       ...activeProfile.settings,
    //       mainlinePriority: cleaned,
    //       unfinished_normal_tasks: parsed,
    //     } as AppSettings,
    //   });
    //   alert(t("stage.normalSaved") + cleaned);
    // } catch (e: any) {
    //   alert(t("stage.normalFailed") + e.message);
    // }
    onClose()
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
    if (student === t("placeholder.stage")) return;
    const stages = studentTaskDict[student];
    if (!stages) return;
    const current = hardInput ? hardInput + "," : "";
    setHardInput(current + stages.join(","));
  };

  return (
    <div className="space-y-4">
      {/* 普通关卡 */}
      <div>
        <label className="text-sm font-medium mb-2 flex items-center">
          <span>{t("stage.normalLabel")}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="ml-1">
                <BadgeQuestionMark size={18}/>
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-sm">
              {t("stage.normalDesc")}
            </TooltipContent>
          </Tooltip>
        </label>

        <div className="flex gap-2">
          <FormInput
            type="text"
            value={mainlineInput}
            className="flex-1"
            onChange={(e) => setMainlineInput(e.target.value)}
            placeholder={t('placeholder.config.insert')}
          />
        </div>

        {errorEmit1 && (<p className="text-sm font-medium text-red-600 dark:text-red-300 mt-1">
          {errorEmit1}
        </p>)}
      </div>


      {/* 困难关卡 */}
      <div>
        <label className="text-sm font-medium flex items-center mb-2">
          <span>{t("stage.hardLabel")}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="ml-1">
                <BadgeQuestionMark size={18}/>
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-sm">
              {t("stage.hardDesc")}
            </TooltipContent>
          </Tooltip>
        </label>
        <div className="flex gap-2">
          <FormInput
            label=""
            type="text"
            value={hardInput}
            className="flex-1"
            onChange={(e) => setHardInput(e.target.value)}
            placeholder={t('placeholder.config.insert')}
          />

          {/* 学生选择 */}
          <FormSelect
            value={selectedStudent}
            onChange={handleStudentSelect}
            options={Object.keys(studentTaskDict).map((s) => ({ value: s, label: s }))}
          />
        </div>

        {errorEmit2 && (<p className="text-sm font-medium text-red-600 dark:text-red-300 mt-1">
          {errorEmit2}
        </p>)}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={saveMainline}
          className="px-4 py-1 bg-primary-600 text-white rounded dark:hover:bg-primary-700 hover:bg-primary-400 "
        >
          {t("confirm")}
        </button>
      </div>
    </div>
  );
};

export default DailySweep;
