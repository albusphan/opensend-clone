import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Provider } from "react-redux";

import { routeTree } from "./routeTree.gen";
import { store } from "./lib/redux/store";
import { ThemeProvider } from "./components/theme/theme-provider";
import { LoadingScreen } from "./components/loading-screen";

import "./styles.css";
import reportWebVitals from "./reportWebVitals.ts";

const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function RouterWithLoading() {
  return (
    <RouterProvider
      router={router}
      defaultPendingComponent={LoadingScreen}
      defaultPendingMs={0}
    />
  );
}

const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <Provider store={store}>
        <ThemeProvider defaultTheme="system">
          <RouterWithLoading />
        </ThemeProvider>
      </Provider>
    </StrictMode>
  );
}

reportWebVitals();
