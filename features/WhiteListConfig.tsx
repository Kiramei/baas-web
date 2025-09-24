import React, {useState, useEffect, useMemo} from "react";
import {useTranslation} from "react-i18next";
import {useApp} from "@/contexts/AppContext";
import type {AppSettings} from "@/lib/types.ts";
import {toast} from "sonner"
import {FormInput} from "@/components/ui/FormInput.tsx";

type WhiteListConfigProps = {
  onClose: () => void;
  profileId?: string;
  settings?: Partial<AppSettings>;
  onChange?: (patch: Partial<AppSettings>) => Promise<void>;
};

const WhiteListConfig: React.FC<WhiteListConfigProps> = ({
                                                           onClose,
                                                           profileId,
                                                           settings,
                                                           onChange,
                                                         }) => {
  const {t} = useTranslation();
  const {activeProfile, updateProfile} = useApp();

  const ext = useMemo(() => {
    const s = settings ?? activeProfile?.settings ?? {};
    return {
      server_mode: (s as any).server_mode ?? "CN",
      clear_friend_white_list: Array.isArray((s as any).clear_friend_white_list)
        ? (s as any).clear_friend_white_list
        : [],
    };
  }, [settings, activeProfile]);

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
    if (onChange) {
      await onChange(patch);
    } else if (activeProfile) {
      await updateProfile(activeProfile.id, {
        settings: {...activeProfile.settings, ...patch},
      });
    }
    setInputCode("");
    toast.success(t("friend.addedSuccess"), {
      description: t("friend.added") + code,
    });
  };

  const handleDelete = async (code: string) => {
    const newList = whiteList.filter((c) => c !== code);
    setWhiteList(newList);

    const patch: Partial<AppSettings> = {clear_friend_white_list: newList};
    if (onChange) {
      await onChange(patch);
    } else if (activeProfile) {
      await updateProfile(activeProfile.id, {
        settings: {...activeProfile.settings, ...patch},
      });
    }

    toast.success(t("friend.deletedSuccess"), {
      description: t("friend.deleted") + code,
    });
  };

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
          {t("confirm")}
        </button>
      </div>

      {/* 标签模式展示 */}
      <div className="flex flex-wrap gap-2">
        {whiteList.map((code) => (
          <span
            key={code}
            className="inline-flex items-center px-3 py-1 rounded-full bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100"
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
    </div>
  );
};

export default WhiteListConfig;
