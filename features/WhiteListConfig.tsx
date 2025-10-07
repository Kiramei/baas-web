import React, {useState, useEffect, useMemo} from "react";
import {useTranslation} from "react-i18next";
import {useApp} from "@/contexts/AppContext";
import type {AppSettings} from "@/lib/types.ts";
import {toast} from "sonner"
import {FormInput} from "@/components/ui/FormInput.tsx";
import {DynamicConfig} from "@/lib/type.dynamic.ts";
import {useWebSocketStore} from "@/store/websocketStore.ts";
import {serverMap} from "@/lib/utils.ts";

type WhiteListConfigProps = {
  onClose: () => void;
  profileId?: string;
};

const WhiteListConfig: React.FC<WhiteListConfigProps> = ({
                                                           onClose,
                                                           profileId
                                                         }) => {
  const {t} = useTranslation();
  const settings: Partial<DynamicConfig> = useWebSocketStore(state => state.configStore[profileId]);
  const server_mode = serverMap[settings.server]

  const ext = useMemo(() => {
    return {
      server_mode: server_mode,
      clear_friend_white_list: settings.clear_friend_white_list
    };
  }, [settings]);

  const [inputCode, setInputCode] = useState("");
  const [whiteList, setWhiteList] = useState<string[]>(ext.clear_friend_white_list);

  useEffect(() => {
    setWhiteList(ext.clear_friend_white_list);
  }, [ext]);

  const validateCode = (code: string): string | null => {
    let expectedLen = 7;
    if (ext.server_mode === "JP" || ext.server_mode === "Global") expectedLen = 8;

    if (code.length !== expectedLen) {
      return t("friend.invalidLength");
    }
    if (ext.server_mode === "CN") {
      if (!/^[0-9a-z]+$/.test(code)) return t("friend.invalidFormatCN");
    } else if (ext.server_mode === "Global") {
      if (!/^[A-Z]+$/.test(code)) return t("friend.invalidFormatGlobal");
    }
    return null;
  };

  const handleAdd = async () => {
    const code = inputCode.trim();
    const error = validateCode(code);
    if (error) {
      toast.error(t("friend.addFailed"), {
        description: error,
      });
      return;
    }
    if (whiteList.includes(code)) {
      toast.error(t("friend.addFailed"), {
        description: t("friend.alreadyExists"),
      });
      return;
    }
    const newList = [...whiteList, code];
    setWhiteList(newList);

    const patch: Partial<AppSettings> = {clear_friend_white_list: newList};
    // if (onChange) {
    //   await onChange(patch);
    // } else if (activeProfile) {
    //   await updateProfile(activeProfile.id, {
    //     settings: {...activeProfile.settings, ...patch},
    //   });
    // }
    setInputCode("");
    toast.success(t("friend.addedSuccess"), {
      description: t("friend.added") + code,
    });
  };

  const handleDelete = async (code: string) => {
    const newList = whiteList.filter((c) => c !== code);
    setWhiteList(newList);

    const patch: Partial<AppSettings> = {clear_friend_white_list: newList};
    // if (onChange) {
    //   await onChange(patch);
    // } else if (activeProfile) {
    //   await updateProfile(activeProfile.id, {
    //     settings: {...activeProfile.settings, ...patch},
    //   });
    // }

    toast.success(t("friend.deletedSuccess"), {
      description: t("friend.deleted") + code,
    });
  };

  const handleSave = async () => {
    onClose();
  }


  return (
    <div className="space-y-4">
      {/* 输入 + 添加 */}
      <div className="flex gap-2 items-center">
        <FormInput
          type="text"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          placeholder={t("friend.placeholder")}
          className="flex-1"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          {t("friend.add")}
        </button>
      </div>

      {/* 标签模式展示 */}
      <div className="flex flex-wrap gap-2">
        {whiteList.map((code) => (
          <span
            key={code}
            className="inline-flex items-center px-3 py-1 rounded-full bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100 font-mono font-bold"
          >
            {code}
            <button
              onClick={() => handleDelete(code)}
              className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400"
            >
              ✕
            </button>
          </span>
        ))}
        {whiteList.length === 0 && (
          <p className="text-slate-500 text-sm">{t("friend.empty")}</p>
        )}
      </div>

      {/* 保存按钮 */}
      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
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

export default WhiteListConfig;
