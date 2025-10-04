import React, {useEffect, useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import {useApp} from "@/contexts/AppContext";
import type {AppSettings} from "@/lib/types.ts";
import {Check, Plus, X} from "lucide-react";
import {Reorder} from "framer-motion";
import {Separator} from "@/components/ui/separator"
import SwitchButton from "@/components/ui/SwitchButton.tsx";
import {FormInput} from "@/components/ui/FormInput.tsx";
import StudentSelectorModal from "@/components/StudentSelectorModal.tsx";
import {useWebSocketStore} from "@/store/websocketStore.ts";
import {DynamicConfig} from "@/lib/type.dynamic.ts";
import {serverMap} from "@/lib/utils.ts";

type LessonConfigProps = {
  onClose: () => void;
  profileId?: string;
  settings?: Partial<AppSettings>;
  onChange?: (patch: Partial<AppSettings>) => Promise<void>;
};

type Draft = {
  lesson_enableFavorStudent: boolean;
  lesson_favorStudent: string[];
  lesson_relationship_first: boolean;
  lesson_each_region_object_priority: string[][];
  lesson_times: number[];
};

const levels = ["primary", "normal", "advanced", "superior"];
const levelLabels = ["初级", "普通", "高级", "特级"];

const LessonConfig: React.FC<LessonConfigProps> = ({
                                                     onClose,
                                                     profileId,
                                                   }) => {
  const {t} = useTranslation();
  const staticConfig = useWebSocketStore(state => state.staticStore);
  const lessonNames = staticConfig.lesson_region_name.CN;
  const studentNames = staticConfig.student_names;
  const [showSelector, setShowSelector] = useState(false);

  const settings: Partial<DynamicConfig> = useWebSocketStore(state => state.configStore[profileId]);
  // 外部设置 → 默认值
  const ext = useMemo(() => {
    return {
      lesson_enableFavorStudent: settings.lesson_enableInviteFavorStudent ?? false,
      lesson_favorStudent: settings.lesson_favorStudent ?? [],
      lesson_relationship_first: settings.lesson_relationship_first ?? false,
      lesson_each_region_object_priority:
        settings.lesson_each_region_object_priority ??
        lessonNames.map(() => [...levels]),
      lesson_times:
        settings.lesson_times ?? lessonNames.map(() => 1),
    };
  }, [settings]);

  const [draft, setDraft] = useState<Draft>(ext);

  useEffect(() => {
    setDraft(prev => {
      // 简单的浅比较，避免递归
      if (JSON.stringify(prev) !== JSON.stringify(ext)) {
        return ext;
      }
      return prev;
    });
  }, [ext]);


  const dirty = JSON.stringify(draft) !== JSON.stringify(ext);

  // 保存
  const handleSave = async () => {
    const patch: Partial<AppSettings> = {};
    (Object.keys(draft) as (keyof Draft)[]).forEach((k) => {
      if (JSON.stringify(draft[k]) !== JSON.stringify(ext[k])) {
        patch[k] = draft[k] as any;
      }
    });

    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }
    // if (onChange) {
    //   await onChange(patch);
    // } else if (activeProfile) {
    //   await updateProfile(activeProfile.id, {
    //     settings: {...activeProfile.settings, ...patch},
    //   });
    // }
    onClose();
  };

  // Favor student tag 管理
  const removeFavorStudent = (name: string) => {
    setDraft((d) => ({
      ...d,
      lesson_favorStudent: d.lesson_favorStudent.filter((n) => n !== name),
    }));
  };

  // 更新区域等级选择
  const toggleLevel = (i: number, level: string) => {
    setDraft((d) => {
      const copy = d.lesson_each_region_object_priority.map((arr) => [...arr]);
      if (copy[i].includes(level)) {
        copy[i] = copy[i].filter((l) => l !== level);
      } else {
        copy[i].push(level);
      }
      return {...d, lesson_each_region_object_priority: copy};
    });
  };

  // 更新次数
  const updateTimes = (i: number, val: string) => {
    const n = Number(val);
    if (Number.isFinite(n)) {
      setDraft((d) => {
        const copy = [...d.lesson_times];
        copy[i] = n;
        return {...d, lesson_times: copy};
      });
    }
  };

  return (
    <div className="space-y-2">

      {/* 优先做指定学生 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <SwitchButton
          checked={draft.lesson_enableFavorStudent}
          label={t("lesson.enableFavorStudent")}
          onChange={(checked) =>
            setDraft((d) => ({...d, lesson_enableFavorStudent: checked}))
          }
        />

        <SwitchButton
          checked={draft.lesson_relationship_first}
          label={t("lesson.relationshipFirst")}
          onChange={(checked) =>
            setDraft((d) => ({...d, lesson_relationship_first: checked}))
          }
        />
      </div>


      {/* 指定学生 */}
      {draft.lesson_enableFavorStudent && (
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">
            {t("lesson.favorStudent")}
          </label>

          {/* 外层容器：单行 + 滚动条 */}
          <div className="overflow-x-auto pb-1 scroll-embedded">
            <Reorder.Group
              axis="x"
              values={draft.lesson_favorStudent}
              onReorder={(newOrder) =>
                setDraft((d) => ({...d, lesson_favorStudent: newOrder}))
              }
              className="flex gap-1 min-w-max"
            >
              {draft.lesson_favorStudent.map((name, index) => (
                <Reorder.Item
                  key={name}
                  value={name}
                  className="
                    flex items-center gap-2 px-3 py-0.5 shrink-0
                    rounded-full border border-slate-300 dark:border-slate-600
                    bg-slate-100 dark:bg-slate-700
                    shadow-sm hover:shadow-md
                    cursor-grab
                  "
                >
                  {/* 序号：小圆点 */}
                  <span
                    className="flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                    {index + 1}
                  </span>

                  <span className="text-sm">{name}</span>

                  {/* 删除按钮：hover 时浅红背景 */}
                  <button
                    onClick={() => removeFavorStudent(name)}
                    className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900 transition"
                  >
                    <X className="w-3.5 h-3.5"/>
                  </button>
                </Reorder.Item>
              ))}

              {/* 添加按钮也放在同一行 */}
              <button
                onClick={() => setShowSelector(true)}
                className="
                  flex items-center gap-1 px-3 py-0.5 shrink-0
                  rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600
                  text-slate-600 dark:text-slate-200
                  hover:bg-slate-100 dark:hover:bg-slate-600
                "
              >
                <Plus className="w-4 h-4"/> {t("add")}
              </button>
            </Reorder.Group>
          </div>
        </div>
      )}

      <Separator/>

      {/* 区域表格 */}
      <div className="overflow-y-auto overflow-x-auto border rounded-md" style={
        {maxHeight: "calc(100vh - 320px)", minHeight: "80px"}
      }>
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-slate-100 dark:bg-slate-700 z-10">
          <tr>
            <th className="px-2 py-1 border text-left">{t("lesson.region")}</th>
            {levelLabels.map((l) => (
              <th key={l} className="px-2 py-1 border">{l}</th>
            ))}
            <th className="px-2 py-1 border">{t("lesson.times")}</th>
          </tr>
          </thead>
          <tbody>
          {lessonNames.map((name, i) => (
            <tr key={i}>
              <td className="px-2 py-1 border">{name}</td>
              {levels.map((lvl, j) => (
                <td key={j} className="px-2 py-1 border text-center">
                  <label className="relative inline-flex items-center cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={draft.lesson_each_region_object_priority[i].includes(lvl)}
                      onChange={() => toggleLevel(i, lvl)}
                      className="
                        peer w-6 h-6 cursor-pointer
                        appearance-none
                        rounded-full border
                        border-slate-500 dark:border-slate-400
                        bg-slate-100 dark:bg-slate-700
                        checked:bg-primary-400 checked:border-slate-500
                        dark:checked:bg-primary-600 dark:checked:border-slate-400
                        checked:text-primary-foreground
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                        disabled:cursor-not-allowed disabled:opacity-50
                      "
                    />
                    <Check
                      className="
                    pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 text-white
                    opacity-0 peer-checked:opacity-100 transition-opacity
                  "
                    />
                  </label>
                </td>
              ))}
              <td className="px-2 py-1 border ">
                <FormInput
                  type="number"
                  value={draft.lesson_times[i]}
                  onChange={(e) => updateTimes(i, e.target.value)}
                  min={0}
                  max={99}
                  className="w-20 px-1 m-auto"
                />
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>

      <StudentSelectorModal
        isOpen={showSelector}
        onClose={() => setShowSelector(false)}
        allStudents={studentNames}
        selected={draft.lesson_favorStudent}
        onChange={(names) =>
          setDraft((d) => ({...d, lesson_favorStudent: names}))
        }
        lang={serverMap[settings.server]}
        mode="multiple"
      />

      {/* 保存 */}
      <div className="flex justify-end pt-4 border-t">
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

export default LessonConfig;
