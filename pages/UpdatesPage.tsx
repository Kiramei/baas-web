
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { GitBranch } from 'lucide-react';

const UpdatesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('updates')}</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GitBranch className="w-5 h-5 mr-2 text-primary-500" />
            Update Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 dark:text-slate-400">
            This section will contain settings for managing application updates, such as selecting an update channel (e.g., GitHub, Gitee) and configuring Mirror酱 CDK.
          </p>
          <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <h4 className="font-semibold mb-2">Coming Soon</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
                <li>Update source selection</li>
                <li>Mirror酱 CDK configuration</li>
                <li>Connectivity testing tool</li>
                <li>Version information display</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdatesPage;
