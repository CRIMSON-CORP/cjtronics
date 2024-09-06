import { Box, Divider, Drawer, Stack, useMediaQuery } from '@mui/material';
import Image from 'next/image';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import PropTypes from 'prop-types';
import { useAuth } from 'src/hooks/use-auth';
import { items } from './config';
import { SideNavItem } from './side-nav-item';
import SideNavDropList from './SideNavDropList';

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
      <Box sx={{ px: 3 }}>
        <Box
          component={NextLink}
          href="/"
          sx={{
            display: 'inline-flex',
          }}
        >
          <Image src="/assets/logo-cjtronics.png" alt="Logo" width="200" height="60" />
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
          {items.map((item, index) => {
            if (item.type === 'drop-down') {
              return (
                <SideNavDropList
                  key={item.title}
                  links={item.links}
                  title={item.title}
                  icon={item.icon}
                  active={item.matchers?.includes(pathname.split('/')[1])}
                />
              );
            }
            return (
              <SideNavItem
                active={
                  item.matchers?.includes(pathname.split('/')[1]) ||
                  item.path.includes(pathname.split('/')[1] || ' ') ||
                  (pathname === '/' && index === 0)
                }
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
