import { Box, Unstable_Grid2 as Grid } from '@mui/material';
import PropTypes from 'prop-types';

export const Layout = ({ children }) => (
  <Box
    component="main"
    sx={{
      display: 'flex',
      flex: '1 1 auto',
    }}
  >
    <Grid container sx={{ flex: '1 1 auto' }}>
      <Grid
        xs={12}
        lg={6}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <Box
          component="header"
          sx={{
            left: 0,
            p: 3,
            position: 'fixed',
            top: 0,
            width: '100%',
          }}
        ></Box>
        {children}
      </Grid>
      <Grid
        xs={12}
        lg={6}
        sx={{
          alignItems: 'center',
          background: 'radial-gradient(50% 50% at 50% 50%, #ffffff 0%, #ffffff 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
          '& > img': {
            maxWidth: '100%',
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          },
          '& img': {
            width: '100%',
          },
        }}
      >
        <img src="/assets/pattern.svg" alt="pattern background" />
        <Box sx={{ position: 'relative', flex: 1, width: '100%', maxWidth: 400 }}>
          <img src="/assets/logo-cjtronics.png" alt="logo" />
        </Box>
      </Grid>
    </Grid>
  </Box>
);
Layout.prototypes = {
  children: PropTypes.node,
};
