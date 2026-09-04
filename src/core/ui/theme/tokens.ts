export const themeTokens = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    full: '9999px',
  },
  shadow: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  },
  colors: {
    primary: {
      DEFAULT: '#2563eb', // blue-600
      hover: '#1d4ed8',   // blue-700
      light: '#eff6ff',   // blue-50
      dark: '#1e40af',    // blue-800
    },
    secondary: {
      DEFAULT: '#64748b', // slate-500
      hover: '#475569',   // slate-600
      light: '#f8fafc',   // slate-50
    },
    success: {
      DEFAULT: '#16a34a', // green-600
      light: '#f0fdf4',   // green-50
    },
    warning: {
      DEFAULT: '#d97706', // amber-600
      light: '#fffbeb',   // amber-50
    },
    danger: {
      DEFAULT: '#dc2626', // red-600
      light: '#fef2f2',   // red-50
    },
    surface: {
      DEFAULT: '#ffffff',
      subtle: '#f8fafc',  // slate-50
      muted: '#f1f5f9',   // slate-100
    },
    background: {
      DEFAULT: '#f8fafc', // slate-50
    },
    text: {
      primary: '#0f172a', // slate-900
      secondary: '#475569', // slate-600
      muted: '#94a3b8',   // slate-400
    },
    border: {
      DEFAULT: '#e2e8f0', // slate-200
      subtle: '#f1f5f9',  // slate-100
    }
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    heading: {
      fontSize: '20px',
      fontWeight: '700',
      lineHeight: '1.25',
    },
    subheading: {
      fontSize: '14px',
      fontWeight: '600',
      lineHeight: '1.4',
    },
    body: {
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '1.5',
    },
    caption: {
      fontSize: '12px',
      fontWeight: '500',
      lineHeight: '1.4',
    },
  },
  transitions: {
    default: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    tooltip: 1070,
  },
};

export type ThemeTokens = typeof themeTokens;
