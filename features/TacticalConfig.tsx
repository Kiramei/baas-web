import React from "react";
import type {AppSettings} from "@/lib/types.ts";
import {useApp} from "@/contexts/AppContext.tsx";
import {FormSelect} from "@/components/ui/FormSelect.tsx";
import {useTranslation} from "react-i18next";

type TacticalConfigProps = {
  onClose: () => void;
  profileId?: string;
  settings?: Partial<AppSettings>;
  onChange?: (patch: Partial<AppSettings>) => Promise<void>;
};

interface TacticalState {
  hard_level: string;
}


const TacticalConfig: React.FC<TacticalConfigProps> = ({
                                                         onClose,
                                                         profileId,
                                                         settings,
                                                         onChange,
                                                       }) => {
  const {t} = useTranslation();
  const {staticConfig} = useApp();
  const total_assault_difficulties = staticConfig.total_assault_difficulties.CN as string[];

  const [draft, setDraft] = React.useState<TacticalState>({
    hard_level: settings?.hard_level ?? total_assault_difficulties[0],
  });

  const handleSave = () => {
    onClose();
  }

  const handleChange = (key: keyof TacticalState) => (value: string) => {
    setDraft(prev => ({...prev, [key]: value}));
    if (onChange) {
      onChange({...settings, [key]: value});
    }
  }

  return (<div className="space-y-6">
    <FormSelect
      label={t("tactical.hardLevel")}
      className="w-full"
      value={draft.hard_level.toString()}
      onChange={handleChange("hard_level")}
      options={total_assault_difficulties.map((level, _) => ({
        value: level,
        label: level,
      }))}
    />


    <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
      <button
        onClick={handleSave}
        className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200"
      >
        {t('save')}
      </button>
    </div>
  </div>);
}

export default TacticalConfig;