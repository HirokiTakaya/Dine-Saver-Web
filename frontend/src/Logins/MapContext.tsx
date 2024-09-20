import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the type for the region
interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// Define the shape of the context
interface MapContextType {
  region: Region | null;
  setRegion: (region: Region | null) => void;
}

// Create the context with the correct type
const MapContext = createContext<MapContextType | undefined>(undefined);

// Custom hook to use the map context
export const useMap = (): MapContextType => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};

// Define props for the provider component
interface MapProviderProps {
  children: ReactNode; // ReactNode allows anything that can be rendered (JSX, strings, etc.)
}

// MapProvider component
export const MapProvider: React.FC<MapProviderProps> = ({ children }) => {
  const [region, setRegion] = useState<Region | null>(null);

  return (
    <MapContext.Provider value={{ region, setRegion }}>
      {children}
    </MapContext.Provider>
  );
};
