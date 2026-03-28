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
import { useEffect, useMemo, useState } from 'react';
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
  const [loadingScreens, setLoadingScreens] = useState({});

  const fetchAdAccounts = async (screenId) => {
    if (!screenId) return;

    setLoadingScreens((prev) => ({ ...prev, [screenId]: true }));
    try {
      toast.loading(`Fetching Ad Accounts for screen...`);
      const response = await axios.get(`/api/admin/ad-account/get-by-screen?reference=${screenId}`);
      toast.dismiss();
      const { list } = response.data.data;
      if (list.length === 0) {
        toast.error('No Ad Accounts found for this screen');
      }
      setAdAccounts((prev) => [
        ...prev.filter((acc) => acc.screenReference !== screenId),
        ...list.map((acc) => ({
          ...acc,
          screenReference: screenId,
        })),
      ]);
    } catch (error) {
      toast.error('Failed to fetch Ad accounts for this screen');
    }
    setLoadingScreens((prev) => ({ ...prev, [screenId]: false }));
  };

  const formik = useFormik({
    initialValues: {
      organizationId: defaultOrganizationReference,
      screenEntries: [
        {
          id: nanoid(5),
          screenId: '',
          adsAccountId: '',
          adFiles: [],
        },
      ],
      submit: null,
    },
    validationSchema: Yup.object({
      ...(isSuperAdmin
        ? {}
        : { organizationId: Yup.string().required('Organization is required') }),
      screenEntries: Yup.array()
        .of(
          Yup.object({
            screenId: Yup.string().max(255).required('Screen ID is required'),
            adsAccountId: Yup.string().max(255).required('Ad Account name is required'),
            adFiles: Yup.array(),
          })
        )
        .min(1, 'At least one screen entry is required'),
    }),
  });

  // Remove the old effect and fetchAdAccounts definition

  return (
    <>
      <Head>
        <title>Create Ad | Cjtronics Admin</title>
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
                  {formik.values.screenEntries.map((entry, index) => (
                    <Stack key={entry.id} spacing={3} sx={{ position: 'relative', pt: 2 }}>
                      {index > 0 && (
                        <IconButton
                          sx={{ position: 'absolute', right: -8, top: -8 }}
                          onClick={() => {
                            const newEntries = [...formik.values.screenEntries];
                            newEntries.splice(index, 1);
                            formik.setFieldValue('screenEntries', newEntries);
                          }}
                        >
                          <Close />
                        </IconButton>
                      )}
                      <FormControl fullWidth>
                        <InputLabel id={`screenId-${entry.id}`}>Select Screen</InputLabel>
                        <Select
                          error={
                            !!(
                              formik.touched.screenEntries?.[index]?.screenId &&
                              formik.errors.screenEntries?.[index]?.screenId
                            )
                          }
                          fullWidth
                          id={`screenId-${entry.id}`}
                          name={`screenEntries.${index}.screenId`}
                          onBlur={formik.handleBlur}
                          onChange={(e) => {
                            formik.handleChange(e);
                            // Reset ad account when screen changes
                            formik.setFieldValue(`screenEntries.${index}.adsAccountId`, '');
                            // Fetch ad accounts for the selected screen
                            fetchAdAccounts(e.target.value);
                          }}
                          value={entry.screenId}
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
                        <InputLabel htmlFor={`adsAccountId-${entry.id}`}>
                          Select Ad Account
                        </InputLabel>
                        <Select
                          error={
                            !!(
                              formik.touched.screenEntries?.[index]?.adsAccountId &&
                              formik.errors.screenEntries?.[index]?.adsAccountId
                            )
                          }
                          fullWidth
                          label="Select Ad Account"
                          name={`screenEntries.${index}.adsAccountId`}
                          id={`adsAccountId-${entry.id}`}
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          value={entry.adsAccountId}
                          disabled={!entry.screenId}
                          endAdornment={
                            loadingScreens[entry.screenId] && <CircularProgress size={20} />
                          }
                        >
                          <MenuItem value="" disabled>
                            {entry.screenId
                              ? adAccounts.some((acc) => acc.screenReference === entry.screenId)
                                ? 'Select an Ad Account'
                                : 'No available Ad Accounts for this screen'
                              : 'Select a screen first'}
                          </MenuItem>
                          {adAccounts
                            .filter((account) => {
                              // Only show accounts for this screen
                              if (account.screenReference !== entry.screenId) return false;

                              // Check if this account is already selected in another entry
                              const isSelectedInOtherEntry = formik.values.screenEntries.some(
                                (otherEntry, otherIndex) =>
                                  otherIndex !== index &&
                                  otherEntry.adsAccountId === account.reference
                              );

                              return !isSelectedInOtherEntry;
                            })
                            .map((adAccount) => (
                              <MenuItem value={adAccount.reference} key={adAccount.reference}>
                                {adAccount.name}
                              </MenuItem>
                            ))}
                        </Select>
                        {!!(
                          formik.touched.screenEntries?.[index]?.adsAccountId &&
                          formik.errors.screenEntries?.[index]?.adsAccountId
                        ) && (
                          <FormHelperText sx={{ color: 'error.main' }}>
                            {formik.errors.screenEntries?.[index]?.adsAccountId}
                          </FormHelperText>
                        )}
                      </FormControl>
                      <AdFiles formik={formik} entryIndex={index} adFiles={entry.adFiles} />
                      {index === formik.values.screenEntries.length - 1 && (
                        <Button
                          variant="outlined"
                          onClick={() => {
                            formik.setFieldValue('screenEntries', [
                              ...formik.values.screenEntries,
                              {
                                id: nanoid(5),
                                screenId: '',
                                adsAccountId: '',
                                adFiles: [],
                              },
                            ]);
                          }}
                        >
                          Add Another Screen
                        </Button>
                      )}
                    </Stack>
                  ))}
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

function AdFiles({ formik, entryIndex, adFiles }) {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">Ad Files</Typography>
      <AddedFiles formik={formik} entryIndex={entryIndex} adFiles={adFiles} />
      <EmptyAdForm formik={formik} entryIndex={entryIndex} />
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

function EmptyAdForm({ id, formik, entryIndex, fileType, fileName, ifrmContent, close }) {
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
      toast.error('File size should be less than 5MB');
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
    const newAdFile = {
      name: selectedFileName,
      type: selectedAdFileType,
      file: iframeContent || selectedFile,
      iframeContent,
      id: id || nanoid(5),
    };

    const newEntries = [...formik.values.screenEntries];
    const currentEntry = newEntries[entryIndex];
    const existingAdFiles = [...currentEntry.adFiles];

    if (id) {
      const fileIndex = existingAdFiles.findIndex((adFile) => adFile.id === id);
      existingAdFiles[fileIndex] = {
        ...existingAdFiles[fileIndex],
        ...newAdFile,
        file: newAdFile.file || existingAdFiles[fileIndex].file,
      };
    } else {
      existingAdFiles.push(newAdFile);
    }

    newEntries[entryIndex] = {
      ...currentEntry,
      adFiles: existingAdFiles,
    };
    formik.setFieldValue('screenEntries', newEntries);
    close?.();

    setSelectedAdFileType('');
    setSelectedFile(null);
    setFileObjectUrl('');
    URL.revokeObjectURL(fileObjectUrl);
    setSelectedFileName('');
    setIframeContent('');
  };

  useEffect(() => {
    // This effect is only for cleanup when component unmounts
    return () => {
      setSelectedFile(null);
      setFileObjectUrl('');
      URL.revokeObjectURL(fileObjectUrl);
      setSelectedFileName('');
      setIframeContent('');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                <video style={videoStyle} src={fileObjectUrl} muted alt="preview" />
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

function AddedFiles({ formik, entryIndex, adFiles }) {
  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = reorder(adFiles, result.source.index, result.destination.index);
    const newEntries = [...formik.values.screenEntries];
    newEntries[entryIndex] = {
      ...newEntries[entryIndex],
      adFiles: items,
    };
    formik.setFieldValue('screenEntries', newEntries);
  };
  return (
    adFiles.length > 0 && (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={`ad-files-${entryIndex}`}>
          {(provided) => (
            <Stack {...provided.droppableProps} ref={provided.innerRef}>
              {adFiles.map((file, index) => (
                <Draggable draggableId={`${file.id}-${entryIndex}`} index={index} key={file.id}>
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
                        entryIndex={entryIndex}
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

function AddedFile({ id, name, type, file, iframeContent, formik, entryIndex }) {
  const fileObjectUrl = useMemo(
    () => (file instanceof File ? URL.createObjectURL(file) : null),
    [file]
  );

  const handleRemoveFile = () => {
    const newEntries = [...formik.values.screenEntries];
    const currentEntry = newEntries[entryIndex];
    newEntries[entryIndex] = {
      ...currentEntry,
      adFiles: currentEntry.adFiles.filter((f) => f.id !== id),
    };
    formik.setFieldValue('screenEntries', newEntries);
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
              <video style={videoStyle} src={fileObjectUrl} muted alt="preview" />
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
          <EditFile fileId={id} formik={formik} entryIndex={entryIndex} />
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
function EditFile({ formik, fileId, entryIndex }) {
  const { state, open, close } = useToggle(false);

  const { id, name, type, iframeContent } = useMemo(
    () => formik.values.screenEntries[entryIndex].adFiles.find((file) => file.id === fileId),
    [fileId, formik.values.screenEntries, entryIndex]
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

  const handleUpload = async () => {
    const { organizationId, screenEntries } = formik.values;
    const filesToUpload = [];

    // Flatten all files into one list with context
    screenEntries.forEach((entry) => {
      entry.adFiles.forEach((file) => {
        filesToUpload.push({
          organizationId,
          screenId: entry.screenId,
          adsAccountId: entry.adsAccountId,
          file,
        });
      });
    });

    let totalUploaded = 0;
    const totalSize = filesToUpload.reduce(
      (acc, f) => acc + (f.file.file?.size || f.file.iframeContent?.length || 0),
      0
    );

    setRequestProcessing(true);

    toast.promise(
      Promise.all(
        filesToUpload.map(({ organizationId, screenId, adsAccountId, file }) => {
          const formData = new FormData();
          formData.append('organizationId', organizationId);
          formData.append('screenId', screenId);
          formData.append('adsAccountId', adsAccountId);
          formData.append('adsType', file.type);
          formData.append('adsUpload', file.iframeContent || file.file);
          formData.append('adsName', file.name);

          return axios.post(`${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/v1/ads/create`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${user.token}`,
            },
            onUploadProgress: (progressEvent) => {
              const { loaded } = progressEvent;
              totalUploaded += loaded;
              setuploadProgress((totalUploaded / totalSize) * 100);
            },
          });
        })
      ),
      {
        loading: 'Uploading Ads, Hang on...',
        success: () => {
          formik.resetForm();
          setuploadProgress(0);
          setRequestProcessing(false);
          return 'All ads uploaded successfully';
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
      onClick={handleUpload}
      endIcon={
        requestProcessing && <CircularProgress size={16} sx={{ color: 'rgba(17,25,39,0.6)' }} />
      }
      disabled={
        !(formik.isValid && formik.dirty) ||
        requestProcessing ||
        !formik.values.screenEntries.some((entry) => entry.adFiles.length > 0)
      }
    >
      Submit
      <Box style={{ ...progressSpanStyles, width: `${uploadProgress}%` }}></Box>
    </Button>
  );
}
