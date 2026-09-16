import { ArrowBack, Delete, Download } from '@mui/icons-material';
import {
  Box,
  Card,
  Container,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import axios from 'axios';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getResourse } from 'src/lib/actions';
import { format } from 'date-fns';
import { Scrollbar } from 'src/components/scrollbar';

const Page = ({ screenshots, screenId }) => {
  const router = useRouter();
  const [list, setList] = useState(screenshots);

  const handleDelete = async (reference) => {
    if (!window.confirm('Are you sure you want to delete this screenshot?')) return;

    try {
      const { status } = await axios.delete('/api/admin/screens/screenshot/delete', {
        data: { reference },
      });
      if (status === 200) {
        toast.success('Screenshot deleted');
        setList((prev) => prev.filter((item) => item.reference !== reference));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete screenshot');
    }
  };

  const handleDownload = async (reference) => {
    const toastId = toast.loading('Downloading screenshot...');
    try {
      const response = await axios.get(
        `/api/admin/screens/screenshot/image?reference=${reference}`,
        {
          responseType: 'blob',
        }
      );

      const blobUrl = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `screenshot_${reference}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      toast.success('Download complete', { id: toastId });
    } catch (err) {
      toast.error('Failed to download screenshot', { id: toastId });
    }
  };

  return (
    <>
      <Head>
        <title>Screen Screenshots | Dalukwa Admin</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={2}>
                <IconButton onClick={() => router.push(`/campaign/campaign-schedule/${screenId}`)}>
                  <ArrowBack />
                </IconButton>
                <Typography variant="h4">Screenshot History</Typography>
              </Stack>
            </Stack>

            {list.length === 0 ? (
              <Box textAlign="center" py={5}>
                <Typography color="text.secondary">
                  No screenshots found for this screen.
                </Typography>
              </Box>
            ) : (
              <Card>
                <Scrollbar>
                  <Box sx={{ minWidth: 800 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Captured At</TableCell>
                          <TableCell>Campaigns</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {list.map((item) => (
                          <TableRow hover key={item.reference}>
                            <TableCell>
                              {item.capturedAt
                                ? format(new Date(item.capturedAt), 'dd MMM yyyy, HH:mm:ss')
                                : 'Unknown'}
                            </TableCell>
                            <TableCell>
                              {item.campaigns?.length > 0 ? item.campaigns.join(', ') : 'None'}
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                <IconButton
                                  color="primary"
                                  onClick={() => handleDownload(item.reference)}
                                >
                                  <Download />
                                </IconButton>
                                <IconButton
                                  color="error"
                                  onClick={() => handleDelete(item.reference)}
                                >
                                  <Delete />
                                </IconButton>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </Scrollbar>
              </Card>
            )}
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => (
  <ProtectDashboard>
    <DashboardLayout>{page}</DashboardLayout>
  </ProtectDashboard>
);

export const getServerSideProps = async (ctx) => {
  const { screen_id } = ctx.params;

  let screenshots = [];
  try {
    const res = await getResourse(ctx.req, `/screen/screenshot/list?screenRef=${screen_id}`);
    if (res.status) {
      screenshots = res.data?.list || [];
    }
  } catch (err) {
    console.error('Failed to fetch screenshots', err.message);
  }

  return {
    props: {
      screenId: screen_id,
      screenshots,
    },
  };
};

export default Page;
