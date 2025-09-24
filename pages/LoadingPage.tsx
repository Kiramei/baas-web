import {useApp} from "@/contexts/AppContext"
import Particles from "@/components/Particles"
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/ui/terminal";
import React, {useEffect, useState} from "react";

interface LoadingPageProps {
  children: React.ReactNode
  message?: string // 可选，loading 时的提示文案
}

import {useRef} from "react";
import {randomUUID} from "crypto";
import {TextGenerateEffect} from "@/components/ui/text-generate-effect.tsx";

export function AutoScrollTerminal({children}: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({behavior: "smooth"}); // 平滑滚动到底
    }
  }, [children]); // 每次 children 改变时触发

  return (
    <div
      ref={containerRef}
      className="w-full h-full opacity-50 scrollbar-hide font-mono overflow-auto p-2"
    >
      {children}
      <div ref={endRef}/>
      {/* 滚动定位锚点 */}
    </div>
  );
}


export const LoadingPage: React.FC<LoadingPageProps> = ({
                                                          children,
                                                          message = "Loading...",
                                                        }) => {


  const [divList, setDivList] = useState([])
  useEffect(() => {
    setInterval(() => {
      const a = crypto.randomUUID();
      divList.push(<TextGenerateEffect words={a} duration={0.3} mode="word"/>)
    }, 500)
  }, [])

  let {staticConfig} = useApp()
  const isDark = document.documentElement.classList.contains("dark");

  // staticConfig = null

  if (!staticConfig) {
    return (
      <>
        <div
          className="fixed w-full h-full flex items-center justify-center  bg-[var(--color-slate-100)] dark:bg-[oklch(12.9%_0.042_264.695)] overflow-hidden">
          {/* 背景粒子效果 */}
          <Particles
            particleColors={[isDark ? "#47a7c4" : "#78d6f8"]}
            particleCount={500}
            particleSpread={8}
            speed={0.8}
            particleBaseSize={150}
            moveParticlesOnHover
            alphaParticles
            disableRotation
          />
        </div>

        <div
          className="fixed w-full h-full"
        >
          <AutoScrollTerminal>
            {...divList}
          </AutoScrollTerminal>
        </div>

        {/* 居中内容 */}
        <div className="z-10 flex flex-col items-center justify-center w-full h-full">
          {/* Logo */}
          <div
            className="fixed"
            style={
              {
                marginTop: "calc(var(--spacing) * -15)"
              }
            }
          >

            <img
              src="../assets/images/logo.png"
              alt="App Logo"
              className="w-36 h-36 mb-6 fixed rounded-full drop-shadow-[0_0_80px_rgba(0,215,255,0.8)] dark:drop-shadow-[0_0_80px_rgba(59,130,246,0.8)]"
            />


            {/* 旋转加载圈 */}
            <div
              className="animate-spin rounded-full h-40 w-40 border-t-4 border-b-4 drop-shadow-[0_0_10px_rgba(255,255,246,0.8)]
              border-primary-500 dark:border-primary-300 mb-6 dark:drop-shadow-[0_0_10px_rgba(255,255,246,0.8)]"
              style={
                {
                  marginTop: "calc(var(--spacing) * -2)",
                  marginLeft: "calc(var(--spacing) * -2)"
                }
              }
            />

          </div>

          {/* 主提示 */}
          <p
            className="text-lg font-bold text-slate-500 dark:text-slate-200 absolute mt-40 py-1 px-4 rounded-lg font-mono
              bg-[#eeeeeeee]dark:bg-[#0000002f] backdrop-blur-[5px] border-[#90a1b977] dark:border-slate-700 border">
            {message}
          </p>

        </div>
      </>
    )
  }

  return <>{children}</>
}
