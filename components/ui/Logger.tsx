"use client"

import React, {useEffect, useRef} from "react"
import type {LogItem} from "@/store/websocketStore.ts"
import {formatIsoToReadable} from "@/lib/utils.ts"
import {List} from "react-window"
import {type RowComponentProps, useDynamicRowHeight} from "react-window";
import {Button} from "@/components/ui/button.tsx";

interface LoggerProps {
  logs: LogItem[]
  scrollToEnd: boolean // 控制是否滑动到底部
}

const getLevelColor = (level: string) => {
  switch (level) {
    case "INFO":
      return "text-blue-400"
    case "WARNING":
      return "text-yellow-400"
    case "ERROR":
      return "text-red-400"
    default:
      return "text-slate-400"
  }
}

const getMessageStyle = (level: string) => {
  switch (level) {
    case "INFO":
      return "text-inherit font-normal border-l-[3px] border-gray-400";
    case "WARNING":
      return "text-yellow-500 font-bold border-l-[5px] border-yellow-500";
    case "ERROR":
      return "text-red-500 font-bold border-l-[5px] border-red-500";
    case "DEBUG":
      return "text-blue-500 font-bold border-l-[5px] border-blue-500";
    default:
      return "text-inherit font-normal border-l-[3px] border-gray-400";
  }
};

const Row = ({index, logs, style}: RowComponentProps<{
  logs: LogItem[]
}>) => {
  const log: LogItem = logs[index];
  return (
    <div
      style={style}
      className="flex items-start gap-2 cursor-text px-2"
    >
      {/* 时间 */}
      <span className="text-gray-500 whitespace-nowrap min-w-[120px]">
          {formatIsoToReadable(log.time)}
        </span>

      {/* Level */}
      <span
        className={`min-w-[70px] ${getLevelColor(log.level)} font-bold flex justify-end`}
      >
          {log.level}
        </span>

      {/* Message */}
      <div
        className={`flex-1 pl-4 whitespace-pre-wrap break-words ${getMessageStyle(log.level)}`}
      >
        {log.message}
      </div>
    </div>
  )
}
const Logger: React.FC<LoggerProps> = ({logs, scrollToEnd}) => {
  const listRef = useRef(null); // 根据你的 List 类型改

  useEffect(() => {
    if (scrollToEnd && listRef.current && logs.length > 0) {
      listRef.current?.scrollToRow({index: logs.length - 1});
    }
  }, [logs, scrollToEnd]);

  const rowHeight = useDynamicRowHeight({
    defaultRowHeight: 28
  });

  return (
    <div className="w-full h-full bg-slate-900/80 dark:bg-slate/50 rounded-lg font-mono text-sm text-white py-4 pl-4">
      <List
        listRef={listRef}
        rowComponent={Row}
        rowCount={logs.length}
        rowHeight={rowHeight}
        rowProps={{logs}}
      />
    </div>
  );
};

export default Logger;