import React, { createContext, useContext, useState } from 'react';

const ConnectionContext = createContext({
    isConnected: false,
    setConnected: () => {}
});

export const ConnectionProvider = ({ children }) => {
    const [isConnected, setConnected] = useState(false);

    return (
        <ConnectionContext.Provider value={{ isConnected, setConnected }}>
            {children}
        </ConnectionContext.Provider>
    );
};

export const useConnection = () => useContext(ConnectionContext);
