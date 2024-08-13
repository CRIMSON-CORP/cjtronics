import BookmarkIcon from '@heroicons/react/24/solid/BookmarkIcon';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio as MUIRadio,
  RadioGroup,
  Stack,
  SvgIcon,
  TextField,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useId, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import ProtectDashboard from 'src/hocs/protectDashboard';
import usePermission from 'src/hooks/usePermission';
import useRoleProtect from 'src/hooks/useRole';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import axios from 'src/lib/axios';
import handleGSSPError from 'src/utils/handle-gssp-error';
import permissions from 'src/utils/permissions-config';

const Page = ({ app_settings }) => {
  const [settings, setSettings] = useState(app_settings);
  const { replace, asPath } = useRouter();

  const protectActionWrapper = useRoleProtect(permissions.save_setting);
  const hasSaveAppSettingsPermisison = usePermission(permissions.save_setting);

  const onSettingChange = useCallback((key, value) => {
    setSettings((prev) => {
      return prev.map((setting) => {
        if (setting.key === key) {
          setting.value = value;
        }

        return setting;
      });
    });
  }, []);

  const onPrivateChange = useCallback((e) => {
    setSettings((prev) => {
      return prev.map((setting) => {
        if (setting.key === e.target.name) {
          setting.private_mode = e.target.value === 'true';
        }

        return setting;
      });
    });
  }, []);

  const onRadioChange = useCallback((e) => {
    setSettings((prev) => {
      return prev.map((setting) => {
        if (setting.key === e.target.name) {
          setting.value = e.target.value === 'true';
        }

        return setting;
      });
    });
  });

  const handleSave = useCallback(() => {
    const payload = settings.map((setting) => ({
      key: setting.key,
      value: setting.value,
      is_private: setting.private_mode,
    }));
    toast.promise(
      (async () => {
        await axios.post('/api/admin/app-settings/save', payload);
        replace(asPath);
      })(),
      {
        loading: 'Saving Settings...',
        success: 'Settings Saved!',
        error: (error) => `Failed to save settings: ${error.response.data.message}`,
      }
    );
  }, [asPath, replace, settings]);

  return (
    <>
      <Head>
        <title>App Settings | Dalukwa Admin</title>
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
            <Stack spacing={3}>
              <Typography variant="h4">App Settings</Typography>
            </Stack>
            <Grid container p={3} spacing={{ xs: 2, md: 3 }} columns={{ xs: 2, md: 3, lg: 4 }}>
              {settings.map((setting) => (
                <Grid item key={setting.key}>
                  <Setting
                    {...setting}
                    settingKey={setting.key}
                    onSettingChange={onSettingChange}
                    onPrivateChange={onPrivateChange}
                    onRadioChange={onRadioChange}
                  />
                </Grid>
              ))}
            </Grid>
            <Stack justifyContent="flex-end" direction="row">
              {hasSaveAppSettingsPermisison && (
                <Button
                  variant="contained"
                  startIcon={
                    <SvgIcon>
                      <BookmarkIcon />
                    </SvgIcon>
                  }
                  onClick={protectActionWrapper(handleSave)}
                >
                  Save Settings
                </Button>
              )}
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export const getServerSideProps = ProtectDashboard(async (ctx, userAuthToken) => {
  try {
    const response = await axios.get(`/admin/setting/list`, {
      headers: {
        Authorization: `Bearer ${userAuthToken}`,
      },
    });

    return {
      props: { ...response.data.data },
    };
  } catch (error) {
    return handleGSSPError(error);
  }
});

export default Page;

function Setting({
  settingKey,
  value,
  onSettingChange,
  onPrivateChange,
  private_mode,
  onRadioChange,
}) {
  return (
    <Card p={3} sx={{ width: 'fit-content' }}>
      <CardHeader sx={{ textTransform: 'capitalize' }} title={settingKey.replaceAll('_', ' ')} />
      <Divider />
      <CardContent>
        <SettingForm
          settingKey={settingKey}
          value={value}
          private_mode={private_mode}
          onSettingChange={onSettingChange}
          onPrivateChange={onPrivateChange}
          onRadioChange={onRadioChange}
        />
      </CardContent>
    </Card>
  );
}

function SettingForm({
  settingKey,
  value,
  onSettingChange,
  onPrivateChange,
  private_mode,
  onRadioChange,
}) {
  const id = useId();
  return (
    <>
      <Stack spacing={3}>
        <FormControl>
          <FormLabel sx={{ textTransform: 'capitalize', mb: 2 }} id={id + 'value'}>
            {settingKey.replaceAll('_', ' ')}
          </FormLabel>
          {typeof value === 'boolean' && (
            <Radio
              value={value}
              id={id + 'value'}
              settingKey={settingKey}
              onChange={onRadioChange}
            />
          )}
          {typeof value === 'number' && (
            <NumberInput
              value={value}
              id={id + 'value'}
              settingKey={settingKey}
              onChange={onSettingChange}
            />
          )}
          {typeof value === 'object' && !Array.isArray(value) && (
            <ObjectValuesInput
              value={value}
              id={id + 'value'}
              settingKey={settingKey}
              onChange={onSettingChange}
            />
          )}
          {typeof value === 'object' && Array.isArray(value) && (
            <ArrayInput
              value={value}
              id={id + 'value'}
              settingKey={settingKey}
              onChange={onSettingChange}
            />
          )}
        </FormControl>
        <FormControl>
          <FormLabel sx={{ textTransform: 'capitalize' }} id={id + 'private'}>
            Private mode?
          </FormLabel>
          <Radio
            value={private_mode}
            id={id + 'private'}
            settingKey={settingKey}
            onChange={onPrivateChange}
          />
        </FormControl>
      </Stack>
    </>
  );
}

function Radio({ value, id, settingKey, onChange }) {
  return (
    <RadioGroup
      aria-labelledby={id}
      value={value}
      defaultValue={value}
      name={settingKey}
      onChange={onChange}
      row
    >
      <FormControlLabel value={true} control={<MUIRadio />} label="on" />
      <FormControlLabel value={false} control={<MUIRadio />} label="Off" />
    </RadioGroup>
  );
}

function NumberInput({ value, id, settingKey, onChange }) {
  const onChangeHandler = useCallback(
    (e) => {
      onChange(settingKey, parseFloat(e.target.value || 0));
    },
    [onChange, settingKey]
  );
  return (
    <TextField
      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
      value={value}
      name={settingKey}
      onChange={onChangeHandler}
      id={id}
      type="number"
      label={settingKey.replaceAll('_', ' ')}
    />
  );
}

function ObjectValuesInput({ value, id, settingKey, onChange }) {
  const objectKeys = useMemo(() => Object.keys(value), [value]);

  const onChangeHandler = useCallback(
    (e) => {
      const payload = {
        ...value,
        [e.target.name]: e.target.value.toUpperCase(),
      };
      onChange(settingKey, payload);
    },
    [onChange, settingKey, value]
  );
  return (
    <Stack spacing={2}>
      {objectKeys.map((key) => (
        <TextField
          key={key}
          value={value[key]}
          name={key}
          onChange={onChangeHandler}
          id={id}
          label={key}
        />
      ))}
    </Stack>
  );
}

function ArrayInput({ value, settingKey, onChange }) {
  const [newAgeRange, setNewAgeRange] = useState('');
  const [insertIndex, setInsertIndex] = useState('');
  const onDeleteHandler = useCallback(
    (key) => () => {
      const payload = value.filter((_value) => _value !== key);

      onChange(settingKey, payload);
    },
    [onChange, settingKey, value]
  );

  const onNewAgeRangeChange = useCallback((e) => {
    setNewAgeRange(e.target.value);
  }, []);

  const onInsertIndexChange = useCallback((e) => {
    setInsertIndex(e.target.value);
  }, []);

  const onAddHandler = useCallback(() => {
    let payload = [];
    if (!newAgeRange) return toast.error('Please write an age range!');
    if (insertIndex === '' || parseInt(insertIndex) > value.length) {
      payload = [...value, newAgeRange];
    } else {
      let copy = [...value];
      copy.splice(Math.max(0, insertIndex - 1), 0, newAgeRange);
      payload = copy;
    }
    onChange(settingKey, payload);
    setNewAgeRange('');
    setInsertIndex('');
  }, [insertIndex, newAgeRange, onChange, settingKey, value]);

  return (
    <Stack alignItems="flex-start" spacing={2}>
      <Stack spacing={1}>
        {value.map((_value, index) => (
          <Stack spacing={1} direction="row" key={_value} alignItems="center">
            <Typography variant="caption">{index + 1}</Typography>
            <Chip label={_value} onDelete={onDeleteHandler(_value)} />
          </Stack>
        ))}
      </Stack>
      <Stack spacing={1}>
        <Stack spacing={1}>
          <TextField label="Add age range" value={newAgeRange} onChange={onNewAgeRangeChange} />
          <TextField
            label="Insert Index"
            type="number"
            value={insertIndex}
            onChange={onInsertIndexChange}
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          />
        </Stack>
        <Button
          onClick={onAddHandler}
          variant="contained"
          startIcon={
            <SvgIcon>
              <PlusIcon />
            </SvgIcon>
          }
        >
          Add
        </Button>
      </Stack>
    </Stack>
  );
}
