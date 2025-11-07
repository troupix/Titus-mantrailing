/**
 * @file ViewModeContext.tsx
 * @description Provides a context for managing and persisting the application's view mode (user or trainer).
 * This allows components across the application to access and update the current mode, and ensures the mode persists across sessions using localStorage.
 */

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

/**
 * @interface ViewModeContextType
 * @description Defines the shape of the context value provided by ViewModeProvider.
 * @property {("user" | "trainer")} viewMode - The current active view mode.
 * @property {(mode: "user" | "trainer") => void} setViewMode - Function to update the view mode.
 * @property {boolean} isTrainerMode - True if the current mode is 'trainer'.
 * @property {boolean} isUserMode - True if the current mode is 'user'.
 */
interface ViewModeContextType {
  viewMode: "user" | "trainer";
  setViewMode: (mode: "user" | "trainer") => void;
  isTrainerMode: boolean;
  isUserMode: boolean;
}

// Create the context with an undefined default value, as it will be provided by the Provider.
const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

/**
 * @function ViewModeProvider
 * @description A React Context Provider that manages the application's view mode.
 * It stores the current mode in its state and persists it to localStorage.
 * @param {Object} props - The component props.
 * @param {ReactNode} props.children - The child components to be rendered within the provider's scope.
 */
export function ViewModeProvider({ children }: { children: ReactNode }) {
  // Initialize viewMode state from localStorage or default to "user"
  const [viewMode, setViewMode] = useState<"user" | "trainer">(() => {
    return (localStorage.getItem("viewMode") as "user" | "trainer") || "user";
  });

  // Effect to update localStorage whenever viewMode changes
  useEffect(() => {
    localStorage.setItem("viewMode", viewMode);
  }, [viewMode]);

  // Derived state for convenience
  const isTrainerMode = viewMode === "trainer";
  const isUserMode = viewMode === "user";

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode, isTrainerMode, isUserMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

/**
 * @function useViewMode
 * @description A custom hook to access the ViewModeContext.
 * Throws an error if used outside of a ViewModeProvider.
 * @returns {ViewModeContextType} The current view mode context value.
 */
export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error("useViewMode must be used within a ViewModeProvider");
  }
  return context;
}
