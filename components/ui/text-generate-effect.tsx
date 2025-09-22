"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
  mode = "word", // "word"（逐个单词）| "all"（整体一起动）
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
  mode?: "word" | "all";
}) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration: duration ?? 0.5,
        delay: mode === "word" ? stagger(0.2) : 0, // 关键区别
      }
    );
  }, [scope.current, words, mode]);

  const renderWords = () => {
    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => (
          <motion.span
            key={word + idx}
            className={cn("opacity-0", className)}
            style={{
              filter: filter ? "blur(10px)" : "none",
            }}
          >
            {word}{" "}
          </motion.span>
        ))}
      </motion.div>
    );
  };

  return <div>{renderWords()}</div>;
};
