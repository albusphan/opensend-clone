import { useState } from "react";
import { useAppDispatch } from "@/lib/redux/hooks";
import { addWidget } from "@/lib/redux/dashboardSlice";
import { Widget } from "@/components/dashboard/widget";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Define widget types and their configurations
export const WIDGET_TYPES = {
  IDENTITIES_PROVIDED: {
    title: "Identities Provided",
    description: "New identities provided during the selected time period.",
    icon: "👤",
    defaultValue: 0,
    type: "Identities Provided - TEXT",
  },
  OPENED_MESSAGE: {
    title: "Opened Message",
    description:
      "Number of provided identities who opened emails during the selected time period.",
    icon: "📨",
    defaultValue: 0,
    type: "Opened Message - TEXT",
  },
  CLICKED: {
    title: "Clicked",
    description:
      "Number of provided identities who clicked on emails for the selected time period.",
    icon: "🖱️",
    defaultValue: 0,
    type: "Clicked - TEXT",
  },
};

interface WidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WidgetDialog({ open, onOpenChange }: WidgetDialogProps) {
  const dispatch = useAppDispatch();
  const [selectedWidgetType, setSelectedWidgetType] = useState<string | null>(
    null
  );
  const [widgetConfig, setWidgetConfig] = useState<{
    title: string;
    description: string;
  } | null>(null);

  // Handle widget type selection
  const handleWidgetTypeSelect = (type: keyof typeof WIDGET_TYPES) => {
    setSelectedWidgetType(type);
    setWidgetConfig({
      title: WIDGET_TYPES[type].title,
      description: WIDGET_TYPES[type].description,
    });
  };

  // Handle widget configuration
  const handleWidgetConfigure = () => {
    if (!selectedWidgetType || !widgetConfig) return;

    const widgetType = selectedWidgetType as keyof typeof WIDGET_TYPES;
    const config = WIDGET_TYPES[widgetType];

    dispatch(
      addWidget({
        id: `widget-${uuidv4()}`,
        title: widgetConfig.title,
        description: widgetConfig.description,
        type: widgetType,
        value: config.defaultValue,
        icon: config.icon,
      })
    );

    toast.success("Widget added", {
      description: "New widget has been added to your dashboard",
    });

    // Reset form and close dialog
    setSelectedWidgetType(null);
    setWidgetConfig(null);
    onOpenChange(false);
  };

  // Create preview widget for add/edit modal
  const createPreviewWidget = () => {
    if (!selectedWidgetType || !widgetConfig) return null;

    const widgetType = selectedWidgetType as keyof typeof WIDGET_TYPES;
    const config = WIDGET_TYPES[widgetType];

    return {
      id: "preview",
      title: widgetConfig.title,
      description: widgetConfig.description,
      type: widgetType,
      value: 0,
      icon: config.icon,
    };
  };

  const handleClose = () => {
    setSelectedWidgetType(null);
    setWidgetConfig(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Configure widget</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Add a title and select data to display on the overview page.
          </p>
        </DialogHeader>

        {!selectedWidgetType ? (
          // Widget type selection view
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            {Object.entries(WIDGET_TYPES).map(([type, config]) => (
              <button
                key={type}
                onClick={() =>
                  handleWidgetTypeSelect(type as keyof typeof WIDGET_TYPES)
                }
                className={cn(
                  "p-4 rounded-lg border-2 hover:border-primary transition-all",
                  "flex flex-col items-center text-center gap-2",
                  "cursor-pointer"
                )}
              >
                <div className="text-2xl">{config.icon}</div>
                <h3 className="font-medium">{config.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {config.description}
                </p>
              </button>
            ))}
          </div>
        ) : (
          // Widget configuration view
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left column - Widget Preview */}
            <div className="flex-1">
              {createPreviewWidget() && (
                <Widget
                  widget={createPreviewWidget()!}
                  onRemove={() => {}}
                  isAdmin={false}
                />
              )}
            </div>

            {/* Right column - Edit Form */}
            <div className="flex-1">
              <div className="space-y-6">
                <div className="p-4 bg-muted rounded-lg mb-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    Widget type
                  </div>
                  <div className="font-medium">
                    {
                      WIDGET_TYPES[
                        selectedWidgetType as keyof typeof WIDGET_TYPES
                      ].type
                    }
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title" className="text-base">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={widgetConfig?.title || ""}
                      onChange={(e) =>
                        setWidgetConfig({
                          title: e.target.value,
                          description:
                            widgetConfig?.description ||
                            (selectedWidgetType &&
                              WIDGET_TYPES[
                                selectedWidgetType as keyof typeof WIDGET_TYPES
                              ].description) ||
                            "",
                        })
                      }
                      placeholder="Enter widget title"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description" className="text-base">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={widgetConfig?.description || ""}
                      onChange={(e) =>
                        setWidgetConfig({
                          title:
                            widgetConfig?.title ||
                            (selectedWidgetType &&
                              WIDGET_TYPES[
                                selectedWidgetType as keyof typeof WIDGET_TYPES
                              ].title) ||
                            "",
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter widget description"
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 mt-4">
          <Button
            variant="outline"
            onClick={() =>
              selectedWidgetType ? setSelectedWidgetType(null) : handleClose()
            }
          >
            Back
          </Button>
          {selectedWidgetType && (
            <Button
              onClick={handleWidgetConfigure}
              disabled={
                !widgetConfig?.title?.trim() ||
                !widgetConfig?.description?.trim()
              }
            >
              Add
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
