import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';

function ConfirmAction({
  children,
  action,
  title,
  proceedText,
  dissmissText,
  content,
  color,
  buttonProps,
  trigger,
}) {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [requestProcessing, setRequestProcessing] = useState(false);

  const openConfirmModal = () => {
    setConfirmModalOpen(true);
  };
  const closeConfirmModal = () => {
    setConfirmModalOpen(false);
  };

  const handleAction = async () => {
    try {
      setRequestProcessing(true);
      await action();
      setConfirmModalOpen(false);
    } catch (error) {
    } finally {
      setRequestProcessing(false);
    }
  };

  return (
    <>
      {trigger ? (
        <Box onClick={openConfirmModal}>{trigger}</Box>
      ) : (
        <Button variant="contained" color={color} onClick={openConfirmModal} {...buttonProps}>
          {children}
        </Button>
      )}
      <Dialog
        sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
        maxWidth="xs"
        open={confirmModalOpen}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5">{title}</Typography>
            <IconButton disabled={requestProcessing} onClick={closeConfirmModal}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText>{content}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={requestProcessing} autoFocus onClick={closeConfirmModal}>
            {dissmissText || 'Cancel'}
          </Button>
          <Button
            variant="contained"
            onClick={handleAction}
            startIcon={requestProcessing && <CircularProgress sx={{ color: 'white' }} size={16} />}
            color={color}
            disabled={requestProcessing}
          >
            {proceedText || 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ConfirmAction;
