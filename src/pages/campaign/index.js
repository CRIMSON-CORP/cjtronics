import { Close, DragIndicator, Replay, Upload } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useFormik } from 'formik';
import { nanoid } from 'nanoid';
import Head from 'next/head';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';
import ConfirmAction from 'src/components/ConfirmAction';
import Iframe from 'src/components/Iframe';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { useAuth } from 'src/hooks/use-auth';
import useToggle from 'src/hooks/useToggle';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getResourse } from 'src/lib/actions';
import * as Yup from 'yup';

const superAdminRef = process.env.NEXT_PUBLIC_SUPER_ADMIN_ORGANIZATION_REF;

const Page = ({ organizations, screens }) => {
  const { user } = useAuth();
  const defaultOrganizationReference = user?.organizationReference || '';
  const isSuperAdmin = defaultOrganizationReference === superAdminRef;

  const [adAccounts, setAdAccounts] = useState([]);
  const [fetchingAdAccounts, setFetchingAdAccounts] = useState(false);

  const formik = useFormik({
    initialValues: {
      organizationId: defaultOrganizationReference,
      screenId: '',
      adsAccountId: '',
      adFiles: [],
      submit: null,
    },
    validationSchema: Yup.object({
      ...(isSuperAdmin
        ? {}
        : { organizationId: Yup.string().required('Organization is required') }),
      screenId: Yup.string().max(255).required('Screen ID is required'),
      adsAccountId: Yup.string().max(255).required('Ad Account name is required'),
    }),
    onSubmit: async (values, helpers) => {
      try {
        await signIn(values.email, values.password);
        router.push(router.query.continueUrl ?? '/');
      } catch (err) {
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    },
  });

  const { screenId } = formik.values;
  const fetchAdAccounts = useCallback(async () => {
    setFetchingAdAccounts(true);
    try {
      toast.loading('Fetching Ad Accounts...');
      const response = await axios.get(`/api/admin/ad-account/get-by-screen?reference=${screenId}`);
      toast.dismiss();
      const { list } = response.data.data;
      if (list.length === 0) {
        toast.error('No Ad Accounts found for this screen');
        return;
      }
      setAdAccounts(response.data.data.list);
    } catch (error) {
      toast.error('Failed to fetch Ad accounts for this screen');
    }
    setFetchingAdAccounts(false);
  }, [screenId]);

  useEffect(() => {
    if (screenId) {
      fetchAdAccounts();
    }
  }, [screenId]);

  return (
    <>
      <Head>
        <title>Create Ad | Dalukwa Admin</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Card>
            <CardHeader title="Create Ad" />
            <CardContent>
              <form onSubmit={formik.handleSubmit}>
                <Stack spacing={3}>
                  <FormControl variant="outlined">
                    <InputLabel htmlFor="organization">Select Organization</InputLabel>
                    <Select
                      error={!!(formik.touched.organizationId && formik.errors.organizationId)}
                      fullWidth
                      label="Select Organization-"
                      name="organizationId"
                      id="organizationId"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.organizationId}
                      disabled={!isSuperAdmin}
                    >
                      {organizations.list.map((organization) => (
                        <MenuItem value={organization.reference} key={organization.reference}>
                          {organization.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {!!(formik.touched.organizationId && formik.errors.organizationId) && (
                      <FormHelperText sx={{ color: 'error.main' }}>
                        {formik.errors.organizationId}
                      </FormHelperText>
                    )}
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel id="screenId">Select Screen</InputLabel>
                    <Select
                      error={!!(formik.touched.screenId && formik.errors.screenId)}
                      fullWidth
                      id="screenId"
                      name="screenId"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.screenId}
                      label="Select Screen"
                    >
                      {screens.screen.map((screen) => (
                        <MenuItem value={screen.reference} key={screen.reference}>
                          {screen.screenName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl variant="outlined">
                    <InputLabel htmlFor="screen_id">Select Ad Account</InputLabel>
                    <Select
                      error={!!(formik.touched.adsAccountId && formik.errors.adsAccountId)}
                      fullWidth
                      label="Select Ad Account-"
                      name="adsAccountId"
                      id="adsAccountId"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.adsAccountId}
                      disabled={
                        !formik.values.screenId || adAccounts.length === 0 || fetchingAdAccounts
                      }
                      endAdornment={fetchingAdAccounts && <CircularProgress />}
                    >
                      {adAccounts.map((adAccount) => (
                        <MenuItem value={adAccount.reference} key={adAccount.reference}>
                          {adAccount.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {!!(formik.touched.adsAccountId && formik.errors.adsAccountId) && (
                      <FormHelperText sx={{ color: 'error.main' }}>
                        {formik.errors.adsAccountId}
                      </FormHelperText>
                    )}
                  </FormControl>
                  <AdFiles formik={formik} />
                  <UploadForm formik={formik} />
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

export const getServerSideProps = ProtectDashboard(async (ctx) => {
  try {
    const [organizations, screens] = await Promise.all([
      getResourse(ctx.req, '/organization'),
      getResourse(ctx.req, '/screen'),
    ]);
    return {
      props: { organizations, screens },
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

function AdFiles({ formik }) {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">Ad Files</Typography>
      <AddedFiles formik={formik} />
      <EmptyAdForm formik={formik} />
    </Stack>
  );
}

const visualyHiddenInputStyles = {
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
};

const videoStyle = {
  width: 40,
  height: 40,
};

function EmptyAdForm({ id, formik, fileType, fileName, ifrmContent, close }) {
  const [selectedAdFileType, setSelectedAdFileType] = useState(fileType || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState(fileName || '');
  const [fileObjectUrl, setFileObjectUrl] = useState('');
  const [iframeContent, setIframeContent] = useState(ifrmContent || '');

  const handleAdFileTypeSelect = (e) => {
    setSelectedAdFileType(e.target.value);
  };

  const handleFileSelectChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 2MB');
      return;
    }

    setSelectedFile(file);
    setFileObjectUrl(URL.createObjectURL(file));
  };

  const handleAdFileNameChange = (e) => {
    setSelectedFileName(e.target.value);
  };

  const handleIframeContentChange = (e) => {
    setIframeContent(e.target.value);
  };

  const addAdFile = () => {
    const existingAdFiles = [...formik.values.adFiles];
    const newAdFile = {
      name: selectedFileName,
      type: selectedAdFileType,
      file: iframeContent || selectedFile,
      iframeContent,
    };
    if (id) {
      const index = existingAdFiles.findIndex((adFile) => adFile.id === id);
      existingAdFiles[index] = {
        ...existingAdFiles[index],
        ...newAdFile,
        file: newAdFile.file || existingAdFiles[index].file,
      };
    } else {
      newAdFile.id = nanoid(5);
      existingAdFiles.push(newAdFile);
    }
    formik.setFieldValue('adFiles', existingAdFiles);
    close?.();

    setSelectedAdFileType('');
    setSelectedFile(null);
    setFileObjectUrl('');
    URL.revokeObjectURL(fileObjectUrl);
    setSelectedFileName('');
    setIframeContent('');
  };

  useEffect(() => {
    return () => {
      setSelectedFile(null);
      setFileObjectUrl('');
      URL.revokeObjectURL(fileObjectUrl);
      setSelectedFileName('');
      setIframeContent('');
    };
  }, [selectedAdFileType]);

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Add Ad File</Typography>
      <FormControl fullWidth>
        <InputLabel id="screenId">Select Ad Type</InputLabel>
        <Select
          fullWidth
          value={selectedAdFileType}
          label="Select Ad Type "
          onChange={handleAdFileTypeSelect}
        >
          <MenuItem value="image">Picture</MenuItem>
          <MenuItem value="video">Video</MenuItem>
          <MenuItem value="html">HTML Tags</MenuItem>
        </Select>
      </FormControl>
      {selectedAdFileType && (
        <Stack spacing={2} direction="row" sx={{ whiteSpace: 'nowrap' }}>
          {selectedFile ? (
            <Stack
              spacing={1}
              direction="row"
              border={1}
              p={0.5}
              borderColor={'grey.300'}
              borderRadius={1}
              alignItems="center"
            >
              {selectedAdFileType === 'image' && (
                <Image width={40} height={40} src={fileObjectUrl} alt="preview" />
              )}
              {selectedAdFileType === 'video' && (
                <video style={videoStyle} src={fileObjectUrl} alt="preview" />
              )}
              <Button
                component="label"
                role={undefined}
                variant="text"
                tabIndex={-1}
                startIcon={<Replay />}
              >
                Replace file
                <input
                  type="file"
                  style={visualyHiddenInputStyles}
                  onChange={handleFileSelectChange}
                  accept={selectedAdFileType === 'image' ? 'image/*' : 'video/*'}
                />
              </Button>
            </Stack>
          ) : selectedAdFileType === 'html' ? (
            <TextField
              fullWidth
              type="text"
              label="Iframe Content"
              value={iframeContent}
              onChange={handleIframeContentChange}
            />
          ) : (
            <Button
              fullWidth
              component="label"
              role={undefined}
              variant="contained"
              tabIndex={-1}
              startIcon={<Upload />}
            >
              Add {selectedAdFileType === 'image' ? 'Picture' : 'Video'} file
              <input
                type="file"
                style={visualyHiddenInputStyles}
                onChange={handleFileSelectChange}
                accept={selectedAdFileType === 'image' ? 'image/*' : 'video/*'}
              />
            </Button>
          )}
          <TextField
            fullWidth
            type="text"
            label="File name"
            value={selectedFileName}
            onChange={handleAdFileNameChange}
          />
        </Stack>
      )}
      {selectedAdFileType && (id ? true : selectedFile || iframeContent) && selectedFileName && (
        <Button fullWidth variant="contained" onClick={addAdFile}>
          {id ? 'Update Ad' : 'Add Ad'}
        </Button>
      )}
    </Stack>
  );
}

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

function AddedFiles({ formik }) {
  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = reorder(formik.values.adFiles, result.source.index, result.destination.index);

    formik.setFieldValue('adFiles', items);
  };
  return (
    formik.values.adFiles.length > 0 && (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="ad-files">
          {(provided, snapshot) => (
            <Stack {...provided.droppableProps} ref={provided.innerRef}>
              {formik.values.adFiles.map((file, index) => (
                <Draggable draggableId={file.id} index={index} key={file.id}>
                  {(_provided) => (
                    <Box
                      ref={_provided.innerRef}
                      {..._provided.draggableProps}
                      {..._provided.dragHandleProps}
                      sx={{
                        mt: 2,
                        userSelect: 'none',
                        ..._provided.draggableProps.style,
                      }}
                    >
                      <AddedFile
                        key={index}
                        id={file.id}
                        name={file.name}
                        type={file.type}
                        file={file.file}
                        formik={formik}
                        iframeContent={file.iframeContent}
                      />
                    </Box>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Stack>
          )}
        </Droppable>
      </DragDropContext>
    )
  );
}

function AddedFile({ id, name, type, file, iframeContent, formik }) {
  const fileObjectUrl = useMemo(
    () => (file instanceof File ? URL.createObjectURL(file) : null),
    [file]
  );

  const handleRemoveFile = () => {
    formik.setFieldValue(
      'adFiles',
      formik.values.adFiles.filter((f) => f.id !== id)
    );
    URL.revokeObjectURL(fileObjectUrl);
  };
  return (
    <Paper sx={{ p: 2 }} elevation={5}>
      <Stack
        spacing={1}
        direction="row"
        alignItems="center"
        flexWrap="wrap"
        justifyContent="space-between"
      >
        <Stack
          direction="row"
          alignItems="center"
          sx={{ overflowY: 'hidden', overflowX: 'auto' }}
          spacing={1}
        >
          <Box flex="none">
            {file && type === 'image' && (
              <Image width={40} height={40} src={fileObjectUrl} alt="preview" />
            )}
            {file && type === 'video' && (
              <video style={videoStyle} src={fileObjectUrl} alt="preview" />
            )}
            {type === 'html' && <Iframe content={iframeContent} styles={videoStyle} />}
          </Box>
          <Stack maxWidth="100%" overflow="auto">
            <Typography
              variant="h6"
              width="100%"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {name}
            </Typography>
            {['image', 'video'].includes(type) && (
              <Typography variant="subtitle1">{file && formatFileSize(file.size)}</Typography>
            )}
          </Stack>
        </Stack>
        <Stack
          spacing={0.5}
          alignItems="center"
          direction="row"
          alignSelf="flex-end"
          sx={{ ml: 'auto !important' }}
        >
          <EditFile fileId={id} formik={formik} />
          <ConfirmAction
            color="error"
            buttonProps={{ color: 'error', variant: 'text' }}
            content="Are you sure you want to remove this Ad?"
            proceedText="Yes, Remove"
            title="Remove Ad?"
            action={handleRemoveFile}
          >
            Remove
          </ConfirmAction>
          <DragIndicator />
        </Stack>
      </Stack>
    </Paper>
  );
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const modalStyles = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
};

const cardStyles = {
  maxWidth: 700,
  maxHeight: '85vh',
  overflowY: 'auto',
};
function EditFile({ formik, fileId }) {
  const { state, open, close } = useToggle(false);

  const { id, name, type, iframeContent } = useMemo(
    () => formik.values.adFiles.find((file) => file.id === fileId),
    [fileId]
  );

  return (
    <>
      <Button onClick={open}>Edit</Button>
      <Modal open={state} onClose={close}>
        <Box sx={modalStyles}>
          <Card sx={cardStyles}>
            <CardHeader
              title={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h5">Edit Ad File</Typography>
                  <IconButton onClick={close}>
                    <Close />
                  </IconButton>
                </Stack>
              }
            />
            <CardContent>
              <EmptyAdForm
                {...{
                  id,
                  formik,
                  fileType: type,
                  fileName: name,
                  ifrmContent: iframeContent,
                  close,
                }}
              />
            </CardContent>
          </Card>
        </Box>
      </Modal>
    </>
  );
}

const uploadButtonStyle = {
  isolation: 'isolate',
  overflow: 'hidden',
};

const progressSpanStyles = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: -1,
  background: 'rgba(0, 0, 0, 0.5)',
  left: 0,
  height: '100%',
  transition: 'width 0.3s ease-out',
};

function UploadForm({ formik }) {
  const [uploadProgress, setuploadProgress] = useState(0);
  const [requestProcessing, setRequestProcessing] = useState(false);
  const { user } = useAuth();

  console.log(process.env.BACKEND_DOMAIN);

  const hanldeUpload = () => {
    const formData = new FormData();
    const { organizationId, screenId, adsAccountId, adFiles } = formik.values;
    formData.append('organizationId', organizationId);
    formData.append('screenId', screenId);
    formData.append('adsAccountId', adsAccountId);

    adFiles.forEach((file) => {
      formData.append(`adsType[]`, file.type);
      formData.append(`adsUpload[]`, file.iframeContent || file.file);
      formData.append(`adsName[]`, file.name);
    });

    setRequestProcessing(true);

    toast.promise(
      axios.post(`${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/v1/ads/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          setuploadProgress((loaded / total) * 100);
        },
      }),
      {
        loading: 'Uploading Ads, Hang on...',
        success: (response) => {
          formik.resetForm();
          setuploadProgress(0);
          setRequestProcessing(false);
          return response.data.message || 'Ads uploaded successfully';
        },
        error: (err) => {
          setRequestProcessing(false);
          setuploadProgress(0);
          return err.response?.data?.message || err.message;
        },
      }
    );
  };

  return (
    <Button
      size="large"
      variant="contained"
      sx={uploadButtonStyle}
      onClick={hanldeUpload}
      endIcon={
        requestProcessing && <CircularProgress size={16} sx={{ color: 'rgba(17,25,39,0.6)' }} />
      }
      disabled={
        !(formik.isValid && formik.dirty) || requestProcessing || formik.values.adFiles.length === 0
      }
    >
      Submit
      <Box style={{ ...progressSpanStyles, width: `${uploadProgress}%` }}></Box>
    </Button>
  );
}
