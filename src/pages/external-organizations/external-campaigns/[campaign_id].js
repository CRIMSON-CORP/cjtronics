import { ContentCopy, Download, MoreVert } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Unstable_Grid2 as Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { usePopover } from 'src/hooks/use-popover';
import useToggle from 'src/hooks/useToggle';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getResourse } from 'src/lib/actions';

const Page = ({ campaign }) => {
  console.log(campaign);

  return (
    <>
      <Head>
        <title>External Campaign | Devias Kit</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Typography variant="h5">{campaign.name}</Typography>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid xs={12} md={6}>
                    <Stack spacing={2}>
                      <Actions
                        isAcknowledged={campaign.isConfirmed}
                        status={campaign.status}
                        reference={campaign.reference}
                      />
                      <FilesDisplay files={campaign.uploads} />
                    </Stack>
                  </Grid>
                  <Grid xs={12} md={6}>
                    <CampaignDetails campaign={campaign} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

export const getServerSideProps = ProtectDashboard(async (ctx) => {
  const params = {
    ...ctx.query,
    page: ctx.query.page || 1,
    size: ctx.query.size || 25,
  };
  try {
    const campaign = await getResourse(
      ctx.req,
      `/external/campaign/${ctx.query.campaign_id}`,
      params
    );
    return {
      props: { campaign },
    };
  } catch (error) {
    console.log(error);

    if (error?.response?.status === 401) {
      return {
        redirect: {
          destination: '/auth/login?auth=false',
          permanent: false,
        },
      };
    }

    return {
      notFound: true,
    };
  }
});

function FilesDisplay({ files }) {
  return (
    <Stack direction="row" alignItems="stretch" spacing={1} overflow="auto">
      {files.map((file) => (
        <File file={file} key={file.reference} />
      ))}
    </Stack>
  );
}

function File({ file }) {
  const { anchorRef, handleClose, handleOpen, open } = usePopover();
  async function handleDownload() {
    try {
      const response = await fetch(file.uploadFile);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', file.uploadURL);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      handleClose();
    } catch (error) {
      toast.error(error.message);
    }
  }

  function copyUrl() {
    try {
      navigator.clipboard.writeText(file.uploadFile);
      toast.success('Url copied to clipboard');
      handleClose();
    } catch (error) {
      toast.error('Failed to copy url');
    }
  }

  return (
    <Box width="90%" flex="none" position="relative">
      {file.uploadType === 'image' ? (
        <Image
          src={file.uploadFile}
          alt={file.uploadURL}
          width={500}
          height={400}
          style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
        />
      ) : file.uploadType === 'video' ? (
        <video
          loop
          controls
          src={file.uploadFile}
          alt={file.uploadURL}
          style={{
            objectFit: 'contain',
            width: '100%',
            height: '100%',
            display: 'block',
            backgroundColor: 'black',
          }}
        />
      ) : file.uploadType === 'html' ? (
        <Iframe
          content={file.uploadFile}
          styles={{ width: '100%', height: '100%', display: 'block' }}
        />
      ) : null}
      <Box position="absolute" right={5} top={5}>
        <IconButton
          id="options-button"
          aria-controls={open ? 'options-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleOpen}
          ref={anchorRef}
        >
          <MoreVert sx={{ color: 'white' }} />
        </IconButton>
      </Box>
      <Menu
        open={open}
        onClose={handleClose}
        id="options-button"
        anchorEl={anchorRef.current}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuList>
          <MenuItem onClick={handleDownload}>
            <ListItemIcon>
              <Download fontSize="small" />
            </ListItemIcon>
            <ListItemText>Download</ListItemText>
          </MenuItem>
          <MenuItem onClick={copyUrl}>
            <ListItemIcon>
              <ContentCopy fontSize="small" />
            </ListItemIcon>
            <ListItemText>Copy URL</ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
}

const formatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'short',
  timeStyle: 'short',
});
function CampaignDetails({ campaign }) {
  return (
    <Stack>
      <Typography variant="h6">Campaign details</Typography>
      <MenuList>
        {campaign.name && <ListItemText primary="Campaign Name" secondary={campaign.name} />}
        {campaign.createdAt && (
          <ListItemText
            primary="Campaign Created At"
            secondary={formatter.format(new Date(campaign.createdAt))}
          />
        )}
        {campaign.organizationName && (
          <ListItemText primary="Provider" secondary={campaign.organizationName} />
        )}
        {campaign.startAt && (
          <ListItemText
            primary="Starts at"
            secondary={formatter.format(new Date(`${campaign.startAt} ${campaign.playFrom}`))}
          />
        )}
        {campaign.endAt && (
          <ListItemText
            primary="Ends at"
            secondary={formatter.format(new Date(`${campaign.endAt} ${campaign.playTo}`))}
          />
        )}
        {campaign.playDuration && (
          <ListItemText primary="Play Duration" secondary={campaign.playDuration} />
        )}
        {campaign.playDays && (
          <ListItemText
            primary="Play Days"
            disableTypography
            secondary={
              <Stack spacing={1} direction="row" flexWrap="wrap">
                {campaign.playDays?.split(',').map((day) => (
                  <Chip label={day} key={day} sx={{ textTransform: 'capitalize' }} />
                ))}
              </Stack>
            }
          />
        )}
        {campaign.status && (
          <ListItemText
            primary="Campaign Status"
            disableTypography
            secondary={
              <Box mt={0.5}>
                <Chip
                  label={campaign.status}
                  color={colorStatusMap[campaign.status]}
                  sx={{
                    textTransform: 'capitalize',
                  }}
                />
              </Box>
            }
          />
        )}
      </MenuList>
    </Stack>
  );
}

const colorStatusMap = {
  pending: 'warning',
  approved: 'success',
  declined: 'error',
};

function Actions({ reference, status, isAcknowledged }) {
  const { replace, asPath } = useRouter();
  const { state, open, close } = useToggle();
  const { state: acknowledgeState, open: openAcknowledge, close: closeAcknowledge } = useToggle();
  const [selectedAction, setSelectedAction] = useState(null);
  const [requestProcessing, setRequestProcessing] = useState(false);
  const handleOpen = (action) => () => {
    setSelectedAction(action);
    open();
  };
  const handleClose = () => {
    close();
  };

  const handleAction = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const reason = formData.get('reason');
    if (selectedAction === 'declined' && !reason) {
      toast.error('Please enter a reason for decline');
      return;
    }
    setRequestProcessing(true);
    try {
      toast.promise(
        axios.post('/api/admin/external/set-campaign-status', {
          campaign_id: reference,
          reason,
          status: selectedAction,
        }),
        {
          loading: `${
            selectedAction === 'approved' ? 'Approving' : 'Declining'
          } Campaign, Hold on...`,
          success: (response) => {
            replace(asPath);
            handleClose();
            return response.data.message;
          },
          error: 'Failed to approve Campaign, Please try again',
        }
      );
    } catch (error) {
    } finally {
      setRequestProcessing(false);
    }
  };

  const acknowledgeCampaing = () => {
    setRequestProcessing(true);
    try {
      toast.promise(
        axios.post('/api/admin/external/set-campaign-acknowledge', {
          campaign_id: reference,
        }),
        {
          loading: 'Okay, Hold on...',
          success: (response) => {
            replace(asPath);
            closeAcknowledge();
            return response.data.message;
          },
          error: 'Failed to Acknowledge Campaign, Please try again',
        }
      );
    } catch (error) {
    } finally {
      setRequestProcessing(false);
    }
  };

  return (
    <>
      <Stack direction="row" spacing={1}>
        {status === 'pending' ? (
          <>
            <Button color="success" variant="contained" onClick={handleOpen('approved')}>
              Approve
            </Button>
            <Button color="error" variant="contained" onClick={handleOpen('declined')}>
              Decline
            </Button>
          </>
        ) : isAcknowledged ? (
          <Button color="primary" variant="contained" disabled>
            Acknowledged
          </Button>
        ) : (
          <Button color="primary" variant="contained" onClick={openAcknowledge}>
            Acknowledge
          </Button>
        )}
      </Stack>
      <Dialog
        open={state}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: handleAction,
        }}
      >
        <DialogTitle>{selectedAction === 'approved' ? 'Approve' : 'Decline'} Campaign?</DialogTitle>
        {selectedAction === 'declined' && (
          <DialogContent>
            <TextField
              autoFocus
              required
              margin="dense"
              id="reason"
              name="reason"
              label="Reason"
              type="text"
              fullWidth
              multiline
              rows={5}
              variant="outlined"
            />
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={handleClose}>No no</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={requestProcessing}
            color={selectedAction === 'approved' ? 'success' : 'error'}
            startIcon={requestProcessing && <CircularProgress />}
          >
            Yes, {selectedAction === 'approved' ? 'Approve' : 'Decline'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={acknowledgeState} onClose={closeAcknowledge}>
        <DialogTitle>Acknowledge Campaign?</DialogTitle>
        <DialogActions>
          <Button onClick={closeAcknowledge}>No no</Button>
          <Button
            variant="contained"
            onClick={acknowledgeCampaing}
            disabled={requestProcessing}
            startIcon={requestProcessing && <CircularProgress />}
          >
            Yes, Acknowledge
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
