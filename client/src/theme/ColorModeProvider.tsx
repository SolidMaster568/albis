import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { alpha, ThemeProvider, createTheme, type PaletteMode } from '@mui/material/styles';
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
        main: '#4F46E5',
        dark: '#3730A3',
        light: '#EEF2FF'
      },
      secondary: {
        main: '#7C3AED',
        dark: '#5B21B6',
        light: '#F3E8FF'
      },
      background: {
        default: mode === 'light' ? '#F8FAFC' : '#0B1220',
        paper: mode === 'light' ? '#FFFFFF' : '#111827'
      },
      text: {
        primary: mode === 'light' ? '#0F172A' : '#F8FAFC',
        secondary: mode === 'light' ? '#64748B' : '#CBD5E1'
      },
      divider: mode === 'light' ? '#E2E8F0' : '#243247',
      info: {
        main: '#0891B2'
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
      borderRadius: 8
    },
    typography: {
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: { letterSpacing: 0 },
      h2: { letterSpacing: 0 },
      h3: { letterSpacing: 0 },
      h6: { letterSpacing: 0 },
      button: {
        textTransform: 'none',
        letterSpacing: 0,
        fontWeight: 700
      },
      h4: {
        fontSize: '2rem',
        lineHeight: 1.18,
        letterSpacing: 0
      },
      h5: {
        lineHeight: 1.25,
        letterSpacing: 0
      },
      body2: {
        lineHeight: 1.55
      }
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background:
              mode === 'light'
                ? 'radial-gradient(circle at top left, rgba(79, 70, 229, 0.05), transparent 30%), #F8FAFC'
                : 'radial-gradient(circle at top left, rgba(79, 70, 229, 0.16), transparent 28%), #0B1220'
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            minHeight: 40,
            boxShadow: 'none'
          },
          contained: {
            '&:hover': {
              boxShadow: 'none'
            }
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderColor: mode === 'light' ? '#E2E8F0' : '#243247',
            boxShadow:
              mode === 'light'
                ? '0 1px 2px rgba(15, 23, 42, 0.04)'
                : '0 1px 2px rgba(0, 0, 0, 0.18)'
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none'
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor:
              mode === 'light' ? alpha('#FFFFFF', 0.86) : alpha('#111827', 0.86),
            backdropFilter: 'blur(16px)'
          }
        }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#0F172A'
          }
        }
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8
          }
        }
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            borderColor: mode === 'light' ? '#E2E8F0' : '#243247',
            fontWeight: 700
          }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#111827'
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
