import React, { createContext, useContext } from 'react';
import client from './NetworkClient';

const NetworkContext = createContext();

export const NetworkProvider = ({ children }) => {
    return (
        <NetworkContext.Provider value={client}>
            {children}
        </NetworkContext.Provider>
    );
};

export const useNetwork = () => useContext(NetworkContext);
