import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { STORAGE_KEYS } from "../constants";
import { v4 as uuidv4 } from "uuid";
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
      title: "Total Sales",
      description: "Sum of all sales in the current month",
      type: "IDENTITIES_PROVIDED",
      value: 125000,
      icon: "",
    },
    {
      id: "widget-2",
      title: "Active Customers",
      description: "Number of customers with activity in the last 30 days",
      type: "OPENED_MESSAGE",
      value: 256,
      icon: "",
    },
    {
      id: "widget-3",
      title: "Pending Orders",
      description: "Orders awaiting processing",
      type: "CLICKED",
      value: 64,
      icon: "",
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
      x: (index * 4) % 12,
      y: Math.floor(index / 3) * 3,
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
      : generateDefaultLayouts(defaultWidgets);

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
      // Add layout for each breakpoint
      Object.keys(state.layouts).forEach((breakpoint) => {
        (state.layouts as any)[breakpoint].push({
          i: action.payload.id,
          x: 0,
          y: 0,
          w: 4,
          h: 2,
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
