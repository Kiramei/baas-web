import React, {useState, useMemo, useEffect} from "react";
import {useTranslation} from "react-i18next";
import {useApp} from "@/contexts/AppContext";
import type {AppSettings} from "@/lib/types.ts";
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@/components/ui/tabs";
import {FormSelect} from "@/components/ui/FormSelect";
import {FormInput} from "@/components/ui/FormInput";
import {LabelWithTooltip} from "@/components/ui/LabelWithTooltip.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {useWebSocketStore} from "@/store/websocketStore.ts";
import {DynamicConfig} from "@/lib/type.dynamic.ts";
import CButton from "@/components/ui/CButton.tsx";
import StudentSelectorModal from "@/components/StudentSelectorModal.tsx";

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
  profileId: string;
  onClose: () => void;
}

type Draft = {
  mainlinePriority: string;
  hardPriority: string;
  rewarded_task_times: string;
  scrimmage_times: string;
  activity_sweep_task_number: number;
  activity_sweep_times: string;
  special_task_times: string;
  purchase_rewarded_task_ticket_times: string;
  purchase_lesson_ticket_times: string;
  purchase_scrimmage_ticket_times: string;
}

const DailySweepTabs: React.FC<DailySweepTabsProps> = ({profileId, onClose}) => {
  const {t} = useTranslation();
  const {activeProfile, saveProfile} = useApp();

  const settings: Partial<DynamicConfig> = useWebSocketStore(state => state.configStore[profileId]);
  const staticConfig = useWebSocketStore(state => state.staticStore);
  const hard_task_student_material = staticConfig.hard_task_student_material
  const [openStudentModal, setOpenStudentModal] = useState(false);

  const ext = useMemo(() => {
    return {
      mainlinePriority: settings.mainlinePriority,
      hardPriority: settings.hardPriority,
      rewarded_task_times: settings.rewarded_task_times,
      scrimmage_times: settings.scrimmage_times,
      activity_sweep_task_number: settings.activity_sweep_task_number,
      activity_sweep_times: settings.activity_sweep_times,
      special_task_times: settings.special_task_times,
      purchase_rewarded_task_ticket_times: settings.purchase_rewarded_task_ticket_times,
      purchase_lesson_ticket_times: settings.purchase_lesson_ticket_times,
      purchase_scrimmage_ticket_times: settings.purchase_scrimmage_ticket_times
    };
  }, []);

  const [mainlineInput, setMainlineInput] = useState(ext.mainlinePriority);
  const [hardInput, setHardInput] = useState(ext.hardPriority);
  const [draft, setDraft] = useState<Draft>(ext);

  const getStagesByName = (name: string): string[] => {
    return hard_task_student_material
      .filter(([_, student]) => student === name)
      .map(([stage]) => stage);
  };

  const getUniqueNames = (): string[] => {
    return Array.from(
      new Set(hard_task_student_material.map(([_, name]) => name))
    );
  };

  // 学生关卡字典
  // const studentTaskDict = useMemo(() => {
  //   const dict: Record<string, string[]> = {
  //     [t("placeholder.stage")]: [],
  //     [t("stage.byStudent")]: ["1-1-1"],
  //     [t("stage.AliceBaby")]: ["1-1-2"],
  //   };
  //   if (lessonConfig?.hard_task_student_material) {
  //     lessonConfig.hard_task_student_material.forEach(([stage, studentName]: any) => {
  //       const translated = studentName;
  //       if (!dict[translated]) dict[translated] = [];
  //       dict[translated].push(stage + "-3");
  //     });
  //   }
  //   return dict;
  // }, [lessonConfig, t]);

  // const [selectedStudent, setSelectedStudent] = useState(Object.keys(studentTaskDict)[0]);

  // 保存逻辑
  const handleSaveDaily = async () => {
    // if (!activeProfile) return;
    // try {
    //   const cleaned = hardInput.replace(/ /g, "").replace(/，/g, ",");
    //   const parsed = cleaned ? cleaned.split(",").map((x) => readTask(x, false)) : [];
    //   await saveProfile({
    //     ...activeProfile,
    //     settings: {
    //       ...activeProfile.settings,
    //       mainlinePriority: mainlineInput,
    //       hardPriority: cleaned,
    //       unfinished_hard_tasks: parsed,
    //     } as AppSettings,
    //   });
    //   alert(t("configSaved"));
    //   onClose();
    // } catch (e: any) {
    //   alert("Error: " + e.message);
    // }
  };

  const handleSaveSweep = async () => {
    // if (!activeProfile) return;
    // await saveProfile({
    //   ...activeProfile,
    //   settings: {
    //     ...activeProfile.settings,
    //     ...form,
    //   } as AppSettings,
    // });
    // alert(t("configSaved"));
    // onClose();
  };

  const dirty = JSON.stringify(draft) !== JSON.stringify(ext);

  const handleStudentSelect = (student: string) => {
    // setSelectedStudent(student);
    // if (student === t("placeholder.stage")) return;
    // const stages = studentTaskDict[student];
    // if (!stages) return;
    // const current = hardInput ? hardInput + "," : "";
    // setHardInput(current + stages.join(","));
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
              value={draft.mainlinePriority}
              onChange={(e) => setDraft({...draft, mainlinePriority: e.target.value})}
              placeholder={t("placeholder.config.insert")}
            />
          </div>

          <div>
            <LabelWithTooltip label={t("stage.hardLabel")} tooltip={t("stage.hardDesc")}/>
            <div className="flex gap-2">
              <FormInput
                type="text"
                value={draft.hardPriority}
                onChange={(e) => setDraft({...draft, hardPriority: e.target.value})}
                placeholder={t("placeholder.config.insert")}
                className='flex-1'
              />
              {/*<FormSelect*/}
              {/*  value={selectedStudent}*/}
              {/*  onChange={handleStudentSelect}*/}
              {/*  options={Object.keys(studentTaskDict).map((s) => ({value: s, label: s}))}*/}
              {/*/>*/}
              <CButton onClick={() => setOpenStudentModal(true)} variant={"secondary"}>
                {t("stage.selectStudent")}
              </CButton>
            </div>
          </div>

        </TabsContent>

        {/* SweepCountConfig Tab */}
        <TabsContent value="sweep" className="grid gap-2 grid-cols-1 md:grid-cols-2">
          <FormInput
            label={t("sweep.rewarded")}
            value={draft.rewarded_task_times}
            onChange={(e) => setDraft({...draft, rewarded_task_times: e.target.value})}
          />
          <FormInput
            label={t("sweep.scrimmage")}
            value={draft.scrimmage_times}
            onChange={(e) => setDraft({...draft, scrimmage_times: e.target.value})}
          />
          <FormInput
            label={t("sweep.activityNumber")}
            value={draft.activity_sweep_task_number}
            onChange={(e) => setDraft({...draft, activity_sweep_task_number: Number(e.target.value)})}
          />
          <FormInput
            label={t("sweep.activityTimes")}
            value={draft.activity_sweep_times}
            onChange={(e) => setDraft({...draft, activity_sweep_times: e.target.value})}
          />
          <FormInput
            label={t("sweep.special")}
            value={draft.special_task_times}
            onChange={(e) => setDraft({...draft, special_task_times: e.target.value})}
          />

          <FormSelect
            label={t("sweep.purchaseRewarded")}
            value={draft.purchase_rewarded_task_ticket_times}
            onChange={(v) => setDraft({...draft, purchase_rewarded_task_ticket_times: v})}
            options={["max", ...Array.from({length: 13}, (_, i) => i.toString())].map((x) => ({
              value: x,
              label: x,
            }))}
          />

          <FormSelect
            label={t("sweep.purchaseLesson")}
            value={draft.purchase_lesson_ticket_times}
            onChange={(v) => setDraft({...draft, purchase_lesson_ticket_times: v})}
            options={["max", "0", "1", "2", "3", "4"].map((x) => ({value: x, label: x}))}
          />

          <FormSelect
            label={t("sweep.purchaseScrimmage")}
            value={draft.purchase_scrimmage_ticket_times}
            onChange={(v) => setDraft({...draft, purchase_scrimmage_ticket_times: v})}
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
      <StudentSelectorModal
        isOpen={openStudentModal}
        onClose={function (): void {
          setOpenStudentModal(false);
        }}
        allStudents={getUniqueNames()}
        selected={[]}
        onChange={function (list: string[]): void {
          // const priority = getPhase2RecommendedPriority(list[0]);
          // setDraft((d) => ({...d, createPriority_phase2: priority}));
          const stages = getStagesByName(list[0])
          setDraft(state => {
            const current = state.hardPriority ? state.hardPriority + ", " : "";
            return {...state, hardPriority: current + stages.join(", ")}
          })

          setOpenStudentModal(false)
        }}
      />
    </div>
  );
};

export default DailySweepTabs;
