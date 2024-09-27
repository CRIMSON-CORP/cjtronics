import { Logout } from '@mui/icons-material';
import { Box, ButtonBase, Divider, Drawer, Stack, useMediaQuery } from '@mui/material';
import Image from 'next/image';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from 'src/hooks/use-auth';
import { items } from './config';
import { SideNavItem } from './side-nav-item';
import SideNavDropList from './SideNavDropList';

export const SideNav = (props) => {
  const { open, onClose } = props;
  const pathname = usePathname();
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const { user, logout } = useAuth();
  const userAccountType = user?.account_type;

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'neutral.50',
        py: 3,
        gap: 2,
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
          <Image
            src="/assets/logo-cjtronics.png"
            alt="Logo"
            width="200"
            height="60"
            priority
            style={{ width: '100%', height: 'auto' }}
          />
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'neutral.50' }} />
      <Box
        component="nav"
        sx={{
          flexGrow: 1,
          px: 2,
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
            if (item.roles && !item.roles.includes(userAccountType)) {
              return null;
            }
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
          <LogoutButton />
        </Stack>
      </Box>
    </Box>
  );

  if (lgUp) {
    return (
      <Drawer
        anchor="left"
        open
        PaperProps={{
          sx: {
            backgroundColor: 'neutral.50',
            color: 'neutral.800',
            width: 305,
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
          backgroundColor: 'neutral.50',
          color: 'neutral.800',
          width: 305,
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

function LogoutButton() {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = useCallback(async () => {
    try {
      await toast.promise(signOut(), {
        loading: 'Signing out',
        success: () => {
          router.push('/auth/login');
          return 'Sign out successfull';
        },
        error: (error) => {
          if (error.response.data.message === 'Sorry, you are not logged in') {
            router.push('/auth/login');
          }
          return error?.response?.data?.message ?? error.message;
        },
      });
    } catch (erro) {}
  }, [signOut, router]);
  return (
    <li>
      <ButtonBase
        sx={{
          alignItems: 'center',
          borderRadius: 1,
          display: 'flex',
          justifyContent: 'flex-start',
          pl: '16px',
          pr: '16px',
          py: '6px',
          textAlign: 'left',
          width: '100%',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          },
        }}
        onClick={handleSignOut}
      >
        <Box
          component="span"
          sx={{
            alignItems: 'center',
            color: 'neutral.500',
            display: 'inline-flex',
            justifyContent: 'center',
            mr: 2,
          }}
        >
          <Logout />
        </Box>
        <Box
          component="span"
          sx={{
            color: 'neutral.500',
            flexGrow: 1,
            fontFamily: (theme) => theme.typography.fontFamily,
            fontSize: 14,
            fontWeight: 600,
            lineHeight: '24px',
            whiteSpace: 'nowrap',
          }}
        >
          Logout
        </Box>
      </ButtonBase>
    </li>
  );
}
