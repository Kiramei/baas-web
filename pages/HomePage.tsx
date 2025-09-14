// HomePage.tsx
import React, {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useApp} from '../contexts/AppContext';
import Button from '../components/ui/Button';
import Logger from '../components/ui/Logger';
import AssetsDisplay from '../components/AssetsDisplay';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/Card';
import {FileUp, Hourglass, KeyboardIcon, Logs, Play, Square} from 'lucide-react';
import SwitchButton from "@/components/ui/SwitchButton.tsx";
import {HotkeyConfig, HotkeySettingsModal} from "@/components/HotkeyConfig.tsx";

import {useBindHotkeyHandlers, useRemoteHotkeys} from '@/hooks/useHotkeys';
import {ProfileProps} from "@/lib/types.ts";
import {TaskStatus} from "@/components/HomeTaskStatus.tsx";
import {attachCtrlWheelZoom} from "@/lib/zoom.ts";

const HomePage: React.FC<ProfileProps> = ({profileId}) => {
  const {t} = useTranslation();
  const {scriptRunning, startScript, stopScript, logs, assets, schedulerStatus} = useApp();
  const [scrollToEnd, setScrollToEnd] = useState<boolean>(true);
  const [hotkeyModalOpen, setHotkeyModalOpen] = useState(false);

  const {profiles, activeProfile, updateProfile} = useApp();
  const pid = profileId ?? activeProfile?.id;
  const profile = useMemo(() => profiles.find(p => p.id === pid) ?? activeProfile ?? null, [profiles, pid, activeProfile]);
  const settings = profile?.settings ?? {};

  // 懒加载：仅在模态框打开时获取远端热键
  const {hotkeys, setHotkeys, loading, save} = useRemoteHotkeys(t, hotkeyModalOpen);


  const handlers = useMemo(() => ({
    'toggle-run': () => (scriptRunning ? stopScript() : startScript()),
    'toggle-scroll': () => setScrollToEnd(v => !v),
    'open-settings': () => setHotkeyModalOpen(true),
    // 'clear-logs':  () => ...
    // 'focus-search':() => ...
    // 'help':        () => ...
  }), [scriptRunning, startScript, stopScript]);

  useBindHotkeyHandlers(hotkeys as HotkeyConfig[] | null, handlers);

  // 关闭模态框时保存（你也可以改为“点保存按钮时保存”，看 Modal 内部实现）
  const handleCloseModal = async () => {
    if (hotkeys) await save(hotkeys);
    setHotkeyModalOpen(false);
  };

  const exportLog = () => {
    const content = logs.map(
      l => `[${l.timestamp}] ${l.level}: ${l.message}`
    ).join('\n');

    const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="h-full flex flex-col min-h-0 gap-2">
      {/* 头部 */}
      <div className="flex justify-between items-center shrink-0">
        <div className={'flex'}>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('home')}</h2>
          <h2 className="text-2xl ml-3 text-slate-500 dark:text-slate-400">#{profile?.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setHotkeyModalOpen(true)}
            className="flex items-center"
          >
            <KeyboardIcon className="w-4 h-4 mr-2"/>
            {t('hotkeys')}
          </Button>

          <Button
            onClick={scriptRunning ? stopScript : startScript}
            variant={scriptRunning ? 'danger' : 'primary'}
            className="w-32 flex items-center justify-center"
          >
            {scriptRunning ? <Square className="w-4 h-4 mr-2"/> : <Play className="w-4 h-4 mr-2"/>}
            {scriptRunning ? t('stop') : t('start')}
          </Button>
        </div>
      </div>


      {/* 状态 */}
      <TaskStatus schedulerStatus={schedulerStatus}/>


      {/* 资产区 */}
      <div className="shrink-0">
        <AssetsDisplay assets={assets}/>
      </div>


      {/* 日志卡片 */}
      <Card className="flex-1 min-h-100 flex flex-col">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>
            <div className="flex items-center gap-2">
              <Logs/> {t('logs')}
            </div>

          </CardTitle>
          <div className={'flex items-center justify-center'}>
            <SwitchButton
              checked={scrollToEnd}
              onChange={setScrollToEnd}
              label={t('log.scroll')}
            />
            <Button onClick={exportLog} className='ml-2'>
              <div className='flex'>
                <FileUp size={20} className={'mr-2'}/>
                {t('log.export')}
              </div>

            </Button>
          </div>

        </CardHeader>

        <CardContent className="flex-1 min-h-0 p-0 flex">
          <Logger logs={logs} scrollToEnd={scrollToEnd}/>
        </CardContent>
      </Card>

      {/* 模态框：打开=查看（loading 时可在 Modal 内做骨架屏/禁用保存） */}
      <HotkeySettingsModal
        isOpen={hotkeyModalOpen}
        onClose={handleCloseModal}
        value={hotkeys ?? []}
        onChange={setHotkeys as (v: HotkeyConfig[]) => void}
        // 你若能改 Modal，建议加 onSave={() => save(hotkeys ?? [])} 与 disabled={loading}
      />
    </div>
  );
};

export default HomePage;
