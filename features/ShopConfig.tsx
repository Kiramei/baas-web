import React, {useState, useEffect, useMemo} from "react";
import {useTranslation} from "react-i18next";
import {useApp} from "../contexts/AppContext";
import type {AppSettings} from "../lib/types.ts";
import { EllipsisWithTooltip } from "@/components/ui/etooltip.tsx";

const _default_goods_ = [
  ["初级经验书", 12500, "creditpoints"],
  ["中级经验书", 125000, "creditpoints"],
  ["高级经验书", 300000, "creditpoints"],
  ["特级经验书", 500000, "creditpoints"],
  ["初级经验珠", 10000, "creditpoints"],
  ["中级经验珠", 40000, "creditpoints"],
  ["高级经验珠", 96000, "creditpoints"],
  ["特级经验珠", 128000, "creditpoints"],
  ["强化珠礼包A", 110000, "creditpoints"],
  ["强化珠礼包B", 240000, "creditpoints"],
  ["强化珠礼包C", 384000, "creditpoints"],
  ["强化珠礼包D", 496000, "creditpoints"],
  ["随机初级神秘古物", 8000, "creditpoints"],
  ["随机中级神秘古物", 25000, "creditpoints"],
];

const _default_tactical_shop_goods_ = [
  ["宫子神明文字x5", 50, "arena"],
  ["静子神明文字x5", 50, "arena"],
  ["真白神明文字x5", 50, "arena"],
  ["纱绫神明文字x5", 50, "arena"],
  ["风香神明文字x5", 50, "arena"],
  ["歌原神明文字x5", 50, "arena"],
  ["30AP", 15, "arena"],
  ["60AP", 30, "arena"],
  ["初级经验书x5", 5, "arena"],
  ["中级经验书x10", 25, "arena"],
  ["高级经验书x3", 60, "arena"],
  ["特级经验书x1", 100, "arena"],
  ["信用点x5k", 4, "arena"],
  ["信用点x75k", 60, "arena"],
  ["信用点x125k", 10, "arena"],
];

type TabKey = "common" | "tactical";

const ShopConfig: React.FC<{ onClose: () => void }> = ({onClose}) => {
  const {t} = useTranslation();
  const {activeProfile, saveProfile} = useApp();

  const [activeTab, setActiveTab] = useState<TabKey>("common");

  // 统一映射
  const shopDefs = {
    common: {
      title: t("commonShop.title"),
      listKey: "CommonShopList",
      refreshKey: "CommonShopRefreshTime",
      defaultGoods: _default_goods_,
    },
    tactical: {
      title: t("tacticalShop.title"),
      listKey: "TacticalShopList",
      refreshKey: "TacticalShopRefreshTime",
      defaultGoods: _default_tactical_shop_goods_,
    },
  } as const;

  const def = shopDefs[activeTab];

  // 从 settings 取当前 tab 的数据
  const ext = useMemo(() => {
    const s = activeProfile?.settings ?? {};
    const list: number[] = Array.isArray((s as any)[def.listKey])
      ? (s as any)[def.listKey]
      : new Array(def.defaultGoods.length).fill(0);

    return {
      list:
        list.length === def.defaultGoods.length
          ? list
          : new Array(def.defaultGoods.length)
            .fill(0)
            .map((_, i) => list[i] ?? 0),
      refresh: (s as any)[def.refreshKey] ?? 0,
    };
  }, [activeProfile, def]);

  const [settings, setSettings] = useState(ext);

  // useEffect(() => {
  //     setSettings(ext);
  // }, [ext]);

  const toggleItem = (i: number) => {
    setSettings((prev) => {
      const list = [...prev.list];
      list[i] = list[i] === 1 ? 0 : 1;
      return {...prev, list};
    });
  };

  const handleRefreshChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = Number(e.target.value);
    if (Number.isFinite(n)) {
      setSettings((prev) => ({...prev, refresh: Math.max(0, Math.min(5, n))}));
    }
  };

  const handleSave = async () => {
    if (activeProfile) {
      const updatedProfile = {
        ...activeProfile,
        settings: {
          ...activeProfile.settings,
          [def.listKey]: settings.list,
          [def.refreshKey]: settings.refresh,
        } as AppSettings,
      };
      await saveProfile(updatedProfile);
      onClose();
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-slate-200 dark:border-slate-700">
        {(["common", "tactical"] as TabKey[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab
                ? "border-b-2 border-primary-600 text-primary-600"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            {shopDefs[tab].title}
          </button>
        ))}
      </div>

      {/* 刷新次数 */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <div>
          <label className="text-slate-700 dark:text-slate-200 font-medium">
            {t("commonShop.refreshTimes")}
          </label>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("commonShop.refreshDesc")}
          </p>
        </div>
        <input
          type="number"
          min={0}
          max={5}
          value={settings.refresh}
          onChange={handleRefreshChange}
          className="w-20 px-2 py-1 border rounded bg-white dark:bg-slate-800"
        />
      </div>

      {/* 商品列表 */}
      <div className="max-h-[40vh] overflow-y-auto pr-1 grid grid-cols-2 gap-1">
        {def.defaultGoods.map(([nameKey, price, coin], i) => {
          const enabled = settings.list[i] === 1;
          const priceText =
            coin === "creditpoints"
              ? `${price} ${t("creditpoints")}`
              : `${price} ${t("pyroxene")}`;

          return (
            <div
              key={`${nameKey}-${i}`}
              className={`${
                enabled
                  ? "bg-primary-600 text-white hover:bg-primary-700"
                  : "bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
              } p-2 rounded-lg cursor-pointer`}
              onClick={() => toggleItem(i)}
            >
              <div>
                {/* <div className="font-medium overflow-hidden whitespace-nowrap text-ellipsis">
                  {t(`ConfigTranslation.${nameKey}`)}
                </div> */}
                  <EllipsisWithTooltip text={t(`ConfigTranslation.${nameKey}`)} />
                <div
                  className={`text-sm ${
                    enabled ? "text-slate-200" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {priceText}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 保存按钮 */}
      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700"
        >
          {t("save")}
        </button>
      </div>
    </div>
  );
};

export default ShopConfig;
