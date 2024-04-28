import React, { createContext, useContext, useState } from 'react';

// Define the type of the context
interface LocationContextType {
    location: string;
    setLocation: React.Dispatch<React.SetStateAction<string>>;
}

// Define the LocationContext
export const LocationContext = createContext<LocationContextType>({location: '', setLocation: () => {}} as LocationContextType);

// Create the context
export const LocationProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
        const [location, setLocation] = useState<string>('');

        return (
                <LocationContext.Provider value={{ location, setLocation }}>
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