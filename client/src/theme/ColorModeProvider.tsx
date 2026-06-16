import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { ThemeProvider, createTheme, type PaletteMode } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

type ColorModeContextValue = {
  mode: PaletteMode;
  toggleMode: () => void;
};

const ColorModeContext = createContext<ColorModeContextValue | undefined>(undefined);

const buildTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#4F46E5'
      },
      secondary: {
        main: '#7C3AED'
      },
      background: {
        default: mode === 'light' ? '#F8FAFC' : '#111827',
        paper: mode === 'light' ? '#FFFFFF' : '#1F2937'
      },
      success: {
        main: '#16A34A'
      },
      warning: {
        main: '#F59E0B'
      },
      error: {
        main: '#DC2626'
      }
    },
    shape: {
      borderRadius: 6
    },
    typography: {
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: { letterSpacing: 0 },
      h2: { letterSpacing: 0 },
      h3: { letterSpacing: 0 },
      h4: { letterSpacing: 0 },
      h5: { letterSpacing: 0 },
      h6: { letterSpacing: 0 },
      button: {
        textTransform: 'none',
        letterSpacing: 0,
        fontWeight: 700
      }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            minHeight: 40
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none'
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 700
          }
        }
      }
    }
  });

export const ColorModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<PaletteMode>(
    (localStorage.getItem('albis_color_mode') as PaletteMode | null) ?? 'light'
  );

  const value = useMemo(
    () => ({
      mode,
      toggleMode: () => {
        setMode((current) => {
          const next = current === 'light' ? 'dark' : 'light';
          localStorage.setItem('albis_color_mode', next);
          return next;
        });
      }
    }),
    [mode]
  );

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export const useColorMode = () => {
  const value = useContext(ColorModeContext);

  if (!value) {
    throw new Error('useColorMode must be used inside ColorModeProvider');
  }

  return value;
};
