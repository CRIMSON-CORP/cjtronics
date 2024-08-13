import { Alert, Snackbar as MUISnackBar } from '@mui/material';

function SnackBar({ status, setStatus, message, open, handleClose }) {
  const _handleClose = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    handleClose && handleClose();
    setStatus(null);
  };
  return (
    <MUISnackBar open={open} autoHideDuration={6000} onClose={_handleClose}>
      <div>
        {status === 'success' && (
          <Alert onClose={_handleClose} severity="success" sx={{ width: '100%' }}>
            {message}
          </Alert>
        )}
        {status === 'error' && (
          <Alert onClose={_handleClose} severity="error" sx={{ width: '100%' }}>
            {message}
          </Alert>
        )}
      </div>
    </MUISnackBar>
  );
}

export default SnackBar;
