import { ReactNode, cloneElement, isValidElement } from "react";
import { HelpCircle } from "lucide-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FieldProps {
  id: string;
  label: string;
  helperText?: string;
  tooltip?: string;
  errorText?: string;
  children: ReactNode;
}

function attachIdToChild(id: string, child: ReactNode): ReactNode {
  if (!child) return child;
  if (typeof child === "string") return child;
  if (Array.isArray(child)) return child;
  if (!isValidElement(child)) return child;
  if (child.props && child.props.id) return child;
  return cloneElement(child, { id });
}

export function Field({ id, label, helperText, tooltip, errorText, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <label htmlFor={id} className="text-sm font-semibold">
            {label}
          </label>
          {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
        </div>
        {tooltip ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`${label}の補足`}
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
      </div>
      {attachIdToChild(id, children)}
      {errorText ? <p className="text-xs text-destructive">{errorText}</p> : null}
    </div>
  );
}
