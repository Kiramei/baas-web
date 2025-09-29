import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"
import React from "react";
import {useGlobalLogStore} from "@/store/globalLogStore.ts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isPlainObject = (v: any) =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export const deepMerge = <T extends Record<string, any>>(target: T, patch: any): T => {
  if (!isPlainObject(target) || !isPlainObject(patch)) {
    if (Array.isArray(patch)) return patch.slice() as any;
    return patch;
  }

  const out: Record<string, any> = {...target};
  for (const key of Object.keys(patch)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") continue;

    const prev = target[key];
    const next = patch[key];

    if (isPlainObject(prev) && isPlainObject(next)) {
      out[key] = deepMerge(prev, next);
    } else if (Array.isArray(next)) {
      out[key] = next.slice();          // 数组整体替换
    } else {
      out[key] = next;                  // 基本类型或对象直接覆盖
    }
  }
  return out as T;
}

export const pause = (ms: number, label?: string) => {
  return new Promise<void>((resolve) => {
    console.log(`[pause] start${label ? " - " + label : ""}, waiting ${ms}ms`);
    if (ms != Infinity) {
      setTimeout(() => {
        console.log(`[pause] end${label ? " - " + label : ""}`);
        resolve();
      }, ms);
    }
  });
}


export const formatIsoToReadable = (iso: string): string => {
  const date = new Date(iso);

  const pad = (n: number, len = 2) => String(n).padStart(len, "0");

  return (
    `${date.getFullYear()}-` +
    `${pad(date.getMonth() + 1)}-` +
    `${pad(date.getDate())} ` +
    `${pad(date.getHours())}:` +
    `${pad(date.getMinutes())}:` +
    `${pad(date.getSeconds())}.` +
    `${pad(date.getMilliseconds(), 3)}`
  );
}

export const assert = (condition: any, msg?: string) => {
  if (!condition) {
    throw new Error(msg ?? "Assertion failed");
  }
}
