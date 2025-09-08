import React, { useEffect, useMemo, useState } from "react";
import { Keyboard as KeyboardIcon, Circle as RecIcon, X as XIcon } from "lucide-react";

export interface HotkeyFieldProps {
  label?: string;
  value: string;                       // 当前值（如：Ctrl+Shift+K）
  onChange: (next: string) => void;    // 录制完成回调
  placeholder?: string;
  error?: string;
  className?: string;
}

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || "");

function normalizeCombo(e: KeyboardEvent): string | null {
  // 只修饰键不算；需要有“主键”（字符/功能键）
  const { key, ctrlKey, shiftKey, altKey, metaKey } = e;

  // 统一主键名
  let main = key;

  // 忽略纯修饰键
  if (["Shift", "Control", "Alt", "Meta"].includes(main)) return null;

  // 规范：字母转大写，空格/特殊键等保持可读
  if (main.length === 1) main = main.toUpperCase();
  if (main === " ") main = "Space";
  // 功能键/方向键等保持原样（浏览器给出 F1..F12, ArrowUp 等）

  const parts: string[] = [];
  if (isMac) {
    if (metaKey) parts.push("Cmd");
    if (altKey)  parts.push("Option");
    if (ctrlKey) parts.push("Ctrl");   // Mac 上也可能需要 Ctrl
  } else {
    if (ctrlKey) parts.push("Ctrl");
    if (altKey)  parts.push("Alt");
    if (metaKey) parts.push("Meta");   // Win 键
  }
  if (shiftKey) parts.push("Shift");

  parts.push(main);
  return parts.join("+");
}

export default function HotkeyField({
                                      label,
                                      value,
                                      onChange,
                                      placeholder = "Ctrl+Shift+K",
                                      error,
                                      className = "",
                                    }: HotkeyFieldProps) {
  const [recording, setRecording] = useState(false);
  const [hint, setHint] = useState("");

  useEffect(() => {
    if (!recording) return;

    const onKeyDown = (e: KeyboardEvent) => {
      // 防止页面触发原有快捷键
      e.preventDefault();

      // Esc 取消
      if (e.key === "Escape") {
        setRecording(false);
        setHint("");
        return;
      }

      const combo = normalizeCombo(e);
      if (!combo) {
        setHint(isMac ? "继续按主键…" : "Press a non-modifier key…");
        return;
      }

      onChange(combo);
      setRecording(false);
      setHint("");
    };

    // 录制时给出提示
    setHint(isMac ? "按下组合键，Esc 取消" : "Press keys, Esc to cancel");

    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [recording, onChange]);

  const borderClass = error
    ? "border-red-400 focus-within:border-red-400"
    : recording
      ? "border-primary-500 ring-2 ring-primary-500/20"
      : "border-transparent focus-within:border-primary-500";

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </label>
      )}

      <div className={`relative flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                       border transition ${borderClass}`}>
        {/* 只读显示区 */}
        <input
          type={"text"}
          readOnly
          value={recording ? hint : value}
          placeholder={placeholder}
          className={`flex-1 bg-transparent rounded-lg px-3 py-2 outline-none dark:bg-slate-900
                     ${recording ? "italic text-slate-500 dark:text-slate-400" : ""}`}
        />

        {/* 清空按钮（有值时出现） */}
        {value && !recording && (
          <button
            type="button"
            className="absolute right-9 p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            onClick={() => onChange("")}
            title="Clear"
            aria-label="Clear"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}

        {/* 键盘按钮：开启/结束录制 */}
        <button
          type="button"
          onClick={() => setRecording(r => !r)}
          className={`absolute right-1.5 my-0.5 px-2 py-1 rounded-md transition
                     ${recording
            ? "bg-primary-600 text-white hover:bg-primary-700"
            : "text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"}`}
          title={recording ? "Stop recording" : "Record hotkey"}
          aria-pressed={recording}
        >
          {recording ? (
            <span className="flex items-center gap-1">
              <RecIcon className="w-3.5 h-3.5" />
              <span className="text-xs">REC</span>
            </span>
          ) : (
            <KeyboardIcon className="w-4 h-4" />
          )}
        </button>
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
