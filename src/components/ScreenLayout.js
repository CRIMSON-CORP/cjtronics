import { Box, Radio, Stack, Typography } from '@mui/material';

function ScreenLayout({ landscape, full, split = '', horizontal, title, name, value, formik }) {
  const [box1Split, box2Split] = split.split(',');
  return (
    <Stack alignItems="center">
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
            height: '100%',
            width: '100%',
            ...(split ? (!horizontal ? { height: box1Split } : { width: box1Split }) : {}),
          }}
        >
          Box 1
        </Box>
        {full ? null : (
          <Box
            sx={{
              bgcolor: 'primary.light',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              ...(split ? (!horizontal ? { height: box2Split } : { width: box2Split }) : {}),
            }}
          >
            Box 2
          </Box>
        )}
      </Stack>
      <Typography>{title}</Typography>
      <Radio
        checked={value === formik.values[name]}
        onChange={formik.handleChange}
        value={value}
        name={name}
        inputProps={{ 'aria-label': title }}
      />
    </Stack>
  );
}

export default ScreenLayout;
