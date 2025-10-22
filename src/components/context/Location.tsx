import React, { createContext, useContext, useState } from 'react';
import { Trail } from '../../types/trail';

// Define the type of the context
interface LocationContextType {
    location: string;
    setLocation: React.Dispatch<React.SetStateAction<string>>;
    triggerGetTrails: boolean;
    setTriggerGetTrails: React.Dispatch<React.SetStateAction<boolean>>;
    trails: Trail[];
    setTrails: React.Dispatch<React.SetStateAction<Trail[]>>;
}

// Define the LocationContext
export const LocationContext = createContext<LocationContextType>({location: '', setLocation: () => {} , triggerGetTrails: false, setTriggerGetTrails: () => {}, trails:[] , setTrails:() => {} }as LocationContextType);

// Create the context
export const LocationProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
        const [location, setLocation] = useState<string>('');
        const [triggerGetTrails, setTriggerGetTrails] = useState<boolean>(false);
        const [trails, setTrails] = useState<Trail[]>([]);

        return (
                <LocationContext.Provider value={{ location, setLocation, triggerGetTrails, setTriggerGetTrails, trails, setTrails }}>
                        {children}
                </LocationContext.Provider>
        );
};

// Create a custom hook that uses the context
export const useLocation = (): LocationContextType => {
    const context = useContext(LocationContext);
    if (context === null) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};