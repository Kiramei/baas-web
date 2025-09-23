"use client"

import * as React from "react"
import {Input} from "@/components/ui/input"
import {LabelWithTooltip} from "@/components/ui/LabelWithTooltip.tsx";

interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  tooltip?: string
  className?: string
}

export const FormInput: React.FC<FormInputProps> = ({
                                                      label,
                                                      tooltip,
                                                      className,
                                                      ...props
                                                    }) => {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      {label && (tooltip ? <LabelWithTooltip className="block text-sm font-medium" label={label} tooltip={tooltip}/>
        : <label className="block text-sm font-medium">{label}</label>)}
      <Input {...props} className="w-full"/>
    </div>
  )
}
