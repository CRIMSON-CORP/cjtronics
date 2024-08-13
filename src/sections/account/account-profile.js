import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Typography,
} from '@mui/material';
import { getInitials } from 'src/utils/get-initials';

const formatter = Intl.DateTimeFormat('en-us', {
  dateStyle: 'medium',
});

export const AccountProfile = ({ user }) => {
  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Avatar
            src={user.avatar}
            sx={{
              height: 80,
              mb: 2,
              width: 80,
            }}
          >
            {getInitials(`${user.firstname} ${user.lastname}`)}
          </Avatar>
          <Typography gutterBottom variant="h5" textAlign="center">
            {user.firstname} {user.lastname}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Role: {user.role.name}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {user.active ? 'Active user' : 'Inactive User'}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            User since {formatter.format(new Date(user.createdAt))}
          </Typography>
        </Box>
      </CardContent>
      <Divider />
      <CardActions>
        <Button fullWidth variant="text">
          Upload picture
        </Button>
      </CardActions>
    </Card>
  );
};
