type ZoomOptions = {
  min?: number;        // 最小缩放
  max?: number;        // 最大缩放
  step?: number;       // 每个滚轮“档位”的倍率（>1）
  modifier?: "ctrl" | "alt" | "none"; // 触发键
  initialScale?: number;
};

export function attachCtrlWheelZoom(el: HTMLElement, options: ZoomOptions = {}) {
  const {
    min = 0.25,
    max = 5,
    step = 1.1,
    modifier = "ctrl",       // 如果浏览器拦不住系统缩放，改成 "alt" 或 "none"
    initialScale = 1,
  } = options;

  let scale = initialScale;
  let tx = 0; // 平移X
  let ty = 0; // 平移Y

  const apply = () => {
    el.style.transformOrigin = "0 0";
    el.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  };

  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  const matchesModifier = (e: WheelEvent) =>
    (modifier === "ctrl" && e.ctrlKey) ||
    (modifier === "alt" && e.altKey) ||
    (modifier === "none");

  const onWheel = (e: WheelEvent) => {
    if (!matchesModifier(e)) return;

    // 尝试阻止页面滚动 / 系统缩放（有些桌面浏览器不允许完全拦截系统缩放）
    e.preventDefault();

    // 当前位置（相对元素）
    const rect = el.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    // 计算缩放倍率（滚轮向下 deltaY>0 -> 缩小）
    const prevScale = scale;
    const factor = e.deltaY > 0 ? 1 / step : step;
    scale = clamp(prevScale * factor);

    // 缩放围绕鼠标：保持 (wx, wy) 映射到相同屏幕坐标 (cx, cy)
    const wx = (cx - tx) / prevScale;
    const wy = (cy - ty) / prevScale;

    tx = cx - wx * scale;
    ty = cy - wy * scale;

    apply();
  };

  // Safari 触控板“捏合”事件（非标准），可选
  const onGestureStart = (e: any) => {
    if (modifier !== "none") return;
    e.preventDefault();
  };
  const onGestureChange = (e: any) => {
    if (modifier !== "none") return;
    e.preventDefault();
    const rect = el.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const prevScale = scale;
    scale = clamp(prevScale * e.scale);

    const wx = (cx - tx) / prevScale;
    const wy = (cy - ty) / prevScale;
    tx = cx - wx * scale;
    ty = cy - wy * scale;
    apply();
  };

  // 注意 passive: false，才能 preventDefault
  window.addEventListener("wheel", onWheel, { passive: false });
  // Safari 手势（可选）
  window.addEventListener("gesturestart", onGestureStart as any, { passive: false });
  window.addEventListener("gesturechange", onGestureChange as any, { passive: false });

  // 初次应用
  apply();

  // 提供手动控制API和卸载
  return {
    setScale(next: number, anchor?: { x: number; y: number }) {
      const rect = el.getBoundingClientRect();
      const cx = (anchor?.x ?? rect.width / 2);
      const cy = (anchor?.y ?? rect.height / 2);
      const prevScale = scale;
      scale = clamp(next);
      const wx = (cx - tx) / prevScale;
      const wy = (cy - ty) / prevScale;
      tx = cx - wx * scale;
      ty = cy - wy * scale;
      apply();
    },
    reset() {
      scale = 1; tx = 0; ty = 0; apply();
    },
    destroy() {
      window.removeEventListener("wheel", onWheel as any);
      window.removeEventListener("gesturestart", onGestureStart as any);
      window.removeEventListener("gesturechange", onGestureChange as any);
    }
  };
}
