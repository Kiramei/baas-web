import React from "react";
import type { AppSettings } from "@/lib/types";
import { useApp } from "@/contexts/AppContext";
import SwitchButton from "@/components/ui/SwitchButton";
import { FormInput } from "@/components/ui/FormInput";
import { useTranslation } from "react-i18next";

type PushConfigProps = {
  onClose: () => void;
  profileId?: string;
  settings?: Partial<AppSettings>;
  onChange?: (patch: Partial<AppSettings>) => Promise<void>;
};

interface PushState {
  push_after_error: boolean;
  push_after_completion: boolean;
  push_json: string;
  push_serverchan: string;
}

const PushConfig: React.FC<PushConfigProps> = ({
                                                 onClose,
                                                 profileId,
                                                 settings,
                                                 onChange,
                                               }) => {
  const { t } = useTranslation();
  const { activeProfile, updateProfile } = useApp();

  const [draft, setDraft] = React.useState<PushState>({
    push_after_error: settings?.push_after_error ?? false,
    push_after_completion: settings?.push_after_completion ?? false,
    push_json: settings?.push_json ?? "",
    push_serverchan: settings?.push_serverchan ?? "",
  });

  const handleChange =
    <K extends keyof PushState>(key: K) =>
      (value: PushState[K]) => {
        setDraft((prev) => ({ ...prev, [key]: value }));
        if (onChange) {
          onChange({ ...settings, [key]: value });
        }
      };

  const handleSave = async () => {
    const patch: Partial<AppSettings> = { ...draft };
    if (onChange) {
      await onChange(patch);
    } else if (activeProfile) {
      await updateProfile(activeProfile.id, {
        settings: { ...activeProfile.settings, ...patch },
      });
    }
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="w-full flex gap-2 lg:flex-row max-lg:flex-col">
        <SwitchButton
          label={t("push.afterError")}
          checked={draft.push_after_error}
          onChange={handleChange("push_after_error")}
          className="flex-1"
        />

        <SwitchButton
          label={t("push.afterCompletion")}
          checked={draft.push_after_completion}
          onChange={handleChange("push_after_completion")}
          className="flex-1"
        />
      </div>

      <FormInput
        label={t("push.json")}
        value={draft.push_json}
        onChange={(e) => handleChange("push_json")(e.target.value)}
        placeholder={t("placeholder.config.insert")}
      />

      <FormInput
        label={t("push.serverchan")}
        value={draft.push_serverchan}
        onChange={(e) => handleChange("push_serverchan")(e.target.value)}
        placeholder={t("placeholder.config.insert")}
      />

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

export default PushConfig;
