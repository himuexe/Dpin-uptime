import { createTheme } from '@mui/material/styles';

// Color palette
const colors = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#ffffff',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
  },
  background: {
    default: '#f5f7fa',
    paper: '#ffffff',
    dark: '#1c2536',
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

// Create theme
const theme = createTheme({
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    error: colors.error,
    warning: colors.warning,
    info: colors.info,
    background: colors.background,
    grey: colors.grey,
    text: {
      primary: colors.grey[900],
      secondary: colors.grey[600],
      disabled: colors.grey[400],
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.2,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.2,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.2,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.2,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 500,
      fontSize: '0.875rem',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.1),0px 1px 1px 0px rgba(0,0,0,0.07),0px 1px 3px 0px rgba(0,0,0,0.06)',
    '0px 3px 3px -2px rgba(0,0,0,0.1),0px 3px 4px 0px rgba(0,0,0,0.07),0px 1px 8px 0px rgba(0,0,0,0.06)',
    '0px 4px 6px -4px rgba(0,0,0,0.1),0px 6px 8px 0px rgba(0,0,0,0.07),0px 2px 16px 0px rgba(0,0,0,0.06)',
    '0px 6px 7px -4px rgba(0,0,0,0.1),0px 11px 15px 0px rgba(0,0,0,0.07),0px 4px 20px 0px rgba(0,0,0,0.06)',
    '0px 8px 10px -5px rgba(0,0,0,0.1),0px 16px 24px 0px rgba(0,0,0,0.07),0px 6px 30px 0px rgba(0,0,0,0.06)',
    '0px 9px 12px -6px rgba(0,0,0,0.1),0px 19px 29px 0px rgba(0,0,0,0.07),0px 7px 36px 0px rgba(0,0,0,0.06)',
    '0px 10px 13px -6px rgba(0,0,0,0.1),0px 20px 31px 0px rgba(0,0,0,0.07),0px 8px 38px 0px rgba(0,0,0,0.06)',
    '0px 10px 14px -6px rgba(0,0,0,0.1),0px 21px 33px 0px rgba(0,0,0,0.07),0px 8px 40px 0px rgba(0,0,0,0.06)',
    '0px 11px 15px -7px rgba(0,0,0,0.1),0px 24px 38px 0px rgba(0,0,0,0.07),0px 9px 46px 0px rgba(0,0,0,0.06)',
    '0px 11px 16px -7px rgba(0,0,0,0.1),0px 25px 40px 0px rgba(0,0,0,0.07),0px 10px 48px 0px rgba(0,0,0,0.06)',
    '0px 12px 17px -7px rgba(0,0,0,0.1),0px 26px 42px 0px rgba(0,0,0,0.07),0px 10px 50px 0px rgba(0,0,0,0.06)',
    '0px 12px 18px -8px rgba(0,0,0,0.1),0px 28px 45px 0px rgba(0,0,0,0.07),0px 11px 52px 0px rgba(0,0,0,0.06)',
    '0px 13px 19px -8px rgba(0,0,0,0.1),0px 29px 48px 0px rgba(0,0,0,0.07),0px 12px 54px 0px rgba(0,0,0,0.06)',
    '0px 13px 20px -8px rgba(0,0,0,0.1),0px 30px 49px 0px rgba(0,0,0,0.07),0px 12px 56px 0px rgba(0,0,0,0.06)',
    '0px 14px 21px -9px rgba(0,0,0,0.1),0px 32px 52px 0px rgba(0,0,0,0.07),0px 13px 58px 0px rgba(0,0,0,0.06)',
    '0px 14px 22px -9px rgba(0,0,0,0.1),0px 33px 55px 0px rgba(0,0,0,0.07),0px 14px 60px 0px rgba(0,0,0,0.06)',
    '0px 15px 23px -9px rgba(0,0,0,0.1),0px 35px 57px 0px rgba(0,0,0,0.07),0px 14px 62px 0px rgba(0,0,0,0.06)',
    '0px 15px 24px -10px rgba(0,0,0,0.1),0px 36px 59px 0px rgba(0,0,0,0.07),0px 15px 64px 0px rgba(0,0,0,0.06)',
    '0px 16px 25px -10px rgba(0,0,0,0.1),0px 38px 63px 0px rgba(0,0,0,0.07),0px 16px 66px 0px rgba(0,0,0,0.06)',
    '0px 16px 26px -10px rgba(0,0,0,0.1),0px 39px 65px 0px rgba(0,0,0,0.07),0px 16px 68px 0px rgba(0,0,0,0.06)',
    '0px 17px 27px -11px rgba(0,0,0,0.1),0px 42px 68px 0px rgba(0,0,0,0.07),0px 17px 70px 0px rgba(0,0,0,0.06)',
    '0px 17px 28px -11px rgba(0,0,0,0.1),0px 43px 70px 0px rgba(0,0,0,0.07),0px 18px 72px 0px rgba(0,0,0,0.06)',
    '0px 18px 29px -11px rgba(0,0,0,0.1),0px 45px 73px 0px rgba(0,0,0,0.07),0px 18px 74px 0px rgba(0,0,0,0.06)',
    '0px 18px 30px -12px rgba(0,0,0,0.1),0px 46px 75px 0px rgba(0,0,0,0.07),0px 19px 76px 0px rgba(0,0,0,0.06)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 10px rgba(0, 0, 0, 0.08)',
          backdropFilter: 'blur(8px)',
        },
        colorDefault: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
        }
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          padding: '16px',
        },
        head: {
          fontWeight: 600,
          backgroundColor: colors.grey[50],
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            color: colors.grey[800],
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.MuiChip-colorPrimary': {
            backgroundColor: colors.primary.light + '20',
            color: colors.primary.dark,
          },
          '&.MuiChip-colorSecondary': {
            backgroundColor: colors.secondary.light + '20',
            color: colors.secondary.dark,
          },
          '&.MuiChip-colorSuccess': {
            backgroundColor: colors.success.light + '20',
            color: colors.success.dark,
          },
          '&.MuiChip-colorError': {
            backgroundColor: colors.error.light + '20',
            color: colors.error.dark,
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: colors.warning.light + '20',
            color: colors.warning.dark,
          },
          '&.MuiChip-colorInfo': {
            backgroundColor: colors.info.light + '20',
            color: colors.info.dark,
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: colors.grey[200],
        },
      },
    },
  },
});

export default theme; 