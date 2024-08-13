import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import PropTypes from 'prop-types';
import { Box, Divider, Drawer, Stack, useMediaQuery } from '@mui/material';
import { Logo } from 'src/components/logo';
import { items } from './config';
import { SideNavItem } from './side-nav-item';
import { useAuth } from 'src/hooks/use-auth';

export const SideNav = (props) => {
  const { open, onClose } = props;
  const pathname = usePathname();
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const { user } = useAuth();
  const userRoles = user?.user?.role?.meta || [];

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'neutral.400',
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box
          component={NextLink}
          href="/"
          sx={{
            display: 'inline-flex',
            height: 32,
            width: 32,
          }}
        >
          <Logo />
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'neutral.700' }} />
      <Box
        component="nav"
        sx={{
          flexGrow: 1,
          px: 2,
          py: 3,
        }}
      >
        <Stack
          component="ul"
          spacing={0.5}
          sx={{
            listStyle: 'none',
            p: 0,
            m: 0,
          }}
        >
          {items
            .filter(
              (item) =>
                userRoles.includes(item.page_access_permission) ||
                item.page_access_permission === undefined
            )
            .map((item, index) => {
              const active =
                item.path.includes(pathname.split('/')[1] || ' ') ||
                (pathname === '/' && index === 0);
              return (
                <SideNavItem
                  active={active}
                  disabled={item.disabled}
                  external={item.external}
                  icon={item.icon}
                  key={item.title}
                  path={item.path}
                  title={item.title}
                />
              );
            })}
        </Stack>
      </Box>
      <Divider sx={{ borderColor: 'neutral.700' }} />
    </Box>
  );

  if (lgUp) {
    return (
      <Drawer
        anchor="left"
        open
        PaperProps={{
          sx: {
            backgroundColor: 'neutral.800',
            color: 'common.white',
            width: 280,
          },
        }}
        variant="permanent"
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          backgroundColor: 'neutral.800',
          color: 'common.white',
          width: 280,
        },
      }}
      sx={{ zIndex: (theme) => theme.zIndex.appBar + 100 }}
      variant="temporary"
    >
      {content}
    </Drawer>
  );
};

SideNav.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
