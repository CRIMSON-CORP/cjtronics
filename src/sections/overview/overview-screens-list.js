import { Monitor } from '@mui/icons-material';
import {
  Card,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  SvgIcon,
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
            <ListItem divider={hasDivider} key={screen.id}>
              <ListItemAvatar>
                <SvgIcon>
                  <Monitor />
                </SvgIcon>
              </ListItemAvatar>
              <ListItemText
                primary={screen.name}
                primaryTypographyProps={{ variant: 'caption', fontWeight: 'bold' }}
                secondary={screen.location}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
              <SeverityPill color={statusMap[screen.status]}>{screen.status}</SeverityPill>
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
