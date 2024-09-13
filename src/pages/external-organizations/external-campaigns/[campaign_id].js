import { ContentCopy, Download, MoreVert } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Unstable_Grid2 as Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Stack,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
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
                    <FilesDisplay files={campaign.uploads} />
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

  function handleDownload() {
    window.open(file.uploadFile);
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
          alt={file.uploadName}
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
          secondary={
            <Stack spacing={1} direction="row">
              {campaign.playDays.split(',').map((day) => (
                <Chip label={day} key={day} sx={{ textTransform: 'capitalize' }} />
              ))}
            </Stack>
          }
        />
        <ListItemText
          primary="Campaign Status"
          secondary={<Chip label={campaign.status} color={colorStatusMap[campaign.status]} />}
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
