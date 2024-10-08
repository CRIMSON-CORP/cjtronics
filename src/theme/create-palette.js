import { common } from '@mui/material/colors';
import { alpha } from '@mui/material/styles';
import { error, indigo, info, neutral, primary, success, warning } from './colors';

export function createPalette() {
  return {
    action: {
      active: neutral[500],
      disabled: alpha(neutral[900], 0.6),
      disabledBackground: alpha(neutral[300], 0.8),
      focus: alpha(neutral[900], 0.16),
      hover: alpha(neutral[900], 0.04),
      selected: alpha(neutral[900], 0.12),
    },
    background: {
      default: common.white,
      paper: common.white,
    },
    common,
    divider: '#F2F4F7',
    error,
    info,
    mode: 'light',
    neutral,
    primary: indigo,
    success,
    primary,
    text: {
      primary: neutral[900],
      secondary: neutral[500],
      disabled: alpha(neutral[900], 0.38),
    },
    warning,
  };
}
