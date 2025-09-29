import React, {useEffect, useState} from "react";
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/Card";
import {FormSelect} from "@/components/ui/FormSelect";
import {FormInput} from "@/components/ui/FormInput";
import {Separator} from "@/components/ui/separator";
import {
  GitBranch, Key, Loader2, TestTube, UserSearch, Info,
  Cloud, HardDrive, RefreshCcw, CheckCircle2, XCircle, MinusCircle
} from "lucide-react";
import {useTranslation} from "react-i18next";
import CButton from "@/components/ui/CButton.tsx";
import {toast} from "sonner";
import {EllipsisWithTooltip} from "@/components/ui/etooltip.tsx";

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

const mockRepos: RepoConfig[] = [
  {url: "https://github.com/pur1fying/blue_archive_auto_script.git", name: "GitHub (主仓库)", method: "github"},
  {url: "https://gitee.com/pur1fy/blue_archive_auto_script.git", name: "Gitee (国内镜像)", method: "gitee"},
  {url: "https://gitcode.com/m0_74686738/blue_archive_auto_script.git", name: "GitCode (国内镜像)", method: "gitcode"},
  {
    url: "https://e.coding.net/g-jbio0266/baas/blue_archive_auto_script.git",
    name: "腾讯工蜂 (国内镜像)",
    method: "tencent"
  }
];

const mockShaMethods = [
  "GitHub API",
  "Mirror酱免费API",
  "Gitee仓库读取",
  "GitCode仓库读取",
  "腾讯工蜂仓库读取"
];

const UpdatePage: React.FC = () => {
  const {t} = useTranslation();
  const [localVersion, setLocalVersion] = useState("正在获取...");
  const [remoteVersion, setRemoteVersion] = useState("待检测");
  const [updateMethod, setUpdateMethod] = useState("检测中...");

  const [shaLocal, setShaLocal] = useState("14a472");
  const [shaRemote, setShaRemote] = useState("a77417");

  const [verLocal, setVerLocal] = useState("1.1.0");
  const [verRemote, setVerRemote] = useState("1.3.0");

  const [apiLoading, setApiLoading] = useState(false);
  const [mcLoading, setMcLoading] = useState(false);

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
      value: updateMethod,
      icon: <RefreshCcw className="w-8 h-8 text-purple-500"/>
    },
  ]


  const [repo, setRepo] = useState(mockRepos[0].url);
  const [shaMethod, setShaMethod] = useState(mockShaMethods[0]);
  const [cdk, setCdk] = useState("");
  const [cdkStatus, setCdkStatus] = useState<"pending" | "success" | "error" | "testing">("pending");
  const [shaResults, setShaResults] = useState<ShaTestResult[]>(
    mockShaMethods.map(m => ({method: m, status: "pending"}))
  );

  // mock 初始化
  useEffect(() => {
    setTimeout(() => {
      setLocalVersion(`${verLocal}.${shaLocal}`);
      setRemoteVersion(`${verRemote}.${shaRemote}`);
      setUpdateMethod("GitHub 拉取更新");
    }, 800);
  }, []);

  const handleTestSha = () => {
    setApiLoading(true);
    setShaResults(shaResults.map(r => ({...r, status: "testing"})));
    setTimeout(() => {
      setShaResults(
        shaResults.map((r, i) => ({
          ...r,
          status: i % 2 === 0 ? "success" : "error",
          time: +(Math.random() * 2).toFixed(3),
          sha: i % 2 === 0 ? "abc123def4567890abc123def4567890" : undefined
        }))
      );
      setApiLoading(false);
    }, 1500);
  };

  const handleTestCdk = () => {
    setMcLoading(true);
    setTimeout(() => {
      if (cdk === "VALID-CDK") {
        setCdkStatus("success");
        setRemoteVersion("1.3.0 (Mirror酱)");
        setUpdateMethod("Mirror酱 更新");
        toast.success(t("mc.verify.success"))
      } else {
        toast.error(t("mc.verify.error"))
      }
      setMcLoading(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 px-1">
      {/* 版本信息 */}
      <Card
        className="relative overflow-hidden rounded-2xl border border-slate-200/50 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 shadow-lg">
        {/* 渐变边框光晕 */}
        <div
          className="absolute inset-0 rounded-2xl border border-transparent [mask-composite:exclude] bg-gradient-to-r from-cyan-400/40 via-indigo-400/40 to-purple-400/40 blur-2xl opacity-40"/>

        <CardHeader className="flex flex-row items-center gap-2">
          <Info className="w-5 h-5 text-cyan-400"/>
          <CardTitle
            className="text-lg font-semibold tracking-wide bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            {t("versionInfo") ?? "版本信息"}
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {infos.map((info, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-800/40">
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
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t("updateChannel") ?? "选择合适的更新渠道，填写 Mirror 酱 CDK"}
          </p>
          <FormSelect
            value={repo}
            onChange={setRepo}
            options={mockRepos.map(r => ({value: r.url, label: r.name}))}
          />
        </CardContent>
      </Card>


      {/* Mirror 酱 CDK */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-4 h-4"/>
            {t("mirrorCdk") ?? "Mirror 酱 CDK"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 items-center">
          <FormInput
            placeholder={t("enterCdk") ?? "在此处粘贴 Mirror 酱 CDK"}
            value={cdk}
            onChange={e => setCdk(e.target.value)}
            className="flex-1"
          />

          <CButton
            onClick={handleTestCdk}
            disabled={mcLoading}
            className="pl-3"
          >
            {mcLoading ? (
              <div className="flex justify-center items-center">
                <Loader2 className="animate-spin mr-2 h-4 w-4"/>
                {t("verifying")}
              </div>
            ) : (
              <div className="flex justify-center items-center">
                <UserSearch className="mr-1 h-4 w-4"/>
                {t("verify")}
              </div>
            )}
          </CButton>
        </CardContent>
      </Card>

      {/* SHA 测试 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-4 h-4"/>
            {t("shaConnectivityTest") ?? "连通性测试"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">


            <FormSelect
              value={shaMethod}
              onChange={setShaMethod}
              options={mockShaMethods.map(m => ({value: m, label: m}))}
              className="flex-grow"
            />


            <CButton
              onClick={handleTestSha}
              disabled={apiLoading}
              className="pl-3"
            >
              {apiLoading ? (
                <div className="flex justify-center items-center">
                  <Loader2 className="animate-spin mr-2 h-4 w-4"/>
                  {t("testing")}
                </div>
              ) : (
                <div className="flex justify-center items-center">
                  <TestTube className="mr-1 h-4 w-4"/>
                  {t("testAll")}
                </div>
              )}
            </CButton>
          </div>

          <Separator/>

          <div className="overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-md">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-slate-800 dark:to-slate-900">
              <tr>
                <th
                  className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                  {t("method") ?? "方法"}
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                  {t("status") ?? "状态"}
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                  {t("time") ?? "耗时"}
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                  {t("sha") ?? "SHA值"}
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

export default UpdatePage;
