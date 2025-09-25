import React, {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useApp} from '../contexts/AppContext';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/Card';
import {
  CheckCircle2,
  Hourglass,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Settings,
  Search,
  Ban,
  CalendarCheck
} from 'lucide-react';
import {ProfileProps} from "@/lib/types.ts";
import {AnimatedList} from "@/components/ui/animated-list";
import {FormInput} from "@/components/ui/FormInput";
import {FormSelect} from "@/components/ui/FormSelect";
import CButton from "@/components/ui/CButton.tsx";
import {Separator} from "@/components/ui/separator";
import FeatureSwitchModal from "@/components/FeatureSwitchModal";
import {DateTimePicker} from "@/components/DateTimePicker.tsx";
import {EventConfig} from "@/lib/type.event.ts";
import {EllipsisWithTooltip} from "@/components/ui/etooltip.tsx";

const SchedulerPage: React.FC<ProfileProps> = ({profileId}) => {
  const {t} = useTranslation();
  const {schedulerStatus, profiles, activeProfile} = useApp();

  const pid = profileId ?? activeProfile?.id;
  const profile = useMemo(() => profiles.find(p => p.id === pid) ?? activeProfile ?? null, [profiles, pid, activeProfile]);

  const {eventConfigs, setEventConfigs} = useApp();


  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"default" | "time">("default");
  const [modalTask, setModalTask] = useState<EventConfig | null>(null);

  const filtered = useMemo(() => {
    let base = eventConfigs.filter(t => t.event_name.includes(search));

    if (sortKey === "default") {
      // 默认排序：按 priority
      base = [...base].sort((a, b) => a.priority - b.priority);
    } else if (sortKey === "time") {
      // 按时间排序
      base = [...base].sort(
        (a, b) => new Date(b.next_tick).getTime() - new Date(a.next_tick).getTime()
      );
    }

    return base;
  }, [eventConfigs, search, sortKey]);

  const left = filtered.filter(t => !t.enabled);
  const right = filtered.filter(t => t.enabled);


  const onUpdate = (newConfigs: EventConfig[]) => setEventConfigs(newConfigs);

  const moveOne = (task: EventConfig, toRight: boolean) => {
    onUpdate(eventConfigs.map(t => t.func_name === task.func_name ? {...t, enabled: toRight} : t));
  };

  const changeTime = (task: EventConfig, timeStamp: number) => {
    onUpdate(eventConfigs.map(t => t.func_name === task.func_name ? {...t, next_tick: timeStamp} : t))
  }

  const moveAll = (toRight: boolean) => {
    onUpdate(eventConfigs.map(t => ({...t, enabled: toRight})));
  };

  const refreshAll = () => {
    const now = new Date().getTime();
    onUpdate(eventConfigs.map(t => ({...t, next_tick: now})));
  };

  const handleUpdateTask = (updated: EventConfig) => {
    onUpdate(eventConfigs.map(t => (t.func_name === updated.func_name ? updated : t)));
    setModalTask(null);
  };

  return (
    <div className="h-full flex flex-col gap-4 min-h-0">
      {/* 页面标题 */}
      <div className="flex">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {t("scheduler")}
        </h2>
        <h2 className="text-2xl ml-3 text-slate-500 dark:text-slate-400">
          #{profile?.name}
        </h2>
      </div>

      {/* 上半部分：运行任务 & 队列 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Hourglass className="w-5 h-5 mr-2 text-primary-500"/>
              {t('runningTask')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-42">
            {schedulerStatus.runningTask ? (
              <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                {schedulerStatus.runningTask}
              </p>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">{t('noTaskRunning')}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarCheck className="w-5 h-5 mr-2 text-green-500"/>
              {t('taskQueue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {schedulerStatus.taskQueue.length > 0 ? (
              <AnimatedList className="space-y-0 h-35 overflow-auto pr-2 gap-2" delay={50}>
                {schedulerStatus.taskQueue.map((task, index) => (
                  <div key={index} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                    <span className="text-slate-700 dark:text-slate-300">{task}</span>
                  </div>
                ))}
              </AnimatedList>
            ) : (
              <p className="h-35 max-h-35 text-slate-500 dark:text-slate-400">{t('noTasksQueued')}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 工具栏 */}
      <div className="flex items-center justify-between gap-2">
        <Search size={20}/>
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-md shadow-sm">
          <FormInput
            placeholder={t("scheduler.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-md shadow-sm">
          <FormSelect
            onChange={(value: string) => {
              setSortKey(value as ("default" | "time"))
            }}
            value={sortKey}
            options={[
              {label: t("scheduler.sortDefault"), value: "default"},
              {label: t("scheduler.sortByTime"), value: "time"}
            ]}
          />
        </div>
        <CButton variant="primary" onClick={refreshAll} className="mr-2 rounded-[50%] w-8 h-8">
          <RefreshCw className="w-4 h-4 translate-x-[-8px]"/>
        </CButton>
      </div>

      {/* 下半部分：任务穿梭面板 */}
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-40">
        {/* 左边表格 */}
        <Card className="flex flex-col min-h-0">
          <CardContent className="flex flex-col flex-1 min-h-0">
            <div className="flex justify-between mb-2">
              <div className="flex items-center">
                <Ban className="w-5 h-5 mr-2 text-red-500"/>
                <span className="font-medium">{t("scheduler.inactiveTasks")}</span>
              </div>
              <CButton variant="primary" onClick={() => moveAll(true)} className="rounded-[50%] w-8 h-8 mr-4.5">
                <ArrowRight className="w-4 h-4 translate-x-[-8px]"/>
              </CButton>
            </div>
            <div className="flex-1 min-h-0 overflow-auto space-y-2 scroll-embedded pr-1">
              {left.map((task) => (
                <div
                  key={task.func_name}
                  className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 p-2 rounded-md gap-2 min-w-0 overflow-x-hidden"
                >
                  <EllipsisWithTooltip
                    text={t("eventName."+task.func_name)}
                    className="flex-grow min-w-0 overflow-hidden text-ellipsis text-left mr-2"
                  />
                  <DateTimePicker value={task.next_tick} onChange={
                    (timeStamp) => changeTime(task, timeStamp)
                  }/>
                  <CButton
                    variant="primary"
                    onClick={() => setModalTask(task)}
                    className="rounded-[50%] w-8 h-8"
                  >
                    <Settings className="w-4 h-4 translate-x-[-8px]"/>
                  </CButton>
                  <Separator orientation="vertical" className="!h-8"/>
                  <CButton
                    variant="primary"
                    onClick={() => moveOne(task, true)}
                    className="rounded-[50%] w-8 h-8"
                  >
                    <ArrowRight className="w-4 h-4 translate-x-[-8px]"/>
                  </CButton>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 右边表格 */}
        <Card className="flex flex-col min-h-0">
          <CardContent className="flex flex-col flex-1 min-h-0">
            <div className="flex justify-between mb-2">
              <CButton variant="primary" onClick={() => moveAll(false)} className="rounded-[50%] w-8 h-8 ml-2">
                <ArrowLeft className="w-4 h-4 translate-x-[-8px]"/>
              </CButton>
              <div className="flex items-center">
                <span className="font-medium">{t("scheduler.activeTasks")}</span>
                <CheckCircle2 className="w-5 h-5 ml-2 text-green-500"/>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-auto space-y-2 scroll-embedded pr-1">
              {right.map((task) => (
                <div
                  key={task.func_name}
                  className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 p-2 rounded-md gap-2 min-w-0 overflow-x-hidden"
                >
                  <CButton
                    onClick={() => moveOne(task, false)}
                    className="rounded-[50%] w-8 h-8"
                  >
                    <ArrowLeft className="w-4 h-4 translate-x-[-8px]"/>
                  </CButton>
                  <Separator orientation="vertical" className="!h-8"/>
                  <CButton
                    onClick={() => setModalTask(task)}
                    className="rounded-[50%] w-8 h-8"
                  >
                    <Settings className="w-4 h-4 translate-x-[-8px]"/>
                  </CButton>
                  <DateTimePicker value={task.next_tick} onChange={
                    (timeStamp) => changeTime(task, timeStamp)
                  }/>

                  <EllipsisWithTooltip
                    text={t("eventName."+task.func_name)}
                    className="flex-grow min-w-0 overflow-hidden text-ellipsis text-right mr-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 配置详情弹窗 */}
      {modalTask && (
        <FeatureSwitchModal
          task={modalTask}
          onClose={() => setModalTask(null)}
          onSave={handleUpdateTask}
          allTasks={eventConfigs.map(e=>e.func_name)}
        />
      )}
    </div>
  );
};

export default SchedulerPage;
