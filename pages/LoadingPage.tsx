import React, {useEffect, useRef} from "react";
import Particles from "@/components/Particles";
import {TextGenerateEffect} from "@/components/ui/text-generate-effect.tsx";
import {useGlobalLogStore} from "@/store/globalLogStore.ts";
import {formatIsoToReadable} from "@/lib/utils.ts";
import {motion} from "framer-motion";
import {useTheme} from "@/hooks/useTheme.tsx";

interface LoadingPageProps {
  /**
   * Optional text rendered underneath the loading animation.
   */
  message?: string;
}

const statusColorMap: Record<string, string> = {
  INFO: "var(--color-primary-500)",
  WARNING: "var(--color-yello-500)",
  ERROR: "var(--color-red-500)",
  CRITICAL: "var(--color-purple-500)"
};

/**
 * Scrolls a terminal-like log viewport to the latest entry whenever new content arrives.
 */
export function AutoScrollTerminal({children}: { children: React.ReactNode }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({behavior: "smooth"});
  }, [children]);

  return (
    <div className="w-full h-full opacity-50 scrollbar-hide font-mono overflow-auto p-2">
      {children}
      <div ref={endRef}/>
    </div>
  );
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  message = "Loading..."
}) => {
  const globalLogData = useGlobalLogStore((state) => state.globalLogData);
  const {theme} = useTheme();

  const particlePalette = theme === "dark" ? ["#c2eaf9", "#ffffff"] : ["#6bc6d7"];

  return (
    <>
      <div className="fixed w-full h-full flex items-center justify-center bg-[var(--color-slate-100)] dark:bg-[oklch(12.9%_0.042_264.695)] overflow-hidden">
        {/* Ambient particle field that reinforces the product identity during loading. */}
        <Particles
          particleColors={particlePalette}
          particleCount={100}
          particleSpread={5}
          speed={0.8}
          particleBaseSize={300}
          alphaParticles
          disableRotation
        />
      </div>

      <div className="fixed w-full h-full">
        <AutoScrollTerminal>
          {globalLogData.map((log, idx) => (
            <div className="flex mb-1" key={`${log.time}-${idx}`}>
              <div className="min-w-[230px] text-slate-600 dark:text-slate-400">
                <TextGenerateEffect
                  words={formatIsoToReadable(log.time)}
                  mode="all"
                />
              </div>
              <div
                className="min-w-[70px] flex justify-end mr-2 font-bold"
                style={{color: statusColorMap[log.level]}}
              >
                <TextGenerateEffect words={log.level} mode="all"/>
              </div>
              <motion.div
                className="flex-1 border-l-3 pl-4"
                style={{
                  borderColor: statusColorMap[log.level],
                  whiteSpace: "pre-wrap",
                  borderLeftWidth: log.level === "INFO" ? "3px" : "5px",
                  color: log.level === "INFO" ? "inherit" : statusColorMap[log.level],
                  fontWeight: log.level === "INFO" ? "inherit" : "bold"
                }}
                initial={{opacity: 0, filter: "blur(10px)"}}
                animate={{opacity: 1, filter: "blur(0px)"}}
                transition={{duration: 0.5}}
              >
                {log.message}
              </motion.div>
            </div>
          ))}
        </AutoScrollTerminal>
      </div>

      <div className="z-10 flex flex-col items-center justify-center w-full h-full">
        <div
          className="fixed"
          style={{
            marginTop: "calc(var(--spacing) * -15)"
          }}
        >
          <img
            src="../assets/images/logo.png"
            alt="App Logo"
            className="w-36 h-36 mb-6 fixed rounded-full drop-shadow-[0_0_80px_rgba(0,215,255,0.8)] dark:drop-shadow-[0_0_80px_rgba(59,130,246,0.8)]"
          />

          {/* Rotating halo to communicate that the app is actively bootstrapping services. */}
          <div
            className="animate-spin rounded-full h-40 w-40 border-t-4 border-b-4 drop-shadow-[0_0_10px_rgba(255,255,246,0.8)]
              border-primary-500 dark:border-primary-300 mb-6 dark:drop-shadow-[0_0_10px_rgba(255,255,246,0.8)]"
            style={{
              marginTop: "calc(var(--spacing) * -2)",
              marginLeft: "calc(var(--spacing) * -2)"
            }}
          />
        </div>

        <p
          className="text-lg font-bold text-slate-500 dark:text-slate-200 absolute mt-40 py-1 px-4 rounded-lg font-mono
              bg-[#eeeeeeee] dark:bg-[#0000002f] backdrop-blur-[5px] border-[#90a1b977] dark:border-slate-700 border"
        >
          {message}
        </p>
      </div>
    </>
  );
};
