import { Box, Radio, Stack, Typography } from '@mui/material';

function ScreenLayout({
  landscape,
  full,
  split = '',
  horizontal,
  title,
  name,
  value,
  formik,
  view_name,
  view_value,
}) {
  const [box1Split, box2Split] = split.split(',');
  return (
    <Stack alignItems="center" textAlign="center">
      <Stack
        direction={horizontal ? 'row' : 'column'}
        sx={{
          width: landscape ? '100%' : '60%',
          mx: 'auto',
          borderRadius: 1,
          overflow: 'hidden',
          aspectRatio: landscape ? '16/9' : '9/16',
        }}
      >
        <Box
          sx={{
            bgcolor: 'primary.main',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            height: '100%',
            width: '100%',
            ...(split ? (!horizontal ? { height: box1Split } : { width: box1Split }) : {}),
          }}
        >
          {view_name && (
            <Radio
              name={view_name}
              value="1"
              color="secondary"
              onChange={formik.handleChange}
              checked={'1' === formik.values[view_name]}
            />
          )}
          <Typography variant="caption">View 1</Typography>
        </Box>
        {full ? null : (
          <Box
            sx={{
              bgcolor: 'primary.light',
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              alignItems: 'center',
              ...(split ? (!horizontal ? { height: box2Split } : { width: box2Split }) : {}),
            }}
          >
            {view_name && (
              <Radio
                name={view_name}
                value="2"
                color="secondary"
                onChange={formik.handleChange}
                checked={'2' === formik.values[view_name]}
              />
            )}
            <Typography variant="caption"> View 2</Typography>
          </Box>
        )}
      </Stack>
      <Typography>{title}</Typography>
      {formik && !view_name ? (
        <Radio
          checked={value === formik.values[name]}
          onChange={formik.handleChange}
          value={value}
          name={name}
          inputProps={{ 'aria-label': title }}
        />
      ) : null}
    </Stack>
  );
}

export default ScreenLayout;
