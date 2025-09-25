import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import CButton from "@/components/ui/CButton.tsx";
import {Card} from "@/components/ui/Card";
import {Modal} from "@/components/ui/Modal";
import {SearchCode} from "lucide-react"; // 用你给的 Modal
import {Loader2} from "lucide-react";  // 如果想加 loading 图标可以用

type ADBSeekProps = {
  onDetect?: () => Promise<string[]>;   // 调用 adb 检测，返回地址列表
  onSelect?: (addr: string) => void;   // 点击某个地址后的回调
};

// mock 数据
const mockDetect = async (): Promise<string[]> => {
  await new Promise((r) => setTimeout(r, 1000));
  return [
    "127.0.0.1:5555",
    "192.168.1.101:5555",
    "10.0.2.15:5555",
  ];
};

const ADBSeekModal: React.FC<ADBSeekProps> = ({onDetect = mockDetect, onSelect}) => {
  const {t} = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleDetect = async () => {
    setLoading(true);
    setError(null);
    try {
      const addrs = await onDetect();
      if (!addrs || addrs.length === 0) {
        setError(t("adb.noResults"));
        setResults([]);
      } else {
        setResults(addrs);
      }
    } catch (e: any) {
      setError(t("adb.detectFailed") + (e.message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 外部按钮 */}
      <CButton variant="primary" onClick={() => setOpen(true)} style={
        {
          borderRadius: "50%",
          padding: "8px",
          width: "36px",
          height: "36px"
        }
      }>
        <SearchCode size="small"/>
      </CButton>

      {/* Modal */}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={t("adb.title")}
        width={40}
      >
        <div className="space-y-2">
          <CButton
            onClick={handleDetect}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <Loader2 className="animate-spin mr-2 h-4 w-4"/>
                {t("adb.detecting")}
              </div>
            ) : (
              <div className="flex justify-center items-center">
                <SearchCode className="mr-2 h-4 w-4"/>
                {t("adb.detectBtn")}
              </div>
            )}
          </CButton>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {results.map((addr) => (
              <Card
                key={addr}
                className="p-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => {
                  onSelect?.(addr);
                  setOpen(false); // 点击后关闭 modal
                }}
              >
                {addr}
              </Card>
            ))}
            {results.length === 0 && !loading && !error && (
              <p className="text-sm text-slate-500">
                {t("adb.noData") || "暂无结果"}
              </p>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ADBSeekModal;
