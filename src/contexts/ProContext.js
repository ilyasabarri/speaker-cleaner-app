import React, { createContext, useState, useContext } from 'react';

const ProContext = createContext();

export function ProProvider({ children }) {
  const [isPro, setIsPro] = useState(false);

  const unlockPro = () => {
    setIsPro(true);
  };

  return (
    <ProContext.Provider value={{ isPro, unlockPro }}>
      {children}
    </ProContext.Provider>
  );
}

export function usePro() {
  return useContext(ProContext);
}
