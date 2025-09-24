import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import {Modal} from "@/components/ui/Modal";
import {Textarea} from "@/components/ui/textarea";
import Button from "@/components/ui/Button";
import {FormInput} from "@/components/ui/FormInput.tsx";
import {Separator} from "@/components/ui/separator.tsx";

interface TaskItem {
  id: string;
  name: string;
  time: string;
  enabled: boolean;
  priority?: number;
  interval?: number;
  daily_reset?: string[];
  disabled_time_range?: string[];
  pre_task?: string[];
  post_task?: string[];
}

interface FeatureSwitchModalProps {
  task: TaskItem;
  onClose: () => void;
  onSave: (task: TaskItem) => void;
}

const FeatureSwitchModal: React.FC<FeatureSwitchModalProps> = ({task, onClose, onSave}) => {
  const {t} = useTranslation();
  const [form, setForm] = useState<TaskItem>({...task});

  const handleChange = (key: keyof TaskItem, value: any) => {
    setForm((prev) => ({...prev, [key]: value}));
  };

  const handleSave = () => {
    onSave(form);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={t("scheduler.detailConfig")} width={80}>
      <div className="space-y-2">
        {/* 事件名称（只读） */}
        <FormInput
          label={t("scheduler.eventName")}
          value={form.name} disabled
        />
        <div className="grid grid-cols-1 gap-y-2 lg:grid-cols-2 gap-2">

          {/* 优先级 */}
          <FormInput
            label={t("scheduler.priority")}
            type="number"
            value={form.priority ?? 0}
            onChange={(e) => handleChange("priority", Number(e.target.value))}
          />

          {/* 执行间隔 */}
          <FormInput
            label={t("scheduler.interval")}
            type="number"
            value={form.interval ?? 0}
            onChange={(e) => handleChange("interval", Number(e.target.value))}
          />


          {/* 每日重置 */}
          <div>
            <label className="block text-sm font-medium mb-1">{t("scheduler.dailyReset")}</label>
            <Textarea
              placeholder={t("scheduler.inputList")}
              value={(form.daily_reset ?? []).join("\n")}
              onChange={(e) => handleChange("daily_reset", e.target.value.split("\n"))}
            />
          </div>

          {/* 禁用时间段 */}
          <div>
            <label className="block text-sm font-medium mb-1">{t("scheduler.disabledRange")}</label>
            <Textarea
              placeholder={t("scheduler.inputList")}
              value={(form.disabled_time_range ?? []).join("\n")}
              onChange={(e) => handleChange("disabled_time_range", e.target.value.split("\n"))}
            />
          </div>

          {/* 前置任务 */}
          <div>
            <label className="block text-sm font-medium mb-1">{t("scheduler.preTask")}</label>
            <Textarea
              placeholder={t("scheduler.inputList")}
              value={(form.pre_task ?? []).join("\n")}
              onChange={(e) => handleChange("pre_task", e.target.value.split("\n"))}
            />
          </div>

          {/* 后置任务 */}
          <div>
            <label className="block text-sm font-medium mb-1">{t("scheduler.postTask")}</label>
            <Textarea
              placeholder={t("scheduler.inputList")}
              value={(form.post_task ?? []).join("\n")}
              onChange={(e) => handleChange("post_task", e.target.value.split("\n"))}
            />
          </div>
        </div>


        <Separator/>
        {/* 按钮 */}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="primary" onClick={onClose}>
            {t("")}
          </Button>
          <Button onClick={handleSave}>{t("common.confirm")}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default FeatureSwitchModal;
