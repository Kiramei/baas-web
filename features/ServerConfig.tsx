import React from 'react';
import {useTranslation} from 'react-i18next';
import {useApp} from '../contexts/AppContext';
import type {AppSettings} from '../lib/types.ts';
import {FormSelect} from "@/components/ui/FormSelect.tsx";
import {FormInput} from "@/components/ui/FormInput.tsx";
import ADBSeekModal from "@/components/ADBSeekModal.tsx";

interface ServerConfigProps {
  onClose: () => void;
}

const ServerConfig: React.FC<ServerConfigProps> = ({onClose}) => {
  const {t} = useTranslation();
  const {activeProfile, saveProfile} = useApp();

  const [settings, setSettings] = React.useState<Partial<AppSettings>>(activeProfile?.settings || {});

  React.useEffect(() => {
    setSettings(activeProfile?.settings || {});
  }, [activeProfile]);

  const handleChange = (key: string) => (value: string) => {
    setSettings(prev => ({...prev, [key]: value}));
  };

  const handleSave = async () => {
    if (activeProfile) {
      const updatedProfile = {
        ...activeProfile,
        settings: {
          ...activeProfile.settings,
          ...settings
        } as AppSettings
      };
      await saveProfile(updatedProfile);
      onClose();
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setSettings(prev => ({...prev, [name]: value}));
  }

  return (
    <div className="space-y-2">
      <FormSelect
        label={t('server.server')}
        value={settings.server}
        onChange={handleChange("server")}
        options={[
          {value: 'CN', label: t('server.cn')},
          {value: 'Global', label: t('server.global')},
          {value: 'JP', label: t('server.jp')},
        ]}
      />

      <FormInput
        id="adbIP"
        name="adbIP"
        type="text"
        label={t('server.adbIP')}
        value={settings.adbIP}
        onChange={handleInputChange}
        className="w-full"
        placeholder="127.0.0.1"
      />

      <div className="flex items-end justify-end gap-2">
        <FormInput
          id="adbPort"
          name="adbPort"
          label={t('server.adbPort')}
          type="number"
          value={settings.adbPort}
          onChange={handleInputChange}
          className="flex-1"
          min={0}
          max={65535}
        />

        <ADBSeekModal onSelect={
          (address) => setSettings(prev => {
            const [ip, port] = address.split(':');
            return {...prev, adbIP: ip, adbPort: port}
          })
        }/>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
        <button onClick={handleSave}
                className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200">{t('save')}</button>
      </div>
    </div>
  );
};

export default ServerConfig;
