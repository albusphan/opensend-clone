import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import {
  removeWidget,
  updateLayouts,
  setEditingWidget,
} from "@/lib/redux/dashboardSlice";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Widget } from "@/components/dashboard/widget";
import { WidgetEditForm } from "@/components/dashboard/widget-edit-form";
import { toast } from "sonner";
import { EmptyState } from "@/components/dashboard/empty-state";
import { WidgetDialog } from "@/components/dashboard/widget-dialog";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const ResponsiveGridLayout = WidthProvider(Responsive);

export function WidgetGrid() {
  const dispatch = useAppDispatch();
  const { widgets, layouts, editingWidget } = useAppSelector(
    (state) => state.dashboard
  );
  const { view } = useAppSelector((state) => state.auth);
  const isAdmin = view?.type === "ADMIN";
  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  useEffect(() => {
    const currentLayout = layouts[currentBreakpoint] || [];
    const layoutItems = currentLayout.map((item) => item.i);

    const missingWidgets = widgets.filter(
      (widget) => !layoutItems.includes(widget.id)
    );

    if (missingWidgets.length > 0) {
      const updatedLayouts = { ...layouts };

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
          h: 2,
          minW: 2,
          minH: 2,
        });
      });

      dispatch(updateLayouts({ layouts: updatedLayouts }));
    }
  }, [currentBreakpoint, widgets, layouts, dispatch]);

  const widgetToEdit = widgets.find((w) => w.id === editingWidget);

  const handleLayoutChange = (_layout: any, layouts: any) => {
    dispatch(updateLayouts({ layouts }));
  };

  const handleRemoveWidget = (id: string) => {
    dispatch(removeWidget(id));
    toast.success("Widget removed", {
      description: "Widget has been removed from your dashboard",
    });
  };

  return (
    <>
      {isAdmin && widgets.length > 0 && (
        <div className="mb-6 flex justify-end">
          <Button onClick={() => setAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Widget
          </Button>
        </div>
      )}

      {addDialogOpen && <WidgetDialog open onOpenChange={setAddDialogOpen} />}

      {widgets.length === 0 ? (
        <EmptyState
          isAdmin={isAdmin}
          onAddWidget={() => setAddDialogOpen(true)}
        />
      ) : (
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
          cols={{ lg: 12, md: 6, sm: 6, xs: 4 }}
          rowHeight={100}
          onLayoutChange={handleLayoutChange}
          onBreakpointChange={setCurrentBreakpoint}
          breakpoint={currentBreakpoint}
          isDraggable={isAdmin}
          isResizable={isAdmin}
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
