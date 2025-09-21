"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"

interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  className?: string
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  className,
  ...props
}) => {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      {label && <label className="block text-sm font-medium">{label}</label>}
      <Input {...props} className="w-full" />
    </div>
  )
}
