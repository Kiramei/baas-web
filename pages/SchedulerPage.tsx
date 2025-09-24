import React, {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useApp} from '../contexts/AppContext';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/Card';
import {CheckCircle2, Hourglass, RefreshCw, ArrowRight, ArrowLeft, Settings, Search} from 'lucide-react';
import {ProfileProps} from "@/lib/types.ts";
import {AnimatedList} from "@/components/ui/animated-list";
import {FormInput} from "@/components/ui/FormInput";
import {FormSelect} from "@/components/ui/FormSelect";
import Button from "@/components/ui/Button";
import {Separator} from "@/components/ui/separator";
import FeatureSwitchModal from "@/components/FeatureSwitchModal";

type Task = {
  id: string;
  name: string;
  time: string;
  enabled: boolean;
  priority: number
};

const SchedulerPage: React.FC<ProfileProps> = ({profileId}) => {
  const {t} = useTranslation();
  const {schedulerStatus, profiles, activeProfile, updateProfile} = useApp();

  const pid = profileId ?? activeProfile?.id;
  const profile = useMemo(() => profiles.find(p => p.id === pid) ?? activeProfile ?? null, [profiles, pid, activeProfile]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "t1",
      name: "每日签到",
      time: "2025-09-24 08:00:00",
      enabled: true,
      priority: 1,
    },
    {
      id: "t2",
      name: "刷日常副本",
      time: "2025-09-24 12:30:00",
      enabled: false,
      priority: 2,
    },
    {
      id: "t3",
      name: "活动关卡 · 故事1",
      time: "2025-09-24 10:15:00",
      enabled: true,
      priority: 3,
    },
    {
      id: "t4",
      name: "活动关卡 · 任务2",
      time: "2025-09-25 09:00:00",
      enabled: false,
      priority: 4,
    },
    {
      id: "t5",
      name: "活动关卡 · 挑战三星",
      time: "2025-09-26 14:20:00",
      enabled: true,
      priority: 5,
    },
    {
      id: "t6",
      name: "每日体力领取",
      time: "2025-09-24 06:00:00",
      enabled: true,
      priority: 6,
    },
    {
      id: "t7",
      name: "商店刷新",
      time: "2025-09-24 21:00:00",
      enabled: false,
      priority: 7,
    },
    {
      id: "t8",
      name: "每周扫荡",
      time: "2025-09-27 20:00:00",
      enabled: true,
      priority: 8,
    },
    {
      id: "t9",
      name: "公会战报名",
      time: "2025-09-25 18:30:00",
      enabled: false,
      priority: 9,
    },
    {
      id: "t10",
      name: "自动周常结算",
      time: "2025-09-28 00:00:00",
      enabled: true,
      priority: 10,
    },
  ]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"default" | "time">("default");
  const [modalTask, setModalTask] = useState<Task | null>(null);

  const filtered = useMemo(() => {
    let base = tasks.filter(t => t.name.includes(search));

    if (sortKey === "default") {
      // 默认排序：按 priority
      base = [...base].sort((a, b) => a.priority - b.priority);
    } else if (sortKey === "time") {
      // 按时间排序
      base = [...base].sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
      );
    }

    return base;
  }, [tasks, search, sortKey]);

  const left = filtered.filter(t => !t.enabled);
  const right = filtered.filter(t => t.enabled);


  const onUpdate = (newTasks: Task[]) => setTasks(newTasks);

  const moveOne = (task: Task, toRight: boolean) => {
    onUpdate(tasks.map(t => t.id === task.id ? {...t, enabled: toRight} : t));
  };

  const moveAll = (toRight: boolean) => {
    onUpdate(tasks.map(t => ({...t, enabled: toRight})));
  };

  const refreshAll = () => {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    onUpdate(tasks.map(t => ({...t, time: now})));
  };

  const handleUpdateTask = (updated: Task) => {
    onUpdate(tasks.map(t => (t.id === updated.id ? updated : t)));
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
          <CardContent className="flex justify-center items-center h-50">
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
              <CheckCircle2 className="w-5 h-5 mr-2 text-green-500"/>
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
        <Button variant="primary" onClick={refreshAll} className="mr-2 rounded-[50%] w-8 h-8">
          <RefreshCw className="w-4 h-4 translate-x-[-8px]"/>
        </Button>
      </div>

      {/* 下半部分：任务穿梭面板 */}
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-40">
        {/* 左边表格 */}
        <Card className="flex flex-col min-h-0">
          <CardContent className="flex flex-col flex-1 min-h-0">
            <div className="flex justify-between mb-2">
              <span className="font-medium">{t("scheduler.inactiveTasks")}</span>
              <Button variant="primary" onClick={() => moveAll(true)} className="rounded-[50%] w-8 h-8 mr-4.5">
                <ArrowRight className="w-4 h-4 translate-x-[-8px]"/>
              </Button>
            </div>
            <div className="flex-1 min-h-0 overflow-auto space-y-2 scroll-embedded pr-1">
              {left.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 p-2 rounded-md gap-2"
                >
                  <span className="flex-1 pl-2">{task.name}</span>
                  <FormInput
                    type="text"
                    value={task.time}
                    onChange={(e) =>
                      onUpdate(tasks.map(t =>
                        t.id === task.id ? {...t, time: e.target.value} : t
                      ))
                    }
                    className="flex-1"
                  />
                  <Button
                    variant="primary"
                    onClick={() => setModalTask(task)}
                    className="rounded-[50%] w-8 h-8"
                  >
                    <Settings className="w-4 h-4 translate-x-[-8px]"/>
                  </Button>
                  <Separator orientation="vertical" className="!h-8"/>
                  <Button
                    variant="primary"
                    onClick={() => moveOne(task, true)}
                    className="rounded-[50%] w-8 h-8"
                  >
                    <ArrowRight className="w-4 h-4 translate-x-[-8px]"/>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 右边表格 */}
        <Card className="flex flex-col min-h-0">
          <CardContent className="flex flex-col flex-1 min-h-0">
            <div className="flex justify-between mb-2">
              <Button variant="primary" onClick={() => moveAll(false)} className="rounded-[50%] w-8 h-8 ml-2">
                <ArrowLeft className="w-4 h-4 translate-x-[-8px]"/>
              </Button>
              <span className="font-medium">{t("scheduler.activeTasks")}</span>
            </div>
            <div className="flex-1 min-h-0 overflow-auto space-y-2 scroll-embedded pr-1">
              {right.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 p-2 rounded-md gap-2"
                >
                  <Button
                    onClick={() => moveOne(task, false)}
                    className="rounded-[50%] w-8 h-8"
                  >
                    <ArrowLeft className="w-4 h-4 translate-x-[-8px]"/>
                  </Button>
                  <Separator orientation="vertical" className="!h-8"/>
                  <Button
                    onClick={() => setModalTask(task)}
                    className="mr-2 rounded-[50%] w-8 h-8"
                  >
                    <Settings className="w-4 h-4 translate-x-[-8px]"/>
                  </Button>
                  <FormInput
                    type="text"
                    value={task.time}
                    onChange={(e) =>
                      onUpdate(tasks.map(t =>
                        t.id === task.id ? {...t, time: e.target.value} : t
                      ))
                    }
                    className="flex-1"
                  />
                  <span className="flex-1 text-right mr-2">{task.name}</span>
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
        />
      )}
    </div>
  );
};

export default SchedulerPage;
