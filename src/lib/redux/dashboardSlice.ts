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

// Load dashboard state from localStorage
const loadDashboardState = (): DashboardState => {
  try {
    // Start with empty arrays instead of defaults
    const emptyWidgets: Widget[] = [];
    const emptyLayouts: Layouts = { lg: [], md: [], sm: [], xs: [] };

    const storedWidgetsJSON = localStorage.getItem(
      STORAGE_KEYS.DASHBOARD_WIDGETS
    );
    const storedLayoutsJSON = localStorage.getItem(
      STORAGE_KEYS.DASHBOARD_LAYOUTS
    );

    // Use stored values or empty arrays (not defaults)
    const widgets = storedWidgetsJSON
      ? JSON.parse(storedWidgetsJSON)
      : emptyWidgets;
    const layouts = storedLayoutsJSON
      ? JSON.parse(storedLayoutsJSON)
      : emptyLayouts;

    // Store empty values if not already saved (or remove these lines entirely)
    if (!storedWidgetsJSON) {
      localStorage.setItem(
        STORAGE_KEYS.DASHBOARD_WIDGETS,
        JSON.stringify(emptyWidgets)
      );
    }

    if (!storedLayoutsJSON) {
      localStorage.setItem(
        STORAGE_KEYS.DASHBOARD_LAYOUTS,
        JSON.stringify(emptyLayouts)
      );
    }

    return {
      widgets,
      layouts,
      editingWidget: null,
    };
  } catch (error) {
    // Return empty state on error
    return {
      widgets: [],
      layouts: { lg: [], md: [], sm: [], xs: [] },
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
