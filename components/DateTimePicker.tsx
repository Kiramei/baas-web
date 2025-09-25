"use client"

import * as React from "react"
import {Calendar} from "@/components/ui/calendar"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {FormInput} from "@/components/ui/FormInput"
import {cn} from "@/lib/utils"
import {toast} from "sonner"
import {useTranslation} from "react-i18next";
import {startTransition} from "react";  // 假设你用 shadcn/ui 的 toast

interface DateTimePickerProps {
  value: number | null
  onChange: (ts: number | null) => void
  className?: string
  delay?: number // 延迟提交的时间，默认 500ms
}

const DateTimePickerBase: React.FC<DateTimePickerProps> = ({
                                                             value,
                                                             onChange,
                                                             className,
                                                             delay = 500,
                                                           }) => {
  const [open, setOpen] = React.useState(false)
  const dateObj = value != null ? new Date(value) : null
  const {t} = useTranslation()

  // 日期字符串
  const dateStr = dateObj
    ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(
      dateObj.getDate()
    ).padStart(2, "0")}`
    : "0000-00-00"

  // 时间字符串
  const timeStr = dateObj
    ? `${String(dateObj.getHours()).padStart(2, "0")}:${String(dateObj.getMinutes()).padStart(
      2,
      "0"
    )}:${String(dateObj.getSeconds()).padStart(2, "0")}`
    : "00:00:00"

  // 本地状态缓存输入
  const [localTime, setLocalTime] = React.useState(timeStr)

  React.useEffect(() => {
    // 外部值变化时同步到本地
    if (dateObj) {
      const newStr = `${String(dateObj.getHours()).padStart(2, "0")}:${String(
        dateObj.getMinutes()
      ).padStart(2, "0")}:${String(dateObj.getSeconds()).padStart(2, "0")}`
      setLocalTime(newStr)
    }
  }, [value])

  // ⏳ debounce 定时器
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // 更新日期
  const handleDateSelect = React.useCallback((d?: Date) => {
    if (!d) {
      onChange(null)
      return
    }
    const newDate = dateObj ?? new Date()
    newDate.setFullYear(d.getFullYear(), d.getMonth(), d.getDate())
    startTransition(() => {
      onChange(newDate.getTime())
      setOpen(false)
    })
    toast(t("toast.dateUpdated"), {
      description: newDate.toLocaleString(),
    })
  }, [dateObj, onChange])

  // 更新时间（延迟触发）
  const handleTimeInput = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setLocalTime(val)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      const [h, m, s] = val.split(":").map((x) => parseInt(x, 10))
      const newDate = dateObj ?? new Date()
      newDate.setHours(h || 0, m || 0, s || 0)
      // onChange(newDate.getTime())
      startTransition(() => {
        onChange(newDate.getTime())
      })
      toast.success(t("toast.timeUpdated"), {
        description: newDate.toLocaleString(),
      })
    }, delay)
  }, [dateObj, onChange])

  return (
    <div
      className={cn(
        "flex bg-transparent border px-4 rounded-lg py-0 w-fit h-8",
        className
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormInput
            value={dateStr}
            className="justify-between font-mono !p-0"
            childClassName="border-none !p-0 !bg-transparent shadow-none h-8"
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={dateObj ?? undefined}
            captionLayout="label"
            onSelect={handleDateSelect}
          />
        </PopoverContent>
      </Popover>

      <span className="mx-1 h-8">.</span>

      <FormInput
        type="time"
        step="1"
        value={localTime}
        onChange={handleTimeInput}
        className="font-mono h-8"
        childClassName="h-8
          border-none !p-0 !bg-transparent shadow-none
          focus:outline-none focus-visible:outline-none
          focus-visible:!ring-0 focus-visible:!ring-offset-0
          focus-visible:!border-current
          focus-visible:[--tw-ring-color:transparent]
          focus-visible:[--tw-ring-shadow:0_0_#0000]
          focus-visible:[--tw-ring-offset-shadow:0_0_#0000]
        "
      />
    </div>
  )
}

export const DateTimePicker = React.memo(DateTimePickerBase)