import React from 'react';
import {useTranslation} from 'react-i18next';
import type {Asset} from '@/lib/types.ts';

interface AssetsDisplayProps {
  assets: Asset | null;
}

const useTimeAgo = () => {
  const {t} = useTranslation();
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000); // update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (timestamp: number) => {
    const seconds = Math.floor(now / 1000 - timestamp);
    if (seconds < 60) return t('secondsAgo', {count: seconds});
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return t('minutesAgo', {count: minutes});
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('hoursAgo', {count: hours});
    const days = Math.floor(hours / 24);
    return t('daysAgo', {count: days});
  };
}

const AssetsDisplay: React.FC<AssetsDisplayProps> = ({assets}) => {
  const {t} = useTranslation();
  const timeAgo = useTimeAgo();

  if (!assets) {
    return <div className="text-slate-500">{t('assets')}...</div>;
  }

  const assetItems = [
    {
      name: t('property.ap'),
      value: `${assets.ap.count}/${assets.ap.max}`,
      time: assets.ap.time,
      icon: '../assets/icons/property/currency_icon_ap.webp'
    },
    {
      name: t('property.credits'),
      value: assets.creditpoints.count.toLocaleString(),
      time: assets.creditpoints.time,
      icon: '../assets/icons/property/currency_icon_gold.webp'
    },
    {
      name: t('property.pyroxene'),
      value: assets.pyroxene.count.toLocaleString(),
      time: assets.pyroxene.time,
      icon: '../assets/icons/property/currency_icon_gem.webp'
    },
    {
      name: t('property.coin.arena'),
      value: assets.pyroxene.count.toLocaleString(),
      time: assets.pyroxene.time,
      icon: '../assets/icons/property/item_icon_chasecoin.webp'
    },
    {
      name: t('property.coin.commission'),
      value: assets.pyroxene.count.toLocaleString(),
      time: assets.pyroxene.time,
      icon: '../assets/icons/property/item_icon_arenacoin.webp'
    },
    {
      name: t('property.keystone'),
      value: assets.pyroxene.count.toLocaleString(),
      time: assets.pyroxene.time,
      icon: '../assets/icons/property/item_icon_craftitem_1.webp'
    },
    {
      name: t('property.keystone.piece'),
      value: assets.pyroxene.count.toLocaleString(),
      time: assets.pyroxene.time,
      icon: '../assets/icons/property/item_icon_craftitem_0.webp'
    },
    {
      name: t('property.pass'),
      value: assets.pyroxene.count.toLocaleString(),
      time: assets.pyroxene.time,
      icon: '../assets/icons/property/item_icon_pass.webp'
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  gap-1">
      {assetItems.map(item => (
        <div key={item.name}
             className="bg-white dark:bg-slate-800/50 p-2 rounded-lg border border-slate-200 dark:border-slate-700 flex items-start">
          <div className={'flex flex-col items-center justify-center mr-4 min-w-10 ml-1'}>
            <img src={item.icon} className={`w-8 h-6`} alt={item.name} />
            <div className="text-sm text-slate-500 dark:text-slate-400">{item.name}</div>
          </div>
          <div>
            <div className="text-l font-bold text-slate-800 dark:text-slate-100">{item.value}</div>
            <div
              className="text-xs text-slate-400 dark:text-slate-500 mt-1">{timeAgo(item.time)}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssetsDisplay;
