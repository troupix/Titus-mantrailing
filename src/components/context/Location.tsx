import React, { createContext, useState } from 'react';
import { Trail } from '../../types/trail';

interface LocationContextType {
    location: string;
    setLocation: (location: string) => void;
    trails: Trail[];
    setTrails: (trails: Trail[]) => void;
    triggerGetTrails: boolean;
    setTriggerGetTrails: (trigger: boolean) => void;
}

export const LocationContext = createContext<LocationContextType>({} as LocationContextType);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [location, setLocation] = useState('');
    const [trails, setTrails] = useState<Trail[]>([]);
    const [triggerGetTrails, setTriggerGetTrails] = useState(false);

    return (
        <LocationContext.Provider value={{ location, setLocation, trails, setTrails, triggerGetTrails, setTriggerGetTrails }}>
            {children}
        </LocationContext.Provider>
    );
};
