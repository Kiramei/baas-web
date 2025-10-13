import React, {useMemo, useState, useCallback, startTransition} from "react";
import {useTranslation} from "react-i18next";
import {useApp} from "../contexts/AppContext";
import {Card, CardContent, CardHeader, CardTitle} from "../components/ui/Card";
import {
  CheckCircle2,
  Hourglass,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Settings,
  Search,
  Ban,
} from "lucide-react";
import {ProfileProps} from "@/lib/types.ts";
import {FormInput} from "@/components/ui/FormInput";
import {FormSelect} from "@/components/ui/FormSelect";
import CButton from "@/components/ui/CButton.tsx";
import {Separator} from "@/components/ui/separator";
import FeatureSwitchModal from "@/components/FeatureSwitchModal";
import {DateTimePicker} from "@/components/DateTimePicker.tsx";
import {EventConfig} from "@/lib/type.event.ts";
import {EllipsisWithTooltip} from "@/components/ui/etooltip.tsx";
import {useWebSocketStore} from "@/store/websocketStore.ts";

// ✅ 单行任务组件，Memo 化
const TaskRow = React.memo(function TaskRow(
  {
    task,
    side,
    onMove,
    onEdit,
    onChangeTime,
    t,
  }: {
    task: EventConfig;
    side: "left" | "right";
    onMove: (task: EventConfig, toRight: boolean) => void;
    onEdit: (task: EventConfig) => void;
    onChangeTime: (task: EventConfig, ts: number) => void;
    t: (key: string) => string;
  }) {
  return (
    <div
      className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 p-2 rounded-md gap-2 min-w-0 overflow-x-hidden">
      {side === "left" ? (
        <>
          <div className="flex flex-grow min-w-0 overflow-hidden text-ellipsis text-left mr-2">
            <EllipsisWithTooltip
              text={t("eventName." + task.func_name)}
            />
          </div>
          <DateTimePicker
            value={task.next_tick * 1000}
            onChange={(ts) => onChangeTime(task, ts)}
            className="hidden xl:flex"
          />
          <CButton onClick={() => onEdit(task)} className="rounded-[50%] w-8 h-8">
            <Settings className="w-4 h-4 translate-x-[-8px]"/>
          </CButton>
          <Separator orientation="vertical" className="!h-8"/>
          <CButton onClick={() => onMove(task, true)} className="rounded-[50%] w-8 h-8">
            <ArrowRight className="w-4 h-4 translate-x-[-8px]"/>
          </CButton>
        </>
      ) : (
        <>
          <CButton onClick={() => onMove(task, false)} className="rounded-[50%] w-8 h-8">
            <ArrowLeft className="w-4 h-4 translate-x-[-8px]"/>
          </CButton>
          <Separator orientation="vertical" className="!h-8"/>
          <CButton onClick={() => onEdit(task)} className="rounded-[50%] w-8 h-8">
            <Settings className="w-4 h-4 translate-x-[-8px]"/>
          </CButton>
          <DateTimePicker
            value={task.next_tick * 1000}
            onChange={(ts) => onChangeTime(task, ts)}
            className="hidden xl:flex"
          />
          <div className="flex flex-grow min-w-0 overflow-hidden text-ellipsis text-right mr-2 justify-end">
            <EllipsisWithTooltip
              text={t("eventName." + task.func_name)}
            />
          </div>
        </>
      )}
    </div>
  );
});

const SchedulerPage: React.FC<ProfileProps> = ({profileId}) => {
  const {t} = useTranslation();
  const {profiles, activeProfile} = useApp();

  const pid = profileId ?? activeProfile?.id;
  const profile = useMemo(
    () => profiles.find((p) => p.id === pid) ?? activeProfile ?? null,
    [profiles, pid, activeProfile]
  );

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"default" | "time">("default");
  const [modalTask, setModalTask] = useState<EventConfig | null>(null);

  const runningTask = useWebSocketStore((e) => e.statusStore[profileId]?.current_task);
  const taskQueue = useWebSocketStore((e) => e.statusStore[profileId]?.waiting_tasks);
  const eventConfigs = useWebSocketStore((e) => e.eventStore[profileId] ?? []);
  const modify = useWebSocketStore((e) => e.modify);

  const filtered = useMemo(() => {
    let base = eventConfigs.filter((t) => t.event_name.includes(search));

    if (sortKey === "default") {
      base = [...base].sort((a, b) => a.priority - b.priority);
    } else if (sortKey === "time") {
      base = [...base].sort(
        (a, b) => new Date(b.next_tick).getTime() - new Date(a.next_tick).getTime()
      );
    }
    return base;
  }, [eventConfigs, search, sortKey]);

  const left = filtered.filter((t) => !t.enabled);
  const right = filtered.filter((t) => t.enabled);

  const onUpdate = useCallback(
    (newConfigs: EventConfig[]) => {
      modify(`${profileId}::event`, newConfigs);
    },
    []
  );

  const handleMoveOne = useCallback(
    (task: EventConfig, toRight: boolean) => {
      startTransition(() => {
        onUpdate(
          eventConfigs.map((t) =>
            t.func_name === task.func_name ? {...t, enabled: toRight} : t
          )
        );
      })
    },
    [eventConfigs, onUpdate]
  );

  const handleChangeTime = useCallback(
    (task: EventConfig, ts: number) => {
      onUpdate(
        eventConfigs.map((t) =>
          t.func_name === task.func_name ? {...t, next_tick: Math.floor(ts / 1000)} : t
        )
      );
    },
    [eventConfigs, onUpdate]
  );

  const handleEdit = useCallback((task: EventConfig) => {
    setModalTask(task);
  }, []);

  const moveAll = (toRight: boolean) => {
    startTransition(() => {
      onUpdate(eventConfigs.map((t) => ({...t, enabled: toRight})));
    });
  };

  const refreshAll = () => {
    const now = new Date().getTime();
    startTransition(() => {
      onUpdate(eventConfigs.map((t) => ({...t, next_tick: Math.floor(now / 1000)})));
    });
  };

  const handleUpdateTask = (updated: EventConfig) => {
    startTransition(
      () => {
        onUpdate(
          eventConfigs.map((t) =>
            t.func_name === updated.func_name ? updated : t
          )
        );
        setModalTask(null);
      }
    )
  };

  return (
    <div className="h-full flex flex-col gap-4 min-h-0">
      {/* 标题 */}
      <div className="flex">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {t("scheduler")}
        </h2>
        <h2 className="text-2xl ml-3 text-slate-500 dark:text-slate-400">
          #{profile?.name}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Hourglass className="w-5 h-5 mr-2 text-primary-500"/>
              {t("taskOverview")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {/* Running Task */}
              <div className="border-dashed border-b-2 pb-1">
                {runningTask ? (
                  <div className="px-3 py-2 bg-primary-100 dark:bg-primary-800 rounded-md">
                    <span className="text-primary-700 dark:text-primary-300 font-semibold">
                      {t("runningTask")}: {t(runningTask)}
                    </span>
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">
                    {t("noTaskRunning")}
                  </p>
                )}
              </div>

              {/* Task Queue */}
              {taskQueue && taskQueue.length > 0 ? (
                <ul className="space-y-0 h-35 overflow-auto pr-2 gap-2">
                  {taskQueue.map((task, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-md"
                    >
                      <span className="text-slate-700 dark:text-slate-300">{task}</span>
                    </div>
                  ))}
                </ul>
              ) : (
                <p className="h-35 max-h-35 text-slate-500 dark:text-slate-400">
                  {t("noTasksQueued")}
                </p>
              )}
            </div>
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
            onChange={(value: string) =>
              setSortKey(value as "default" | "time")
            }
            value={sortKey}
            options={[
              {label: t("scheduler.sortDefault"), value: "default"},
              {label: t("scheduler.sortByTime"), value: "time"},
            ]}
          />
        </div>
        <CButton
          variant="primary"
          onClick={refreshAll}
          className="mr-2 rounded-[50%] w-8 h-8"
        >
          <RefreshCw className="w-4 h-4 translate-x-[-8px]"/>
        </CButton>
      </div>

      {/* 下半部分：任务穿梭面板 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 md:min-h-40">
        {/* 左边 */}
        <Card className="flex flex-col min-h-0">
          <CardContent className="pr-1 sm:pr-4 flex flex-col flex-1 min-h-0">
            <div className="flex justify-between mb-2">
              <div className="flex items-center">
                <Ban className="w-5 h-5 mr-2 text-red-500"/>
                <span className="font-medium">
                  {t("scheduler.inactiveTasks")}
                </span>
              </div>
              <CButton
                variant="primary"
                onClick={() => moveAll(true)}
                className="rounded-[50%] w-8 h-8 mr-4.5"
              >
                <ArrowRight className="w-4 h-4 translate-x-[-8px]"/>
              </CButton>
            </div>
            <div className="flex-1 min-h-0 overflow-auto space-y-2 scroll-embedded pr-1">
              {left.map((task) => (
                <TaskRow
                  key={task.func_name}
                  task={task}
                  side="left"
                  onMove={handleMoveOne}
                  onEdit={handleEdit}
                  onChangeTime={handleChangeTime}
                  t={t}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 右边 */}
        <Card className="flex flex-col min-h-0">
          <CardContent className="flex flex-col flex-1 min-h-0">
            <div className="flex justify-between mb-2">
              <CButton
                variant="primary"
                onClick={() => moveAll(false)}
                className="rounded-[50%] w-8 h-8 ml-2"
              >
                <ArrowLeft className="w-4 h-4 translate-x-[-8px]"/>
              </CButton>
              <div className="flex items-center">
                <span className="font-medium">
                  {t("scheduler.activeTasks")}
                </span>
                <CheckCircle2 className="w-5 h-5 ml-2 text-green-500"/>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-auto space-y-2 scroll-embedded pr-1">
              {right.map((task) => (
                <TaskRow
                  key={task.func_name}
                  task={task}
                  side="right"
                  onMove={handleMoveOne}
                  onEdit={handleEdit}
                  onChangeTime={handleChangeTime}
                  t={t}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 弹窗 */}
      {modalTask && (
        <FeatureSwitchModal
          task={modalTask}
          onClose={() => setModalTask(null)}
          onSave={handleUpdateTask}
          allTasks={
            eventConfigs
              .filter(e => e.func_name != modalTask.func_name)
              .map((e) => e.func_name)
          }
        />
      )}
    </div>
  );
};

export default SchedulerPage;
