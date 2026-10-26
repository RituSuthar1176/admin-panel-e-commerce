import type { Theme } from 'theme-ui';

const theme: Theme = {
  fonts: { body: 'Inter, Arial, sans-serif', heading: 'Inter, Arial, sans-serif' },
  colors: {
    text: '#1a1a1a',
    background: '#fbf7f3',
    primary: '#8b4533',
    muted: '#555555',
    error: '#d32f2f',
  },
  radii: { pill: 24, card: 28 },

  buttons: {
    primary: {
      width: '100%',
      py: 3,
      cursor: 'pointer',
      fontWeight: 600,
      color: 'white',
      borderRadius: 'pill',
      background: 'linear-gradient(90deg, #a65d4a, #8b4533)',
      '&:disabled': { opacity: 0.7, cursor: 'not-allowed' },
    },
  },

  forms: {
    input: {
      bg: 'white',
      px: 3,
      borderRadius: 'pill',
      borderColor: '#dcd5ce',
      '&:focus': { borderColor: 'primary', outline: 'none' },
    },
    label: { fontSize: 1, fontWeight: 500, mb: 1 },
  },
};

export default theme;