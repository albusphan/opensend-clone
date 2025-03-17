import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import {
  removeWidget,
  updateLayouts,
  setEditingWidget,
  addWidget,
} from "@/lib/redux/dashboardSlice";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Widget } from "@/components/dashboard/widget";
import { WidgetEditForm } from "@/components/dashboard/widget-edit-form";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ResponsiveGridLayout = WidthProvider(Responsive);

// Define widget types and their configurations
const WIDGET_TYPES = {
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

export function WidgetGrid() {
  const dispatch = useAppDispatch();
  const { widgets, layouts, editingWidget } = useAppSelector(
    (state) => state.dashboard
  );
  const { view } = useAppSelector((state) => state.auth);
  const isAdmin = true;
  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");
  const [mounted, setMounted] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedWidgetType, setSelectedWidgetType] = useState<string | null>(
    null
  );
  const [widgetConfig, setWidgetConfig] = useState<{
    title: string;
    description: string;
  } | null>(null);

  // Set mounted after component mounts to avoid SSR issues with grid layout
  useEffect(() => {
    setMounted(true);

    // Debug info
    console.log("Initial widget layouts:", layouts);
  }, []);

  // Make sure all widgets have layouts defined for the current breakpoint
  useEffect(() => {
    if (!mounted) return;

    // Ensure each widget has a layout in the current breakpoint
    const currentLayout = layouts[currentBreakpoint] || [];
    const layoutItems = currentLayout.map((item) => item.i);

    const missingWidgets = widgets.filter(
      (widget) => !layoutItems.includes(widget.id)
    );

    if (missingWidgets.length > 0) {
      console.log("Found widgets missing from layout:", missingWidgets);

      // Create updated layouts
      const updatedLayouts = { ...layouts };

      // Add missing widgets to layouts
      missingWidgets.forEach((widget, idx) => {
        if (!updatedLayouts[currentBreakpoint]) {
          updatedLayouts[currentBreakpoint] = [];
        }

        updatedLayouts[currentBreakpoint].push({
          i: widget.id,
          x:
            (idx * 4) %
            (currentBreakpoint === "lg"
              ? 12
              : currentBreakpoint === "md" || currentBreakpoint === "sm"
                ? 6
                : 4),
          y: Math.floor(idx / (currentBreakpoint === "lg" ? 3 : 2)) * 3,
          w: 4,
          h: 3,
          minW: 2,
          minH: 2,
        });
      });

      // Save the updated layouts
      dispatch(updateLayouts({ layouts: updatedLayouts }));
    }
  }, [mounted, currentBreakpoint, widgets, layouts, dispatch]);

  // Find the widget being edited
  const widgetToEdit = widgets.find((w) => w.id === editingWidget);

  // Handle layout changes
  const handleLayoutChange = (layout: any, layouts: any) => {
    // Save layouts to Redux store
    dispatch(updateLayouts({ layouts }));

    // Log the saved layout
    console.log("Layout updated and saved:", layouts);
  };

  // Handle widget removal
  const handleRemoveWidget = (id: string) => {
    dispatch(removeWidget(id));
    toast.success("Widget removed", {
      description: "Widget has been removed from your dashboard",
    });
  };

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
    setAddDialogOpen(false);
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

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-muted p-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-10 w-10 text-muted-foreground"
        >
          <rect width="8" height="8" x="2" y="2" rx="1" />
          <path d="M6 6h.01" />
          <rect width="8" height="8" x="14" y="2" rx="1" />
          <path d="M18 6h.01" />
          <rect width="8" height="8" x="2" y="14" rx="1" />
          <path d="M6 18h.01" />
          <rect width="8" height="8" x="14" y="14" rx="1" />
          <path d="M18 18h.01" />
        </svg>
      </div>
      <h2 className="text-xl font-bold tracking-tight">No widgets available</h2>
      <p className="mt-1 text-muted-foreground">
        {isAdmin
          ? "Your dashboard is currently empty. Add widgets to start monitoring your metrics."
          : "There are no widgets configured for your dashboard yet."}
      </p>
      {isAdmin && (
        <Button className="mt-4" onClick={() => setAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Widget
        </Button>
      )}
    </div>
  );

  return (
    <>
      {isAdmin && widgets.length > 0 && (
        <div className="mb-6 flex justify-end">
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Widget
              </Button>
            </DialogTrigger>
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
                        handleWidgetTypeSelect(
                          type as keyof typeof WIDGET_TYPES
                        )
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
                    selectedWidgetType
                      ? setSelectedWidgetType(null)
                      : setAddDialogOpen(false)
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
        </div>
      )}

      {widgets.length === 0 ? (
        <EmptyState />
      ) : mounted ? (
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
          cols={{ lg: 12, md: 6, sm: 6, xs: 4 }}
          rowHeight={100}
          onLayoutChange={handleLayoutChange}
          onBreakpointChange={setCurrentBreakpoint}
          breakpoint={currentBreakpoint}
          isDraggable
          isResizable
          draggableHandle=".drag-handle"
          margin={[16, 16]}
          containerPadding={[0, 0]}
          compactType="horizontal"
          preventCollision={false}
          onDragStop={() => {
            toast.success("Widget arrangement saved", {
              description: "Your dashboard layout has been updated",
            });
          }}
          onResizeStop={() => {
            toast.success("Widget size saved", {
              description: "Your dashboard layout has been updated",
            });
          }}
        >
          {widgets.map((widget) => (
            <div key={widget.id}>
              <Widget
                widget={widget}
                onRemove={handleRemoveWidget}
                isAdmin={isAdmin}
              />
            </div>
          ))}
        </ResponsiveGridLayout>
      ) : null}

      {widgetToEdit && (
        <WidgetEditForm
          widget={widgetToEdit}
          open={!!editingWidget}
          onClose={() => dispatch(setEditingWidget(null))}
        />
      )}
    </>
  );
}
