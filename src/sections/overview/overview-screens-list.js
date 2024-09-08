import { Monitor } from '@mui/icons-material';
import {
  Card,
  CardHeader,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { SeverityPill } from 'src/components/severity-pill';

const statusMap = {
  online: 'success',
  offline: 'error',
};

export const OverviewScreensList = ({ screens = [], sx }) => {
  return (
    <Card sx={sx}>
      <CardHeader title="Screens" />
      <List sx={{ maxHeight: '50vh', overflow: 'auto' }}>
        {screens.map((screen, index) => {
          const hasDivider = index < screens.length - 1;
          return (
            <ListItem divider={hasDivider} key={screen.reference}>
              <ListItemAvatar>
                <SvgIcon>
                  <Monitor />
                </SvgIcon>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body1">{screen.screenName}</Typography>
                      <Chip label={<Typography variant="caption">{screen.deviceId}</Typography>} />
                    </Stack>
                    <Typography variant="body2">{screen.screenId}</Typography>
                    <Typography variant="caption">
                      Resolution: {screen.screenWidth} x {screen.screenHeight}
                    </Typography>
                  </Stack>
                }
                primaryTypographyProps={{ variant: 'caption', fontWeight: 'bold' }}
                secondary={screen.screenCity}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
              <SeverityPill color={screen.isOnline ? 'success' : 'error'}>
                {screen.isOnline ? 'Online' : 'Offline'}
              </SeverityPill>
            </ListItem>
          );
        })}
      </List>
      <Divider />
    </Card>
  );
};

OverviewScreensList.propTypes = {
  products: PropTypes.array,
  sx: PropTypes.object,
};
