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

const ResponsiveGridLayout = WidthProvider(Responsive);

// Define widget types and their configurations
const WIDGET_TYPES = {
  IDENTITIES_PROVIDED: {
    title: "Identities Provided",
    description: "New identities provided during the selected time period.",
    icon: "👤",
    defaultValue: 0,
  },
  OPENED_MESSAGE: {
    title: "Opened Message",
    description:
      "Number of provided identities who opened emails during the selected time period.",
    icon: "📨",
    defaultValue: 0,
  },
  CLICKED: {
    title: "Clicked",
    description:
      "Number of provided identities who clicked on emails for the selected time period.",
    icon: "🖱️",
    defaultValue: 0,
  },
};

// Default layout configurations
const DEFAULT_WIDGET_LAYOUT = {
  minW: 2, // Minimum width of 2 grid units
  minH: 2, // Minimum height of 2 grid units
  w: 4, // Default width of 4 grid units
  h: 2, // Default height of 2 grid units
};

export function WidgetGrid() {
  const dispatch = useAppDispatch();
  const { widgets, layouts, editingWidget } = useAppSelector(
    (state) => state.dashboard
  );
  const { view } = useAppSelector((state) => state.auth);
  const isAdmin = view?.type === "ADMIN";

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
  }, []);

  // Find the widget being edited
  const widgetToEdit = widgets.find((w) => w.id === editingWidget);

  // Handle layout changes
  const handleLayoutChange = (layout: any, layouts: any) => {
    dispatch(updateLayouts({ layouts }));
  };

  // Handle widget removal
  const handleRemoveWidget = (id: string) => {
    dispatch(removeWidget(id));
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

    // Reset form and close dialog
    setSelectedWidgetType(null);
    setWidgetConfig(null);
    setAddDialogOpen(false);
  };

  // Generate layout for new widgets
  const generateNewWidgetLayout = () => {
    // Find the first available position in the grid
    const existingLayouts = layouts?.lg || [];
    let y = 0;

    existingLayouts.forEach((layout: any) => {
      y = Math.max(y, layout.y + layout.h);
    });

    return {
      ...DEFAULT_WIDGET_LAYOUT,
      y,
      x: 0,
    };
  };

  return (
    <>
      {isAdmin && (
        <div className="mb-6 flex justify-end">
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Widget
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add a metric</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Select a widget type to add to the overview page.
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
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <div className="text-2xl">
                      {
                        WIDGET_TYPES[
                          selectedWidgetType as keyof typeof WIDGET_TYPES
                        ].icon
                      }
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {widgetConfig?.title ||
                          WIDGET_TYPES[
                            selectedWidgetType as keyof typeof WIDGET_TYPES
                          ].title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {widgetConfig?.description ||
                          WIDGET_TYPES[
                            selectedWidgetType as keyof typeof WIDGET_TYPES
                          ].description}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedWidgetType(null)}
                    >
                      Back
                    </Button>
                    <Button onClick={handleWidgetConfigure}>Add</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}

      {mounted && (
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
          cols={{ lg: 12, md: 6, sm: 6, xs: 4 }}
          rowHeight={100}
          onLayoutChange={handleLayoutChange}
          onBreakpointChange={setCurrentBreakpoint}
          isDraggable={isAdmin}
          isResizable={isAdmin}
          draggableHandle=".drag-handle"
          margin={[16, 16]}
          containerPadding={[16, 16]}
        >
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className="shadow-sm"
              data-grid={generateNewWidgetLayout()}
            >
              <Widget
                widget={widget}
                onRemove={handleRemoveWidget}
                isAdmin={isAdmin}
              />
            </div>
          ))}
        </ResponsiveGridLayout>
      )}

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
