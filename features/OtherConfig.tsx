import React from "react";
import type {AppSettings} from "@/lib/types";
import {useApp} from "@/contexts/AppContext";
import {useTranslation} from "react-i18next";
import {FormInput} from "@/components/ui/FormInput.tsx";

type OtherConfigProps = {
  onClose: () => void;
  profileId?: string;
  settings?: Partial<AppSettings>;
  onChange?: (patch: Partial<AppSettings>) => Promise<void>;
};

const OtherConfig: React.FC<OtherConfigProps> = ({
                                                   profileId,
                                                 }) => {
  const {t} = useTranslation();
  const {activeProfile} = useApp();

  const handleFhx = async () => {
    // ⚠️ 接口留空，需要你在这里实现与后端或主线程交互
    // 例如 window.electron.ipcRenderer.invoke("fhx")
    console.log("一键反和谐 triggered");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <div>
          <label className="text-slate-700 dark:text-slate-200 font-medium">
            {t("other.fhx")}
          </label>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("other.fhxDesc")}
          </p>
        </div>
        <button
          onClick={handleFhx}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          {t("execute")}
        </button>
      </div>
    </div>
  );
};

export default OtherConfig;
