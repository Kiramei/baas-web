import React from "react";
import type {AppSettings} from "@/lib/types.ts";
import {useApp} from "@/contexts/AppContext.tsx";
import {useTranslation} from "react-i18next";
import {FormSelect} from "@/components/ui/FormSelect.tsx";
import {FormInput} from "@/components/ui/FormInput.tsx";
import {Switch} from "@/components/ui/switch";
import SwitchButton from "@/components/ui/SwitchButton.tsx";
import {useWebSocketStore} from "@/store/websocketStore.ts";

type ScriptConfigProps = {
  profileId: string;
  onClose: () => void;
};

interface ScriptState {
  screenshot_interval: string;
  autostart: boolean;
  then: string;
  screenshot_method: string;
  control_method: string;
}

const ScriptConfig: React.FC<ScriptConfigProps> = ({
                                                     profileId,
                                                     onClose
                                                   }) => {
  const {t} = useTranslation();
  const staticConfig = useWebSocketStore(state => state.staticStore);
  const settings = useWebSocketStore(state => state.configStore[profileId]);

  const thenOptions = [
    [t("script.doNothing"), "无动作"],
    [t("script.exitBaas"), "退出 Baas"],
    [t("script.exitEmu"), "退出 模拟器"],
    [t("script.exitBoth"), "退出 Baas 和 模拟器"],
    [t("script.shutdown"), "关机"]
  ];

  const [draft, setDraft] = React.useState<ScriptState>({
    screenshot_interval: settings.screenshot_interval,
    autostart: settings.autostart,
    then: settings.then,
    screenshot_method: settings.screenshot_method,
    control_method: settings.control_method
  });

  const handleChange =
    (key: keyof ScriptState) =>
      (value: string | boolean) => {
        setDraft((prev) => ({...prev, [key]: value as any}));
      };

  const handleSave = async () => {
    // if (onChange) {
    //   await onChange({...settings, ...draft});
    // }
    onClose();
  };

  return (
    <div className="space-y-2">
      {/* 截图间隔 */}
      <FormInput
        type="number"
        label={t("script.screenshotInterval")}
        value={draft.screenshot_interval}
        onChange={(e) =>
          handleChange("screenshot_interval")(e.target.value)
        }
        placeholder="1.0"
        min={0.1}
        step={0.1}
      />

      {/* 自动启动 */}
      <SwitchButton
        label={t("script.autostart")}
        checked={draft.autostart}
        onChange={(v) => handleChange("autostart")(v)}
        className="w-full"
      />

      {/* 完成后 */}
      <FormSelect
        label={t("script.then")}
        value={draft.then}
        onChange={handleChange("then")}
        options={thenOptions.map((opt) => ({
          value: opt[1],
          label: opt[0],
        }))}
      />

      <div className="flex items-center justify-between gap-2">
        {/* 截图方式 */}
        <FormSelect
          label={t("script.screenshotMethod")}
          value={draft.screenshot_method}
          onChange={handleChange("screenshot_method")}
          options={staticConfig?.screenshot_methods?.map((m: string) => ({
            value: m,
            label: m,
          })) ?? []}
          className="flex-1"
        />

        {/* 控制方式 */}
        <FormSelect
          label={t("script.controlMethod")}
          value={draft.control_method}
          onChange={handleChange("control_method")}
          options={staticConfig?.control_methods?.map((m: string) => ({
            value: m,
            label: m,
          })) ?? []}
          className="flex-1"
        />
      </div>

      {/* 保存按钮 */}
      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          {t("save")}
        </button>
      </div>
    </div>
  );
};

export default ScriptConfig;
