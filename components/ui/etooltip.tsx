import React from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface EllipsisWithTooltipProps {
  text: string
  className?: string
}

export const EllipsisWithTooltip: React.FC<EllipsisWithTooltipProps> = ({ text, className }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`overflow-hidden whitespace-nowrap text-ellipsis cursor-default ${className ?? ""}`}
          >
            {text}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
