import React, {useCallback, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Card, CardDescription, CardHeader, CardTitle} from '../components/ui/Card';
import {Modal} from '@/components/ui/Modal';
import CafeConfig from '@/features/CafeConfig';
import ServerConfig from '@/features/ServerConfig';
import ScheduleConfig from '@/features/ScheduleConfig';
import ShopConfig from '@/features/ShopConfig';
import ArenaConfig from '@/features/ArenaConfig';
import DailySweep from "@/features/DailySweep"; // 取 activeProfile / updateProfile
import TacticalConfig from "@/features/TacticalConfig.tsx";
import EmulatorConfig from '@/features/EmulatorConfig';
import PushConfig from '@/features/PushConfig';
import OtherConfig from '@/features/OtherConfig';
import {ArrowUpFromLine, BrushCleaning, Database, LucideProps} from 'lucide-react';
import {Coffee, Dices, Settings2, ShoppingCart, Swords, Server} from 'lucide-react';
import {motion, Variants} from 'framer-motion';
import {useApp} from '@/contexts/AppContext';
import {ProfileProps} from "@/lib/types.ts";

type Feature =
  'cafe'
  | 'schedule'
  | 'shop'
  | 'arena'
  | 'dailySweep'
  | 'tactical'
  | 'server'
  | 'emulator'
  | 'push'
  | 'other';

const FeatureWidthDict = {
  'cafe': 50,
  'schedule': 50,
  'shop': 50,
  'arena': 30,
  'dailySweep': 70,
  'server': 30,
  'emulator': 30,
  'push': 30,
  'other': 30,
}

// ✅ 新：给 Feature 的最小建议 props（向后兼容）
export interface FeatureComponentProps {
  onClose: () => void;
  profileId?: string;
  settings?: any;
  onChange?: (patch: any) => Promise<void>; // 只改当前配置的 settings（部分）
}

// map 同名不变；我们会把 settings/onChange 注入给它们
const featureMap: Record<Feature, {
  icon: React.FC<LucideProps>,
  descKey: string,
  component: React.FC<FeatureComponentProps>
}> = {
  cafe: {icon: Coffee, descKey: 'cafeDesc', component: CafeConfig},
  schedule: {icon: Dices, descKey: 'scheduleDesc', component: ScheduleConfig},
  shop: {icon: ShoppingCart, descKey: 'shopDesc', component: ShopConfig},
  arena: {icon: Swords, descKey: 'arenaDesc', component: ArenaConfig},
  dailySweep: {icon: BrushCleaning, descKey: 'dailySweepDesc', component: DailySweep},
  tactical: {icon: Dices, descKey: 'tacticalDesc', component: TacticalConfig},

  server: {icon: Server, descKey: 'serverDesc', component: ServerConfig},
  emulator: {icon: Database, descKey: 'emulatorDesc', component: EmulatorConfig},
  push: {icon: ArrowUpFromLine, descKey: 'pushDesc', component: PushConfig},
  other: {icon: Settings2, descKey: 'otherDesc', component: OtherConfig},
};

const gridVariants = {
  show: {transition: {staggerChildren: 0.05}},
};
const cardVariants: Variants = {
  hidden: {opacity: 0, y: 8, scale: 0.98},
  show: {opacity: 1, y: 0, scale: 1, transition: {duration: 0.18, ease: 'easeOut'}},
};

const MotionCard: React.FC<React.PropsWithChildren<{ onClick?: () => void }>> = ({children, onClick}) => (
  <motion.div
    variants={cardVariants}
    initial="hidden"
    animate="show"
    whileHover={{y: -2}}
    whileTap={{scale: 0.99}}
    className="cursor-pointer"
    onClick={onClick}
  >
    <Card>{children}</Card>
  </motion.div>
);

const ConfigurationPage: React.FC<ProfileProps> = ({profileId}) => {
  const {t} = useTranslation();
  const {profiles, activeProfile, updateProfile} = useApp();

  // 当前配置 id
  const pid = profileId ?? activeProfile?.id;
  const profile = useMemo(() => profiles.find(p => p.id === pid) ?? activeProfile ?? null, [profiles, pid, activeProfile]);
  const settings = profile?.settings ?? {};

  // 只更新当前 profile 的 settings（部分 patch）
  const patchSettings = useCallback(async (patch: any) => {
    if (!profile) return;
    const next = {...settings, ...patch};
    await updateProfile(profile.id, {settings: next}); // AppContext 已实现合并与后端调用
  }, [profile, settings, updateProfile]);

  const [modalContent, setModalContent] = useState<Feature | null>(null);
  const [modalWidth, setModalWidth] = useState<number | null>(null);

  const openModal = (feature: Feature) => {
    setModalWidth(FeatureWidthDict[feature]);
    setModalContent(feature);
  }
  const closeModal = () => {
    setModalContent(null);
  }

  const featureGroups: Record<string, Feature[]> = {
    [t('featureSettings')]: ['cafe', 'schedule', 'shop', 'arena', 'dailySweep', 'tactical'],
    [t('generalSettings')]: ['server', 'emulator', 'push', 'other'],
  };

  const renderFeatureCard = (feature: Feature) => {
    const {icon: Icon, descKey} = featureMap[feature];
    return (
      <MotionCard key={feature} onClick={() => openModal(feature)}>
        <CardHeader>
          <div className='flex items-center gap-4'>
            <div className="bg-primary-100 dark:bg-primary-900/50 p-3 rounded-lg">
              <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400"/>
            </div>
            <div>
              <CardTitle>{t(feature)}</CardTitle>
              <CardDescription>{t(descKey)}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </MotionCard>
    );
  };

  const CurrentModalContent = modalContent ? featureMap[modalContent].component : null;

  return (
    <div className="space-y-8">
      <div className="flex items-baseline justify-between">
        <div className={'flex'}>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('configuration')}</h2>
          <h2 className="text-2xl ml-3 text-slate-500 dark:text-slate-400">#{profile?.name}</h2>
        </div>
      </div>

      {/* 卡片栅格 + 入场级联动画 */}
      <motion.div variants={gridVariants} initial="show" animate="show" className="space-y-8">
        {Object.entries(featureGroups).map(([groupTitle, features]) => (
          <section key={groupTitle}>
            <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200">{groupTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {features.map(renderFeatureCard)}
            </div>
          </section>
        ))}
      </motion.div>

      {/* 弹窗：把 profileId / settings / onChange 下发（Feature 可按需使用） */}
      {modalContent && CurrentModalContent && (
        <Modal isOpen title={t(modalContent)} onClose={closeModal} width={modalWidth}>
          <CurrentModalContent
            onClose={closeModal}
            profileId={profile?.id}
            settings={settings}
            onChange={patchSettings}
          />
        </Modal>
      )}
    </div>
  );
};

export default ConfigurationPage;
