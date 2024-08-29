import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
    } finally {
      setRequestProcessing(false);
    }
  };

  return (
    <>
      <Button variant="contained" color={color} onClick={openConfirmModal} {...buttonProps}>
        {children}
      </Button>
      <Dialog
        sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
        maxWidth="xs"
        open={confirmModalOpen}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent dividers>
          <DialogContentText>{content}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={closeConfirmModal}>
            {dissmissText || 'Cancel'}
          </Button>
          <Button
            variant="contained"
            onClick={handleAction}
            startIcon={requestProcessing && <CircularProgress sx={{ color: 'white' }} size={16} />}
            color={color}
          >
            {proceedText || 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ConfirmAction;
