import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '../components/ui/Card';
import {useTheme} from '../hooks/useTheme';
import type {Theme} from '../lib/types.ts';
import {useApp} from "@/contexts/AppContext.tsx";
import {FormSelect} from "@/components/ui/FormSelect.tsx";
import {FormInput} from "@/components/ui/FormInput.tsx";
import CButton from "@/components/ui/CButton.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {EllipsisWithTooltip} from "@/components/ui/etooltip.tsx";
import {toast} from "sonner";
import {
  CheckCircle2, Cloud,
  HardDrive,
  Info,
  Loader2,
  MinusCircle, RefreshCcw,
  TestTube,
  UserSearch,
  XCircle
} from "lucide-react";
import {useWebSocketStore} from "@/store/websocketStore.ts";
import {formatIsoToReadable, getTimestampMs} from "@/lib/utils.ts";

type RepoConfig = {
  url: string;
  name: string;
  method: string;
};

type ShaTestResult = {
  method: string;
  status: "pending" | "success" | "error" | "testing";
  time?: number;
  sha?: string;
};

const reposInit: RepoConfig[] = [
  {url: "https://github.com/pur1fying/blue_archive_auto_script.git", name: "GitHub (主仓库)", method: "github"},
  {url: "https://gitee.com/pur1fy/blue_archive_auto_script.git", name: "Gitee (国内镜像)", method: "gitee"},
  {url: "https://gitcode.com/m0_74686738/blue_archive_auto_script.git", name: "GitCode (国内镜像)", method: "gitcode"},
  {
    url: "https://e.coding.net/g-jbio0266/baas/blue_archive_auto_script.git",
    name: "腾讯工蜂 (国内镜像)",
    method: "tencent"
  }
];

const shaMethodsInit = [
  "GitHub API",
  "Mirror酱免费API",
  "Gitee仓库读取",
  "GitCode仓库读取",
  "腾讯工蜂仓库读取"
];

const SettingsPage: React.FC = () => {
  const {t, i18n} = useTranslation();
  const {theme, setTheme} = useTheme();
  const {uiSettings} = useApp();
  const trigger = useWebSocketStore(state => state.trigger);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  const [localZoom, setLocalZoom] = useState(uiSettings?.zoomScale ?? 100);

// 当全局 uiSettings 改变时，同步回本地
  useEffect(() => {
    if (uiSettings?.zoomScale !== undefined) {
      setLocalZoom(uiSettings.zoomScale);
    }
  }, [uiSettings?.zoomScale]);

  const handleZoomChange = (value: string) => {
    const newZoom = Number(value);
    setLocalZoom(newZoom);
    uiSettings.zoomScale = parseInt(value);
  };

  const [localVersion, setLocalVersion] = useState(t("version.fetching"));
  const [remoteVersion, setRemoteVersion] = useState(t("version.fetching"));
  const [updateStatus, setUpdateStatus] = useState(t("version.testing"));

  const [shaLocal, setShaLocal] = useState("");
  const [shaRemote, setShaRemote] = useState("");

  const [verLocal, setVerLocal] = useState("");
  const [verRemote, setVerRemote] = useState("");

  const [apiLoading, setApiLoading] = useState(false);
  const [mcLoading, setMcLoading] = useState(false);
  const [versionChecking, setVersionChecking] = useState(true);

  const infos = [
    {
      label: t("localVersion") ?? "当前版本",
      value: localVersion,
      icon: <HardDrive className="w-8 h-8 text-cyan-500"/>
    },
    {
      label: t("remoteVersion") ?? "远程版本",
      value: remoteVersion,
      icon: <Cloud className="w-8 h-8 text-indigo-500"/>
    },
    {
      label: t("updateMethod") ?? "更新方式",
      value: t(updateStatus),
      icon: <RefreshCcw className={`w-8 h-8 text-purple-500 ${versionChecking ? "animate-spin" : ""}`}/>
    },
  ]

  const [repo, setRepo] = useState(reposInit[0].url);
  const [shaMethod, setShaMethod] = useState(shaMethodsInit[0]);
  const [cdk, setCdk] = useState("");
  const [shaResults, setShaResults] = useState<ShaTestResult[]>(
    shaMethodsInit.map(m => ({method: m, status: "pending"}))
  );

  const fetchVersion = () => {
    setVersionChecking(true)
    setShaRemote("");
    setShaLocal("");
    setVerRemote("");
    setVerLocal("");

    setLocalVersion(t("version.fetching"))
    setRemoteVersion(t("version.fetching"));
    setUpdateStatus(t("version.testing"));

    trigger({
      timestamp: getTimestampMs(),
      command: "check_for_update",
      payload: {}
    }, (e) => {
      console.log(e);
      setShaLocal(e.data.local)
      setShaRemote(e.data.remote)
      setUpdateStatus("version.tapToTest")
      setVersionChecking(false)
    });
  }

  // mock 初始化
  useEffect(() => {
    fetchVersion()
    // setTimeout(() => {
    //   setLocalVersion(`${verLocal}.${shaLocal}`);
    //   setRemoteVersion(`${verRemote}.${shaRemote}`);
    //   setUpdateStatus("GitHub 拉取更新");
    // }, 800);
  }, []);

  useEffect(() => {
    if (verLocal + shaLocal + verRemote + shaRemote !== "") {
      if (verLocal === null || shaLocal === null)
        setLocalVersion(t("version.checkError"));
      else
        setLocalVersion(`${verLocal}.${shaLocal.slice(0, 6)}`);

      if (verRemote === null || shaRemote === null)
        setRemoteVersion(t("version.checkError"));
      else
        setRemoteVersion(`${verRemote}.${shaRemote.slice(0, 6)}`);
    }
  }, [verLocal, shaLocal, verRemote, shaRemote]);

  const handleTestSha = () => {
    setApiLoading(true);
    setShaResults(shaResults.map(r => ({...r, status: "testing"})));

    trigger({
      timestamp: getTimestampMs(),
      command: "test_all_sha",
      payload: {}
    }, (e) => {
      console.log(e);
      setShaResults(
        e.data.map(el => ({
          status: el.success ? "success" : "error",
          method: t(`shaMethod.${el.name}`),
          time: +(el.duration).toFixed(3),
          sha: el.value
        }))
      )
      setApiLoading(false);
    });
  };

  const handleTestCdk = () => {
    if (!cdk) {
      toast.error(t("cdk.noCDKInput"))
      return
    }

    setMcLoading(true);

    trigger({
      timestamp: getTimestampMs(),
      command: "valid_cdk",
      payload: {
        "cdk": cdk
      }
    }, (e) => {
      console.log(e);
      if (e.data.success) {
        const expires_at_iso = e.data.expires_at_iso;
        console.log(expires_at_iso)
        const message = expires_at_iso ?
          t(e.data.message, {expire_date: formatIsoToReadable(expires_at_iso)}) as string
          : t(e.data.message);
        console.log(message)
        toast.success(t("CDK Test OK"), {description: message});
      } else {
        toast.error(t(e.data.message), {
          description: t(e.data.mirrorc_message)
        })
      }
      setMcLoading(false);
    });
  };


  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('settings')}</h2>
      <Card>
        <CardHeader>
          <CardTitle>{t('uiSettings')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Settings */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">{t('theme')}</label>
            <div className="flex space-x-2 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
              {(['light', 'dark', 'system'] as Theme[]).map((value) => (
                <button
                  key={value}
                  onClick={() => handleThemeChange(value)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    theme === value ? 'bg-white dark:bg-slate-600 shadow' : 'hover:bg-white/50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {t(value)}
                </button>
              ))}
            </div>
          </div>

          {/* Language Settings */}
          <FormSelect
            value={i18n.language}
            label={t('language')}
            onChange={handleLanguageChange}
            options={[
              {value: "en", label: t('english')},
              {value: "zh", label: t('chinese')}
            ]}
          />

          {/* Zoom Settings */}
          <FormSelect
            value={uiSettings?.zoomScale.toString()}
            label={t('ui.zoom')}
            onChange={handleZoomChange}
            options={[
              50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150
            ].map((v) => ({value: v.toString(), label: `${v}%`}))}
          />

        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('title.updateSetting')}</h2>
      <Card
        className="relative overflow-hidden rounded-2xl border border-slate-200/50 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 shadow-lg">
        {/* 渐变边框光晕 */}
        <div
          className="absolute inset-0 rounded-2xl border border-transparent [mask-composite:exclude] bg-gradient-to-r from-cyan-400/40 via-indigo-400/40 to-purple-400/40 blur-2xl opacity-40 pointer-events-none"
        />

        <CardHeader className="flex flex-row items-center gap-2">
          <Info className="w-5 h-5 text-cyan-400"/>
          <CardTitle
            className="text-lg font-semibold tracking-wide bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            {t("versionInfo")}
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {infos.map((info, i) => (
            <div key={i}
                 className={`flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-800/40 transition ${info.label === t("updateMethod") ? " cursor-link hover:bg-white/70 dark:hover:bg-slate-700/50" : ""}`}
                 onClick={info.label === t("updateMethod") ? fetchVersion : undefined}
            >
              {info.icon}
              <div className="flex flex-col">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {info.label}
                </p>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {info.value}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 全局更新设置 */}
      <Card>
        <CardHeader>
          <CardTitle>{t("globalUpdateSettings") ?? "全局更新设置"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 items-center">
            <FormInput
              label={t("mirrorCdk")}
              placeholder={t("enterCdk")}
              value={cdk}
              onChange={e => setCdk(e.target.value)}
              className="flex-1"
            />

            <CButton
              onClick={handleTestCdk}
              disabled={mcLoading}
              className="pl-3 self-end"
            >
              {mcLoading ? (
                <div className="flex justify-center items-center">
                  <Loader2 className="animate-spin mr-2 h-4 w-4"/>
                  {t("mirror.verifying")}
                </div>
              ) : (
                <div className="flex justify-center items-center">
                  <UserSearch className="mr-1 h-4 w-4"/>
                  {t("mirror.verify")}
                </div>
              )}
            </CButton>
          </div>

          <Separator/>

          <FormSelect
            label={t("updateChannel")}
            value={repo}
            onChange={setRepo}
            options={reposInit.map(r => ({value: r.url, label: r.name}))}
          />


          <div className="flex gap-2">

            <FormSelect
              label={t("shaConnectivityTest")}
              value={shaMethod}
              onChange={setShaMethod}
              options={shaMethodsInit.map(m => ({value: m, label: m}))}
              className="flex-grow"
            />


            <CButton
              onClick={handleTestSha}
              disabled={apiLoading}
              className="pl-3 self-end"
            >
              {apiLoading ? (
                <div className="flex justify-center items-center">
                  <Loader2 className="animate-spin mr-2 h-4 w-4"/>
                  {t("shaTest.testing")}
                </div>
              ) : (
                <div className="flex justify-center items-center">
                  <TestTube className="mr-1 h-4 w-4"/>
                  {t("shaTest.testAll")}
                </div>
              )}
            </CButton>
          </div>


          <div className="overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-md">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-slate-800 dark:to-slate-900">
              <tr>
                <th
                  className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                  {t("shaTest.method")}
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                  {t("shaTest.status")}
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                  {t("shaTest.time")}
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                  {t("shaTest.sha")}
                </th>
              </tr>
              </thead>

              <tbody>
              {shaResults.map((r, idx) => (
                <tr
                  key={idx}
                  className="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-900 dark:even:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  {/* 方法列自适应 */}
                  <td className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <EllipsisWithTooltip text={r.method}/>
                  </td>

                  {/* 状态列：固定宽度 */}
                  <td className="px-4 py-3 text-center border-b border-slate-200 dark:border-slate-700 w-20">
                    {r.status === "success" && (
                      <CheckCircle2 className="w-5 h-5 mx-auto text-green-500"/>
                    )}
                    {r.status === "error" && (
                      <XCircle className="w-5 h-5 mx-auto text-red-500"/>
                    )}
                    {r.status === "testing" && (
                      <Loader2 className="text-yellow-500 mx-auto animate-spin h-5 w-5"/>
                    )}
                    {!["success", "error", "testing"].includes(r.status) && (
                      <MinusCircle className="w-5 h-5 mx-auto text-slate-400"/>
                    )}
                  </td>

                  {/* 耗时列：固定宽度 */}
                  <td className="px-4 py-3 text-center border-b border-slate-200 dark:border-slate-700 w-24">
                    {r.time ?? "-"}
                  </td>

                  {/* SHA列：固定宽度，单行截断或换行 */}
                  <td className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-mono w-20">
                    {r.sha ?
                      <EllipsisWithTooltip text={r.sha.substring(0, 6)} tooltip={r.sha}></EllipsisWithTooltip> : "-"}
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default SettingsPage;
