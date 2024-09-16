import { Box, Divider, MenuItem, MenuList, Popover, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from 'src/hooks/use-auth';

export const AccountPopover = (props) => {
  const { anchorEl, onClose, open } = props;
  const router = useRouter();
  const { signOut, user } = useAuth();

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
    onClose?.();
  }, [onClose, signOut, router]);

  const goToResetPassword = () => router.push('/reset-password');
  const { first_name, last_name } = user || {};

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: 'left',
        vertical: 'bottom',
      }}
      onClose={onClose}
      open={open}
      PaperProps={{ sx: { width: 200 } }}
    >
      <Box
        sx={{
          py: 1.5,
          px: 2,
        }}
      >
        <Typography variant="overline">Account</Typography>
        <Typography color="text.secondary" variant="body2">
          {first_name} {last_name}
        </Typography>
      </Box>
      <Divider />
      <MenuList
        disablePadding
        dense
        sx={{
          p: '8px',
          '& > *': {
            borderRadius: 1,
          },
        }}
      >
        <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
        <MenuItem onClick={goToResetPassword}>Reset Password</MenuItem>
      </MenuList>
    </Popover>
  );
};

AccountPopover.propTypes = {
  anchorEl: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool.isRequired,
};
