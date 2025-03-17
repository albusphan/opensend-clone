import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { STORAGE_KEYS } from "../constants";
import type { Layout, Layouts } from "react-grid-layout";

export type WidgetType = "IDENTITIES_PROVIDED" | "OPENED_MESSAGE" | "CLICKED";

// Widget type definition
export interface Widget {
  id: string;
  title: string;
  description: string;
  type: WidgetType;
  value: number;
  icon: string;
}

// Layout item type for react-grid-layout
export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

// Dashboard state type
export interface DashboardState {
  widgets: Widget[];
  layouts: Layouts;
  editingWidget: string | null;
}

// Generate default widgets
const generateDefaultWidgets = (): Widget[] => {
  return [
    {
      id: "widget-1",
      title: "Identities Provided",
      description: "New identities provided during the selected time period.",
      type: "IDENTITIES_PROVIDED",
      value: 0,
      icon: "👤",
    },
    {
      id: "widget-2",
      title: "Opened Message",
      description:
        "Number of provided identities who opened emails during the selected time period.",
      type: "OPENED_MESSAGE",
      value: 0,
      icon: "📨",
    },
    {
      id: "widget-3",
      title: "Clicked",
      description:
        "Number of provided identities who clicked on emails for the selected time period.",
      type: "CLICKED",
      value: 0,
      icon: "🖱",
    },
  ];
};

// Generate default layouts for the widgets
const generateDefaultLayouts = (
  widgets: Widget[]
): DashboardState["layouts"] => {
  return {
    lg: widgets.map((widget, index) => ({
      i: widget.id,
      x: index * 4, // Place widgets horizontally next to each other
      y: 0, // All widgets in the same row (y=0)
      w: 4,
      h: 3,
      minW: 2,
      minH: 2,
    })),
    md: widgets.map((widget, index) => ({
      i: widget.id,
      x: (index * 3) % 6,
      y: Math.floor(index / 2) * 3,
      w: 3,
      h: 3,
      minW: 2,
      minH: 2,
    })),
    sm: widgets.map((widget, index) => ({
      i: widget.id,
      x: (index * 3) % 6,
      y: Math.floor(index / 2) * 3,
      w: 3,
      h: 3,
      minW: 2,
      minH: 2,
    })),
    xs: widgets.map((widget, index) => ({
      i: widget.id,
      x: 0,
      y: index * 3,
      w: 4,
      h: 3,
      minW: 2,
      minH: 2,
    })),
  };
};

// Load dashboard state from localStorage
const loadDashboardState = (): DashboardState => {
  try {
    const defaultWidgets = generateDefaultWidgets();
    const defaultLayouts = generateDefaultLayouts(defaultWidgets);

    const storedWidgetsJSON = localStorage.getItem(
      STORAGE_KEYS.DASHBOARD_WIDGETS
    );
    const storedLayoutsJSON = localStorage.getItem(
      STORAGE_KEYS.DASHBOARD_LAYOUTS
    );

    const widgets = storedWidgetsJSON
      ? JSON.parse(storedWidgetsJSON)
      : defaultWidgets;
    const layouts = storedLayoutsJSON
      ? JSON.parse(storedLayoutsJSON)
      : defaultLayouts;

    // Store default values if not already saved
    if (!storedWidgetsJSON) {
      localStorage.setItem(
        STORAGE_KEYS.DASHBOARD_WIDGETS,
        JSON.stringify(defaultWidgets)
      );
    }

    if (!storedLayoutsJSON) {
      localStorage.setItem(
        STORAGE_KEYS.DASHBOARD_LAYOUTS,
        JSON.stringify(defaultLayouts)
      );
    }

    return {
      widgets,
      layouts,
      editingWidget: null,
    };
  } catch (error) {
    const defaultWidgets = generateDefaultWidgets();
    return {
      widgets: defaultWidgets,
      layouts: generateDefaultLayouts(defaultWidgets),
      editingWidget: null,
    };
  }
};

// Create dashboard slice
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: loadDashboardState(),
  reducers: {
    updateLayouts: (
      state,
      action: PayloadAction<{
        layouts: Layouts;
      }>
    ) => {
      state.layouts = action.payload.layouts;
      localStorage.setItem(
        STORAGE_KEYS.DASHBOARD_LAYOUTS,
        JSON.stringify(state.layouts)
      );
    },

    updateWidget: (state, action: PayloadAction<Widget>) => {
      const index = state.widgets.findIndex((w) => w.id === action.payload.id);
      if (index !== -1) {
        state.widgets[index] = action.payload;
        localStorage.setItem(
          STORAGE_KEYS.DASHBOARD_WIDGETS,
          JSON.stringify(state.widgets)
        );
      }
    },

    addWidget: (state, action: PayloadAction<Widget>) => {
      state.widgets.push(action.payload);

      // Calculate layout position for the new widget
      const findPosition = (layouts: Layout[], cols: number) => {
        // Find the rightmost widget on the first row
        let maxX = 0;
        layouts.forEach((layout) => {
          if (layout.y === 0 && layout.x + layout.w > maxX) {
            maxX = layout.x + layout.w;
          }
        });

        // If there's room on the first row, place it there
        if (maxX + 4 <= cols) {
          return { x: maxX, y: 0 };
        }

        // Otherwise, find the lowest position
        let y = 0;
        layouts.forEach((layout) => {
          y = Math.max(y, layout.y + layout.h);
        });

        return { x: 0, y };
      };

      // Add layout for each breakpoint
      Object.keys(state.layouts).forEach((breakpoint) => {
        const layouts = (state.layouts as any)[breakpoint] || [];
        const cols =
          breakpoint === "lg"
            ? 12
            : breakpoint === "md" || breakpoint === "sm"
              ? 6
              : 4;

        const position = findPosition(layouts, cols);

        (state.layouts as any)[breakpoint].push({
          i: action.payload.id,
          x: position.x,
          y: position.y,
          w: 4,
          h: 3,
          minW: 2,
          minH: 2,
        });
      });

      localStorage.setItem(
        STORAGE_KEYS.DASHBOARD_WIDGETS,
        JSON.stringify(state.widgets)
      );
      localStorage.setItem(
        STORAGE_KEYS.DASHBOARD_LAYOUTS,
        JSON.stringify(state.layouts)
      );
    },

    removeWidget: (state, action: PayloadAction<string>) => {
      state.widgets = state.widgets.filter((w) => w.id !== action.payload);
      // Remove layout for each breakpoint
      Object.keys(state.layouts).forEach((breakpoint) => {
        (state.layouts as any)[breakpoint] = (state.layouts as any)[
          breakpoint
        ].filter((layout: Layout) => layout.i !== action.payload);
      });

      localStorage.setItem(
        STORAGE_KEYS.DASHBOARD_WIDGETS,
        JSON.stringify(state.widgets)
      );
      localStorage.setItem(
        STORAGE_KEYS.DASHBOARD_LAYOUTS,
        JSON.stringify(state.layouts)
      );
    },

    setEditingWidget: (state, action: PayloadAction<string | null>) => {
      state.editingWidget = action.payload;
    },
  },
});

export const {
  updateLayouts,
  updateWidget,
  addWidget,
  removeWidget,
  setEditingWidget,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
