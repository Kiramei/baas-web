import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../contexts/AppContext";
import type { AppSettings } from "../lib/types.ts";
import { EllipsisWithTooltip } from "@/components/ui/etooltip.tsx";

// shadcn tabs
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

type TabKey = "common" | "tactical";

const ShopConfig: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useTranslation();
  const { activeProfile, staticConfig, saveProfile } = useApp();

  const _default_goods_ =
    staticConfig.common_shop_price_list.CN as Array<[string, number, string]>;
  const _default_tactical_shop_goods_ =
    staticConfig.tactical_challenge_shop_price_list.CN as Array<
      [string, number, string]
    >;

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

  // 默认显示 common
  const [activeTab, setActiveTab] = useState<TabKey>("common");

  const def = shopDefs[activeTab];

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

  const toggleItem = (i: number) => {
    setSettings((prev) => {
      const list = [...prev.list];
      list[i] = list[i] === 1 ? 0 : 1;
      return { ...prev, list };
    });
  };

  const handleRefreshChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = Number(e.target.value);
    if (Number.isFinite(n)) {
      setSettings((prev) => ({
        ...prev,
        refresh: Math.max(0, Math.min(5, n)),
      }));
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
      <Tabs
        defaultValue="common"
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as TabKey)}
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="common">{shopDefs.common.title}</TabsTrigger>
          <TabsTrigger value="tactical">{shopDefs.tactical.title}</TabsTrigger>
        </TabsList>

        {(["common", "tactical"] as TabKey[]).map((tab) => {
          const def = shopDefs[tab];
          return (
            <TabsContent key={tab} value={tab} className="space-y-2">
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
                        <EllipsisWithTooltip text={nameKey} />
                        <div
                          className={`text-sm ${
                            enabled
                              ? "text-slate-200"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {priceText}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

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
