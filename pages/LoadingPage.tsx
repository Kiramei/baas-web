import { useApp } from "@/contexts/AppContext"

interface LoadingPageProps {
  children: React.ReactNode
  message?: string // 可选，loading 时的提示文案
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  children,
  message = "Loading..."
}) => {
  const { staticConfig } = useApp()

  if (!staticConfig) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-lg text-slate-700 dark:text-slate-300">{message}</p>
        {/* 这里我留一个 debug 示例，可以删掉 */}
        <p className="text-xs text-slate-500 mt-2">等待数据加载中…</p>
      </div>
    )
  }

  return <>{children}</>
}
