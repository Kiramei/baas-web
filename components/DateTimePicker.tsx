"use client"

import * as React from "react"
import {ChevronDownIcon} from "lucide-react"

import {Calendar} from "@/components/ui/calendar"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {FormInput} from "@/components/ui/FormInput"
import {cn} from "@/lib/utils"

interface DateTimePickerProps {
  value: number | null
  onChange: (ts: number | null) => void
  className?: string
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
                                                                value,
                                                                onChange,
                                                                className,
                                                              }) => {
  const [open, setOpen] = React.useState(false)

  const dateObj = value != null || value != undefined ? new Date(value) : null
  const dateStr = dateObj
    ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`
    : "0000-00-00"
  const timeStr = dateObj
    ? `${String(dateObj.getHours()).padStart(2, "0")}:${String(
      dateObj.getMinutes()
    ).padStart(2, "0")}:${String(dateObj.getSeconds()).padStart(2, "0")}`
    : "00:00:00"

  // 更新日期
  const handleDateSelect = (d?: Date) => {
    if (!d) {
      onChange(null)
      return
    }
    const newDate = dateObj ?? new Date()
    newDate.setFullYear(d.getFullYear(), d.getMonth(), d.getDate())
    onChange(newDate.getTime())
    setOpen(false)
  }

  // 更新时间
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m, s] = e.target.value.split(":").map((x) => parseInt(x, 10))
    const newDate = dateObj ?? new Date()
    newDate.setHours(h || 0, m || 0, s || 0)
    onChange(newDate.getTime())
  }

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
        value={timeStr}
        onChange={handleTimeChange}
        className="font-mono h-8"
        childClassName=" h-8
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
