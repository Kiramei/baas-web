import React, {useState, useMemo} from "react";
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@/components/ui/tabs";
import {Switch} from "@/components/ui/switch.tsx";
import {Input} from "@/components/ui/input";
import {Select, SelectTrigger, SelectContent, SelectItem, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {toast} from "sonner"
import {useApp} from "@/contexts/AppContext";
import type {AppSettings} from "@/lib/types";
import {useTranslation} from "react-i18next";
import SwitchButton from "@/components/ui/SwitchButton.tsx";
import {FormInput} from "@/components/ui/FormInput.tsx";
import {FormSelect} from "@/components/ui/FormSelect.tsx";

type ArtifactConfigProps = {
  onClose: () => void;
  settings?: Partial<AppSettings>;
};

const ArtifactConfig: React.FC<ArtifactConfigProps> = ({onClose, settings}) => {
  const {t} = useTranslation();
  const {activeProfile, updateProfile} = useApp();

  const ext = useMemo(() => {
    const s = settings ?? activeProfile?.settings ?? {};
    return {
      use_acceleration_ticket: (s as any).use_acceleration_ticket ?? false,
      createTime: (s as any).createTime ?? "1",
      create_phase: (s as any).create_phase ?? 1,
    };
  }, [settings, activeProfile]);

  const [useTicket, setUseTicket] = useState(ext.use_acceleration_ticket);
  const [createTime, setCreateTime] = useState(ext.createTime);
  const [phaseCount, setPhaseCount] = useState(ext.create_phase);

  const handleSave = async () => {
    if (!activeProfile) return;
    await updateProfile(activeProfile.id, {
      settings: {
        ...activeProfile.settings,
        use_acceleration_ticket: useTicket,
        createTime,
        create_phase: phaseCount,
      },
    });
    toast.success(t("artifact.saved"), {description: t("artifact.savedDesc")});
    onClose();
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="global" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="global">{t("artifact.global")}</TabsTrigger>
          {[...Array(phaseCount)].map((_, i) => (
            <TabsTrigger key={i} value={`phase${i + 1}`}>
              {t("artifact.phase")}_{i + 1}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* 全局配置 Tab */}
        <TabsContent value="global">
          <div className="flex flex-col justify-between gap-4 mt-4">
            <SwitchButton
              label={t("artifact.useTicketDesc")}
              checked={useTicket}
              onChange={setUseTicket}
              className="w-full"
            />


            <FormInput
              id="createTime"
              name="createTime"
              label={t("artifact.createTime")}
              type="number"
              value={createTime}
              onChange={(e) => setCreateTime(e.target.value)}
              min="1"
              max="10"
            />

            <FormSelect
              label={t("artifact.phaseCount")}
              value={phaseCount.toString()}
              onChange={(v) => setPhaseCount(Number(v))}
              options={[1, 2, 3].map((p) => ({value: p.toString(), label: p.toString()}))}
              className="w-full"
              placeholder={t("selectPlaceholder") || undefined}
            />

          </div>
        </TabsContent>

        {/* 分阶段配置 Tab */}
        {[...Array(phaseCount)].map((_, i) => (
          <TabsContent key={i} value={`phase${i + 1}`}>
            <ArtifactPhaseConfig phase={i + 1} settings={settings}/>
          </TabsContent>
        ))}
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

type ArtifactPhaseConfigProps = {
  phase: number;
  settings?: Partial<AppSettings>;
};

const ArtifactPhaseConfig: React.FC<ArtifactPhaseConfigProps> = ({phase, settings}) => {
  const {t} = useTranslation();

  // 材料选择映射
  const phaseMethods: Record<number, Record<string, string>> = {
    1: {default: t("artifact.default")},
    2: {
      primary: t("artifact.white"),
      normal: t("artifact.blue"),
      primary_normal: t("artifact.whiteBlue"),
      advanced: t("artifact.gold"),
      superior: t("artifact.purple"),
      advanced_superior: t("artifact.goldPurple"),
      primary_normal_advanced_superior: t("artifact.all"),
    },
    3: {
      advanced: t("artifact.gold"),
      superior: t("artifact.purple"),
      advanced_superior: t("artifact.goldPurple"),
    },
  };

  const [method, setMethod] = useState(Object.keys(phaseMethods[phase])[0]);
  const [priority, setPriority] = useState<string>("");

  const handleSavePriority = () => {
    toast.success(t("artifact.prioritySaved"), {
      description: `${t("artifact.phase")} ${phase} ${t("artifact.updated")}`,
    });
  };

  return (
    <div className="space-y-4">
      {/* 材料选择 */}
      <div>
        <label className="block mb-1">{t("artifact.materialSelect")}</label>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="w-full">
            <SelectValue/>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(phaseMethods[phase]).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Phase2 推荐优先级 */}
      {phase === 2 && (
        <div>
          <label className="block mb-1">{t("artifact.phase2.recommend")}</label>
          <Select
            onValueChange={(val) => {
              // TODO: 替换成 config.static_config 数据
              setPriority(val);
              handleSavePriority();
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("artifact.selectStudent")}/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Alice">{t("student.alice")}</SelectItem>
              <SelectItem value="Bob">{t("student.bob")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 制造优先级 */}
      <div>
        <label className="block mb-1">{t("artifact.priority")}</label>
        <Textarea
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          placeholder="A > B > C"
          className="min-h-[120px]"
        />
      </div>
    </div>
  );
};

export default ArtifactConfig;
