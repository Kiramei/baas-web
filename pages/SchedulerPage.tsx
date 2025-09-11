import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useApp} from '../contexts/AppContext';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/Card';
import {CheckCircle2, Hourglass} from 'lucide-react';
import {ProfileProps} from "@/lib/types.ts";


const SchedulerPage: React.FC<ProfileProps> = ({profileId}) => {
  const {t} = useTranslation();
  const {schedulerStatus} = useApp();
  const {profiles, activeProfile, updateProfile} = useApp();

  const pid = profileId ?? activeProfile?.id;
  const profile = useMemo(() => profiles.find(p => p.id === pid) ?? activeProfile ?? null, [profiles, pid, activeProfile]);

  return (
    <div className="space-y-6">

      <div className={'flex'}>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('scheduler')}</h2>
        <h2 className="text-2xl ml-3 text-slate-500 dark:text-slate-400">#{profile?.name}</h2>
      </div>
      {/*<h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('scheduler')}</h2>*/}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Hourglass className="w-5 h-5 mr-2 text-primary-500"/>
              {t('runningTask')}
            </CardTitle>
          </CardHeader>
          <CardContent className='flex justify-center items-center h-50'>
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
              <ul className="space-y-2 h-35 max-h-35 overflow-auto">
                {schedulerStatus.taskQueue.map((task, index) => (
                  <li key={index} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                    <span className="text-slate-700 dark:text-slate-300">{task}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="h-35 max-h-35 text-slate-500 dark:text-slate-400">{t('noTasksQueued')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchedulerPage;
