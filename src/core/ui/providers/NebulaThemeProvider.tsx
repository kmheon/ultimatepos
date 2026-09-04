import React, { createContext, useContext } from 'react';
import { themeTokens, ThemeTokens } from '../theme/tokens';

const NebulaThemeContext = createContext<ThemeTokens>(themeTokens);

interface NebulaThemeProviderProps {
  children: React.ReactNode;
  theme?: ThemeTokens;
}

export const NebulaThemeProvider: React.FC<NebulaThemeProviderProps> = ({
  children,
  theme = themeTokens,
}) => {
  return (
    <NebulaThemeContext.Provider value={theme}>
      {children}
    </NebulaThemeContext.Provider>
  );
};

export const useThemeTokens = () => useContext(NebulaThemeContext);
