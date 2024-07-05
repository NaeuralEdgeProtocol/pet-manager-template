import React, { createContext, useContext, useState, useEffect } from 'react';

const FleetContext = createContext({
    fleetArray: [],
    setFleetArray: () => {},
});

export const FleetProvider = ({ children }) => {
    const [fleetArray, setFleetArray] = useState(() => {
        const savedFleet = localStorage.getItem('fleetArray');
        return savedFleet ? JSON.parse(savedFleet) : [];
    });

    useEffect(() => {
        localStorage.setItem('fleetArray', JSON.stringify(fleetArray));
    }, [fleetArray]);

    return (
        <FleetContext.Provider value={{ fleetArray, setFleetArray }}>
            {children}
        </FleetContext.Provider>
    );
};

export const useFleet = () => useContext(FleetContext);
