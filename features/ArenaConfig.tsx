import React, {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useApp} from '../contexts/AppContext';
import type {AppSettings} from '../lib/types.ts';
import {FormInput} from "@/components/ui/FormInput.tsx";
import {FormSelect} from "@/components/ui/FormSelect.tsx";

interface ArenaConfigProps {
  onClose: () => void;
}

interface ArenaConfigState {
  higher_level: number;
  max_refresh_times: number;
  opponent_no: number;
}

const ArenaConfig: React.FC<ArenaConfigProps> = ({onClose}) => {
  const {t} = useTranslation();
  const {activeProfile, saveProfile} = useApp();

  const [settings, setSettings] = useState<ArenaConfigState>({
    higher_level: 0,
    max_refresh_times: 0,
    opponent_no: 1,
  });

  // useEffect(() => {
  //   setSettings(activeProfile?.settings || {});
  // }, [activeProfile]);

  const handleChange = (key: string) => (value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setSettings(prev => ({...prev, [key]: numValue}));
    }
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    const numValue = parseInt(value, 10);

    if (!isNaN(numValue)) {
      setSettings(prev => ({...prev, [name]: numValue}));
    } else if (value === "") {
      setSettings(prev => ({...prev, [name]: 0})); // 或者 undefined，看你需求
    }
  };

  const handleSave = async () => {
    if (activeProfile) {
      const updatedProfile = {
        ...activeProfile,
        settings: {...activeProfile.settings, ...settings} as AppSettings,
      };
      await saveProfile(updatedProfile);
      onClose();
    }
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
          value={settings.higher_level}
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
          value={settings.max_refresh_times}
          onChange={handleNumericChange}
          min="0"
        />


        <FormSelect
          label={t("arena.opponent_no")}
          className="w-full"
          value={settings.opponent_no.toString()}
          onChange={handleChange("opponent_no")}
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
