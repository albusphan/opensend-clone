import { useAppDispatch } from "@/lib/redux/hooks";
import { setEditingWidget } from "@/lib/redux/dashboardSlice";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import type { Widget as WidgetType } from "@/lib/redux/dashboardSlice";
import { cn } from "@/lib/utils";

interface WidgetProps {
  widget: WidgetType;
  onRemove: (id: string) => void;
  isAdmin: boolean;
}

export function Widget({ widget, onRemove, isAdmin }: WidgetProps) {
  const dispatch = useAppDispatch();

  // Format the value based on widget type
  const formatValue = (value: number | undefined) => {
    const safeValue = value || 0;
    return new Intl.NumberFormat().format(safeValue);
  };

  return (
    <Card className="h-full flex flex-col transition-all relative group pb-0">
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

      <CardContent className="flex flex-col flex-grow px-6">
        <div className="text-lg font-bold mb-2 uppercase">{widget.title}</div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{widget.icon}</span>
          <span className="text-3xl font-bold">
            {formatValue(widget.value)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="px-6 py-2 flex justify-end bg-muted">
        <p className="text-sm text-muted-foreground">{widget.description}</p>
      </CardFooter>
      {isAdmin && (
        <div className="flex gap-2 absolute top-2 right-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(setEditingWidget(widget.id))}
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-muted"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(widget.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-muted"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      )}
    </Card>
  );
}
