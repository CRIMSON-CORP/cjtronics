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
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { usePopover } from 'src/hooks/use-popover';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getResourse } from 'src/lib/actions';

const Page = ({ campaign }) => {
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
                      <Actions reference={campaign.reference} />
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
          controls={false}
          src={file.uploadFile}
          alt={file.uploadURL}
          style={{ objectFit: 'contain', width: '100%', height: '100%', display: 'block' }}
        />
      ) : file.uploadType === 'html' ? (
        <Iframe
          content={file.uploadFile}
          styles={{ width: '100%', height: '100%', display: 'block' }}
        />
      ) : null}
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
        <ListItemText primary="Campaign Name" secondary={campaign.name} />
        <ListItemText
          primary="Campaign Created At"
          secondary={formatter.format(new Date(campaign.createdAt))}
        />
        <ListItemText primary="Provider" secondary={campaign.organizationName} />
        <ListItemText
          primary="Starts at"
          secondary={formatter.format(new Date(`${campaign.startAt} ${campaign.playFrom}`))}
        />
        <ListItemText
          primary="Ends at"
          secondary={formatter.format(new Date(`${campaign.endAt} ${campaign.playTo}`))}
        />
        <ListItemText primary="Play Duration" secondary={campaign.playDuration} />
        <ListItemText
          primary="Play Days"
          disableTypography
          secondary={
            <Stack spacing={1} direction="row" flexWrap="wrap">
              {campaign.playDays.split(',').map((day) => (
                <Chip label={day} key={day} sx={{ textTransform: 'capitalize' }} />
              ))}
            </Stack>
          }
        />
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
      </MenuList>
    </Stack>
  );
}

const colorStatusMap = {
  pending: 'warning',
  approved: 'success',
  declined: 'error',
};

function Actions({ reference }) {
  const { push } = useRouter();
  const [selectedAction, setSelectedAction] = useState(null);
  const [requestProcessing, setRequestProcessing] = useState(false);
  const handleOpen = (action) => () => {
    setSelectedAction(action);
  };
  const handleClose = () => {
    setSelectedAction(null);
  };

  const handleAction = (event) => {
    const formData = new FormData(event.target);
    const reason = formData.get('reason');
    if (selectedAction === 'decline' && !reason) {
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
            selectedAction === 'approve' ? 'Approving' : 'Declining'
          } Campaign, Hold on...`,
          success: (response) => {
            push('/external-organizations/external-campaigns');
            return response.data.message;
          },
          error: 'Failed to approve Campaign, Please try again',
        }
      );
    } catch (error) {}
    setRequestProcessing(true);
  };

  return (
    <>
      <Stack direction="row" spacing={1}>
        <Button color="success" variant="contained" onClick={handleOpen('approve')}>
          Approve
        </Button>
        <Button color="error" variant="contained" onClick={handleOpen('decline')}>
          Decline
        </Button>
      </Stack>
      <Dialog
        open={selectedAction !== null}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: handleAction,
        }}
      >
        <DialogTitle>{selectedAction === 'approve' ? 'Approve' : 'Decline'} Campaign?</DialogTitle>
        {selectedAction === 'decline' && (
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
            color={selectedAction === 'approve' ? 'success' : 'error'}
            startIcon={requestProcessing && <CircularProgress />}
          >
            Yes, {selectedAction === 'approve' ? 'Approve' : 'Decline'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
