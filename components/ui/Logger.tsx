// import React, { useEffect, useRef } from 'react';
// import type { LogEntry } from '@/lib/types.ts';

// interface LoggerProps {
//   logs: LogEntry[];
//   scrollToEnd: boolean; // 控制是否滑动到底部
// }

// const Logger: React.FC<LoggerProps> = ({ logs, scrollToEnd }) => {
//   const logContainerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const el = logContainerRef.current;
//     if (el) {
//       if (scrollToEnd) {
//         el.scrollTop = el.scrollHeight;
//       }
//     }
//   }, [logs, scrollToEnd]);

//   const getLevelColor = (level: LogEntry['level']) => {
//     switch (level) {
//       case 'INFO': return 'text-blue-400';
//       case 'WARN': return 'text-yellow-400';
//       case 'ERROR': return 'text-red-400';
//       default: return 'text-slate-400';
//     }
//   };

//   return (
//     <div
//       ref={logContainerRef}
//       className="w-full h-full overflow-y-auto bg-slate-900/80 dark:bg-slate/50
//       rounded-lg p-4 font-mono text-sm text-white scroll-embedded cursor-text"
//     >
//       {logs.map(log => (
//         <div key={log.id} className="flex items-start">
//           <span className="text-gray-500 mr-4 whitespace-nowrap">
//             {new Date(log.timestamp).toLocaleString()}
//           </span>
//           <span className={`${getLevelColor(log.level)} font-bold mr-4`}>{log.level}</span>
//           <p className="flex-1 whitespace-pre-wrap break-words">{log.message}</p>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Logger;


"use client"

import React, { useEffect, useRef } from "react"
import type { LogEntry } from "@/lib/types.ts"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"

interface LoggerProps {
  logs: LogEntry[]
  scrollToEnd: boolean // 控制是否滑动到底部
}

const Logger: React.FC<LoggerProps> = ({ logs, scrollToEnd }) => {
  const logContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = logContainerRef.current
    if (el && scrollToEnd) {
      el.scrollTop = el.scrollHeight
    }
  }, [logs, scrollToEnd])

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "INFO":
        return "text-blue-400"
      case "WARN":
        return "text-yellow-400"
      case "ERROR":
        return "text-red-400"
      default:
        return "text-slate-400"
    }
  }

  return (
    <div
      ref={logContainerRef}
      className="w-full h-full overflow-y-auto bg-slate-900/80 dark:bg-slate/50 rounded-lg p-4 font-mono text-sm text-white scroll-embedded cursor-text"
    >
      {logs.map((log) => (
        <div key={log.id} className="flex items-start gap-2">
          {/* 时间 */}
          <span className="text-gray-500 whitespace-nowrap">
            <TextGenerateEffect
              words={new Date(log.timestamp).toLocaleString()}
              duration={0.3}
              mode="all"
              className="text-gray-500 whitespace-nowrap "
            />
          </span>

          {/* Level */}
          <span className={`${getLevelColor(log.level)} font-bold`}>
            <TextGenerateEffect words={log.level} duration={0.3} mode="all"/>
          </span>

          {/* Message */}
          <div className="flex-1 whitespace-pre-wrap break-words">
            <TextGenerateEffect words={log.message} duration={0.3} mode="all"/>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Logger
