import React, {useState, useMemo} from "react";
import {useTranslation} from "react-i18next";
import {useApp} from "@/contexts/AppContext";
import type {AppSettings} from "@/lib/types.ts";
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@/components/ui/tabs";
import {FormSelect} from "@/components/ui/FormSelect";
import {FormInput} from "@/components/ui/FormInput";
import {LabelWithTooltip} from "@/components/ui/LabelWithTooltip.tsx";
import {Separator} from "@/components/ui/separator.tsx";

// mock 后端逻辑
function readTask(str: string, isNormal: boolean) {
  const parts = str.split("-");
  return {
    stage: parts.slice(0, 2).join("-"),
    times: Number(parts[2] ?? 1),
    type: isNormal ? "normal" : "hard",
  };
}

interface DailySweepTabsProps {
  onClose: () => void;
  lessonConfig?: any;
}

const DailySweepTabs: React.FC<DailySweepTabsProps> = ({onClose, lessonConfig}) => {
  const {t} = useTranslation();
  const {activeProfile, saveProfile} = useApp();

  const ext = useMemo(() => {
    const s = activeProfile?.settings ?? {};
    return {
      mainlinePriority: (s as any).mainlinePriority ?? "",
      hardPriority: (s as any).hardPriority ?? "",
      rewarded_task_times: (s as any).rewarded_task_times ?? "",
      scrimmage_times: (s as any).scrimmage_times ?? "",
      activity_sweep_task_number: (s as any).activity_sweep_task_number ?? "",
      activity_sweep_times: (s as any).activity_sweep_times ?? "",
      special_task_times: (s as any).special_task_times ?? "",
      purchase_rewarded_task_ticket_times: (s as any).purchase_rewarded_task_ticket_times ?? "0",
      purchase_lesson_ticket_times: (s as any).purchase_lesson_ticket_times ?? "0",
      purchase_scrimmage_ticket_times: (s as any).purchase_scrimmage_ticket_times ?? "0",
    };
  }, [activeProfile]);

  const [mainlineInput, setMainlineInput] = useState(ext.mainlinePriority);
  const [hardInput, setHardInput] = useState(ext.hardPriority);

  // SweepCountConfig 的字段
  const [form, setForm] = useState({
    rewarded_task_times: ext.rewarded_task_times,
    scrimmage_times: ext.scrimmage_times,
    activity_sweep_task_number: ext.activity_sweep_task_number,
    activity_sweep_times: ext.activity_sweep_times,
    special_task_times: ext.special_task_times,
    purchase_rewarded_task_ticket_times: ext.purchase_rewarded_task_ticket_times,
    purchase_lesson_ticket_times: ext.purchase_lesson_ticket_times,
    purchase_scrimmage_ticket_times: ext.purchase_scrimmage_ticket_times,
  });

  // 学生关卡字典
  const studentTaskDict = useMemo(() => {
    const dict: Record<string, string[]> = {
      [t("placeholder.stage")]: [],
      [t("stage.byStudent")]: ["1-1-1"],
      [t("stage.AliceBaby")]: ["1-1-2"],
    };
    if (lessonConfig?.hard_task_student_material) {
      lessonConfig.hard_task_student_material.forEach(([stage, studentName]: any) => {
        const translated = studentName;
        if (!dict[translated]) dict[translated] = [];
        dict[translated].push(stage + "-3");
      });
    }
    return dict;
  }, [lessonConfig, t]);

  const [selectedStudent, setSelectedStudent] = useState(Object.keys(studentTaskDict)[0]);

  // 保存逻辑
  const handleSaveDaily = async () => {
    if (!activeProfile) return;
    try {
      const cleaned = hardInput.replace(/ /g, "").replace(/，/g, ",");
      const parsed = cleaned ? cleaned.split(",").map((x) => readTask(x, false)) : [];
      await saveProfile({
        ...activeProfile,
        settings: {
          ...activeProfile.settings,
          mainlinePriority: mainlineInput,
          hardPriority: cleaned,
          unfinished_hard_tasks: parsed,
        } as AppSettings,
      });
      alert(t("configSaved"));
      onClose();
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleSaveSweep = async () => {
    if (!activeProfile) return;
    await saveProfile({
      ...activeProfile,
      settings: {
        ...activeProfile.settings,
        ...form,
      } as AppSettings,
    });
    alert(t("configSaved"));
    onClose();
  };

  const dirty = JSON.stringify(form) !== JSON.stringify(ext);


  const handleStudentSelect = (student: string) => {
    setSelectedStudent(student);
    if (student === t("placeholder.stage")) return;
    const stages = studentTaskDict[student];
    if (!stages) return;
    const current = hardInput ? hardInput + "," : "";
    setHardInput(current + stages.join(","));
  };

  const handleSave = async () => {

  }

  return (
    <div>
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="daily">{t("stage.dailyTab")}</TabsTrigger>
          <TabsTrigger value="sweep">{t("stage.sweepTab")}</TabsTrigger>
        </TabsList>

        {/* DailySweep Tab */}
        <TabsContent value="daily" className="space-y-4">
          <div>
            <LabelWithTooltip label={t("stage.normalLabel")} tooltip={t("stage.normalDesc")}/>
            <FormInput
              type="text"
              value={mainlineInput}
              onChange={(e) => setMainlineInput(e.target.value)}
              placeholder={t("placeholder.config.insert")}
            />
          </div>

          <div>
            <LabelWithTooltip label={t("stage.hardLabel")} tooltip={t("stage.hardDesc")}/>
            <div className="flex gap-2">
              <FormInput
                type="text"
                value={hardInput}
                onChange={(e) => setHardInput(e.target.value)}
                placeholder={t("placeholder.config.insert")}
                className='flex-1'
              />
              <FormSelect
                value={selectedStudent}
                onChange={handleStudentSelect}
                options={Object.keys(studentTaskDict).map((s) => ({value: s, label: s}))}
              />
            </div>
          </div>

        </TabsContent>

        {/* SweepCountConfig Tab */}
        <TabsContent value="sweep" className="grid gap-2 grid-cols-1 md:grid-cols-2">
          <FormInput
            label={t("sweep.rewarded")}
            value={form.rewarded_task_times}
            onChange={(e) => setForm({...form, rewarded_task_times: e.target.value})}
          />
          <FormInput
            label={t("sweep.scrimmage")}
            value={form.scrimmage_times}
            onChange={(e) => setForm({...form, scrimmage_times: e.target.value})}
          />
          <FormInput
            label={t("sweep.activityNumber")}
            value={form.activity_sweep_task_number}
            onChange={(e) => setForm({...form, activity_sweep_task_number: e.target.value})}
          />
          <FormInput
            label={t("sweep.activityTimes")}
            value={form.activity_sweep_times}
            onChange={(e) => setForm({...form, activity_sweep_times: e.target.value})}
          />
          <FormInput
            label={t("sweep.special")}
            value={form.special_task_times}
            onChange={(e) => setForm({...form, special_task_times: e.target.value})}
          />

          <FormSelect
            label={t("sweep.purchaseRewarded")}
            value={form.purchase_rewarded_task_ticket_times}
            onChange={(v) => setForm({...form, purchase_rewarded_task_ticket_times: v})}
            options={["max", ...Array.from({length: 13}, (_, i) => i.toString())].map((x) => ({
              value: x,
              label: x,
            }))}
          />

          <FormSelect
            label={t("sweep.purchaseLesson")}
            value={form.purchase_lesson_ticket_times}
            onChange={(v) => setForm({...form, purchase_lesson_ticket_times: v})}
            options={["max", "0", "1", "2", "3", "4"].map((x) => ({value: x, label: x}))}
          />

          <FormSelect
            label={t("sweep.purchaseScrimmage")}
            value={form.purchase_scrimmage_ticket_times}
            onChange={(v) => setForm({...form, purchase_scrimmage_ticket_times: v})}
            options={["max", ...Array.from({length: 13}, (_, i) => i.toString())].map((x) => ({
              value: x,
              label: x,
            }))}
          />

        </TabsContent>
      </Tabs>

      <Separator className="mt-4"/>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={!dirty}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-60"
        >
          {t("save")}
        </button>
      </div>
    </div>
  );
};

export default DailySweepTabs;
