import { useState } from "react";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setEditingWidget } from "@/lib/redux/dashboardSlice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  GripVertical,
  TrendingUp,
  TrendingDown,
  ChevronsUpDown,
} from "lucide-react";
import type { Widget as WidgetType } from "@/lib/redux/dashboardSlice";
import { cn } from "@/lib/utils";

interface WidgetProps {
  widget: WidgetType;
  onRemove: (id: string) => void;
  isAdmin: boolean;
}

export function Widget({ widget, onRemove, isAdmin }: WidgetProps) {
  const dispatch = useAppDispatch();
  const [isHovering, setIsHovering] = useState(false);

  // Format the value based on widget type
  const formatValue = (value: number | undefined) => {
    const safeValue = value || 0;
    return new Intl.NumberFormat().format(safeValue);
  };

  // Get trend indicator component
  const TrendIndicator = () => {
    // For this example, we'll use random trends
    const trendDirection = Math.random() > 0.5 ? "up" : "down";
    const trendValue = Math.floor(Math.random() * 10) + 1;

    if (trendDirection === "up") {
      return (
        <div className="flex items-center text-emerald-500">
          <TrendingUp className="h-4 w-4 mr-1" />
          <span>{trendValue}%</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-rose-500">
          <TrendingDown className="h-4 w-4 mr-1" />
          <span>{trendValue}%</span>
        </div>
      );
    }
  };

  return (
    <Card
      className="h-full flex flex-col transition-all relative group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Drag handle - only visible when hovering and admin */}
      {isAdmin && (
        <div
          className={cn(
            "absolute top-2 left-2 transition-opacity cursor-move drag-handle",
            "opacity-0 group-hover:opacity-100"
          )}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      <CardHeader className="relative p-4 pb-0">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <span className="text-xl">{widget.icon}</span>
          {widget.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col flex-grow p-4">
        <p className="text-sm text-muted-foreground">{widget.description}</p>

        <div className="mt-auto pt-4">
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-bold">
              {formatValue(widget.value)}
            </div>
            <TrendIndicator />
          </div>

          <div className="text-xs text-muted-foreground mt-1">
            Compared to last period
          </div>
        </div>
      </CardContent>

      {isAdmin && (
        <CardFooter className="p-2 flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(setEditingWidget(widget.id))}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(widget.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </CardFooter>
      )}

      {/* Resize handle indicator - only visible when hovering and admin */}
      {isAdmin && (
        <div
          className={cn(
            "absolute bottom-1 right-1 transition-opacity",
            "opacity-0 group-hover:opacity-100"
          )}
        >
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground opacity-50" />
        </div>
      )}
    </Card>
  );
}
