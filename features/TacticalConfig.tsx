import React from "react";
import {FormSelect} from "@/components/ui/FormSelect.tsx";
import {useTranslation} from "react-i18next";
import {useWebSocketStore} from "@/store/websocketStore.ts";
import {serverMap} from "@/lib/utils.ts";
import {DynamicConfig} from "@/lib/type.dynamic.ts";

type TacticalConfigProps = {
  onClose: () => void;
  profileId?: string;
};

interface TacticalState {
  totalForceFightDifficulty: string;
}


const TacticalConfig: React.FC<TacticalConfigProps> = ({
                                                         profileId,
                                                         onClose
                                                       }) => {
  const {t} = useTranslation();
  const staticConfig = useWebSocketStore(state => state.staticStore);
  const settings: Partial<DynamicConfig> = useWebSocketStore(state => state.configStore[profileId]);

  const total_assault_difficulties = staticConfig.total_assault_difficulties[serverMap[settings.server]] as string[];

  const [draft, setDraft] = React.useState<TacticalState>({
    totalForceFightDifficulty: settings?.totalForceFightDifficulty ?? total_assault_difficulties[0],
  });

  const handleSave = () => {
    onClose();
  }

  const handleChange = (key: keyof TacticalState) => (value: string) => {
    setDraft(prev => ({...prev, [key]: value}));
    // if (onChange) {
    //   onChange({...settings, [key]: value});
    // }
  }

  return (<div className="space-y-6">
    <FormSelect
      label={t("tactical.hardLevel")}
      className="w-full"
      value={draft.totalForceFightDifficulty.toString()}
      onChange={handleChange("totalForceFightDifficulty")}
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