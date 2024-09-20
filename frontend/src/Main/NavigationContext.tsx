import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the context
interface NavigationContextType {
  currentScreen: string;
  navigate: (screenName: string) => void;
}

// Create the context with the correct type
const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Custom hook to use the navigation context
export const useAppNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useAppNavigation must be used within a NavigationProvider');
  }
  return context;
};

// Define props for the provider component
interface NavigationProviderProps {
  children: ReactNode; // ReactNode type allows anything that can be rendered (JSX, strings, etc.)
}

// Navigation provider component
export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<string>('Login');

  const navigate = (screenName: string) => {
    setCurrentScreen(screenName);
  };

  return (
    <NavigationContext.Provider value={{ currentScreen, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
};
