import React, {useEffect, useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import {useApp} from "@/contexts/AppContext";
import type {AppSettings} from "@/lib/types.ts";
import {Plus, X} from "lucide-react";
import {Reorder} from "framer-motion"; // 顶部引入

type LessonConfigProps = {
  onClose: () => void;
  profileId?: string;
  settings?: Partial<AppSettings>;
  onChange?: (patch: Partial<AppSettings>) => Promise<void>;
  lessonNames?: string[]; // 外部传入区域名
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

const _lesson_names_ = [
  "沙勒业务区",
  "沙勒生活区",
  "歌赫娜中央区",
  "阿拜多斯高等学院",
  "千禧年学习区",
  "崔尼蒂广场区",
  "红冬联邦学院",
  "百鬼夜行中心",
  "D.U.白鸟区",
  "山海经中央特区"
]

const LessonConfig: React.FC<LessonConfigProps> = ({
                                                     onClose,
                                                     profileId,
                                                     settings,
                                                     onChange,
                                                     lessonNames = _lesson_names_,
                                                   }) => {
  const {t} = useTranslation();
  const {activeProfile, updateProfile} = useApp();

  // 外部设置 → 默认值
  const ext = useMemo(() => {
    const s = settings ?? activeProfile?.settings ?? {};
    return {
      lesson_enableFavorStudent: s.lesson_enableFavorStudent ?? false,
      lesson_favorStudent: s.lesson_favorStudent ?? [],
      lesson_relationship_first: s.lesson_relationship_first ?? false,
      lesson_each_region_object_priority:
        s.lesson_each_region_object_priority ??
        lessonNames.map(() => [...levels]),
      lesson_times:
        s.lesson_times ?? lessonNames.map(() => 1),
    };
  }, [settings, activeProfile, lessonNames]);

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
    if (onChange) {
      await onChange(patch);
    } else if (activeProfile) {
      await updateProfile(activeProfile.id, {
        settings: {...activeProfile.settings, ...patch},
      });
    }
    onClose();
  };

  // Favor student tag 管理
  const removeFavorStudent = (name: string) => {
    setDraft((d) => ({
      ...d,
      lesson_favorStudent: d.lesson_favorStudent.filter((n) => n !== name),
    }));
  };

  const addFavorStudent = () => {
    const name = prompt("请输入学生姓名"); // 简化：也可以用 Modal 搜索
    if (name) {
      setDraft((d) => ({
        ...d,
        lesson_favorStudent: [...d.lesson_favorStudent, name],
      }));
    }
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
    <div className="space-y-6">

      {/* 优先做指定学生 */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
        <label>{t("lesson.enableFavorStudent")}</label>
        <input
          type="checkbox"
          checked={draft.lesson_enableFavorStudent}
          onChange={(e) =>
            setDraft((d) => ({...d, lesson_enableFavorStudent: e.target.checked}))
          }
        />
      </div>

      {/* 指定学生 tag */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t("lesson.favorStudent")}
        </label>

        {/* 外层容器：单行 + 滚动条 */}
        <div className="overflow-x-auto">
          <Reorder.Group
            axis="x"
            values={draft.lesson_favorStudent}
            onReorder={(newOrder) =>
              setDraft((d) => ({...d, lesson_favorStudent: newOrder}))
            }
            className="flex gap-2 min-w-max"
          >
            {draft.lesson_favorStudent.map((name, index) => (
              <Reorder.Item
                key={name}
                value={name}
                className="flex items-center gap-1 px-3 py-1 border rounded-full bg-slate-200 dark:bg-slate-700 cursor-grab shrink-0"
              >
                {/* 序号 */}
                <span className="font-bold">{index + 1}.</span>
                <span>{name}</span>
                <button
                  onClick={() => removeFavorStudent(name)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3"/>
                </button>
              </Reorder.Item>
            ))}

            {/* 添加按钮也放在同一行 */}
            <button
              onClick={addFavorStudent}
              className="flex items-center gap-1 px-3 py-1 border rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-500 dark:hover:bg-slate-600  shrink-0"
            >
              <Plus size={18}/> {t('add')}
            </button>
          </Reorder.Group>
        </div>
      </div>


      {/* 优先好感等级 */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
        <label>{t("lesson.relationshipFirst")}</label>
        <input
          type="checkbox"
          checked={draft.lesson_relationship_first}
          onChange={(e) =>
            setDraft((d) => ({...d, lesson_relationship_first: e.target.checked}))
          }
        />
      </div>

      {/* 区域表格 */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-slate-300 text-sm">
          <thead className="bg-slate-100 dark:bg-slate-700">
          <tr>
            <th className="px-2 py-1 border">{t("lesson.region")}</th>
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
                  <input
                    type="checkbox"
                    checked={draft.lesson_each_region_object_priority[i].includes(lvl)}
                    onChange={() => toggleLevel(i, lvl)}
                  />
                </td>
              ))}
              <td className="px-2 py-1 border text-center">
                <input
                  type="number"
                  value={draft.lesson_times[i]}
                  onChange={(e) => updateTimes(i, e.target.value)}
                  min={0}
                  max={99}
                  className="w-16 px-1 py-0.5 border rounded"
                />
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>

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
