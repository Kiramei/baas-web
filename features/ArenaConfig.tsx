import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {FormInput} from "@/components/ui/FormInput.tsx";
import {FormSelect} from "@/components/ui/FormSelect.tsx";
import {useWebSocketStore} from "@/store/websocketStore.ts";
import {DynamicConfig} from "@/lib/type.dynamic.ts";

interface ArenaConfigProps {
  profileId: string;
  onClose: () => void;
}

type Draft = {
  ArenaLevelDiff: number;
  ArenaComponentNumber: number;
  maxArenaRefreshTimes: number;
}

const ArenaConfig: React.FC<ArenaConfigProps> = ({profileId, onClose}) => {
  const {t} = useTranslation();
  const settings: Partial<DynamicConfig> = useWebSocketStore(state => state.configStore[profileId]);

  const ext = useMemo(() => {
    return {
      ArenaLevelDiff: settings.ArenaLevelDiff,
      ArenaComponentNumber: settings.ArenaComponentNumber,
      maxArenaRefreshTimes: settings.maxArenaRefreshTimes,
    } as Draft;
  }, [settings]);

  const handleChange = (key: string) => (value: string) => {
    // const numValue = parseInt(value, 10);
    // if (!isNaN(numValue)) {
    //   setSettings(prev => ({...prev, [key]: numValue}));
    // }
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // const {name, value} = e.target;
    // const numValue = parseInt(value, 10);
    //
    // if (!isNaN(numValue)) {
    //   setSettings(prev => ({...prev, [name]: numValue}));
    // } else if (value === "") {
    //   setSettings(prev => ({...prev, [name]: 0})); // 或者 undefined，看你需求
    // }
  };

  const handleSave = async () => {
    // if (activeProfile) {
    //   const updatedProfile = {
    //     ...activeProfile,
    //     settings: {...activeProfile.settings, ...settings} as AppSettings,
    //   };
    //   await saveProfile(updatedProfile);
    //   onClose();
    // }
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <FormInput
          id="higher_level"
          name="higher_level"
          label={t("arena.higherLevel")}
          type="number"
          className="w-full"
          value={settings.ArenaLevelDiff}
          onChange={handleNumericChange}
          min="-89"
          max="89"
        />

        <FormInput
          id="max_refresh_times"
          name="max_refresh_times"
          label={t("arena.max_refresh_times")}
          type="number"
          className="w-full"
          value={settings.maxArenaRefreshTimes}
          onChange={handleNumericChange}
          min="0"
        />


        <FormSelect
          label={t("arena.opponent_no")}
          className="w-full"
          value={settings.ArenaComponentNumber.toString()}
          onChange={handleChange("ArenaComponentNumber")}
          options={[
            {value: "1", label: "1"},
            {value: "2", label: "2"},
            {value: "3", label: "3"},
          ]}
          placeholder={t("selectPlaceholder") || undefined}
        />

      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          {t('save')}
        </button>
      </div>
    </div>
  );
};

export default ArenaConfig;
