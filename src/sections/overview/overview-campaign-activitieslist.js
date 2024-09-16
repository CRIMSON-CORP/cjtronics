import { Campaign } from '@mui/icons-material';
import {
  Card,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  SvgIcon,
  Typography,
} from '@mui/material';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { formatRelativeTime } from 'src/utils/fromRelativeTime';

let nextPage = 2;
const itemCount = 25;
const timeFormat = new Intl.DateTimeFormat('en-us', {
  dateStyle: 'short',
  timeStyle: 'medium',
});

export const OverviewCampaignActivitieList = ({ activities = [], sx }) => {
  const [logs, setLogs] = useState(activities.list);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(activities.list.length >= itemCount);
  const observerRef = useRef();
  const containerRef = useRef();

  const fetchMoreActivities = async () => {
    setIsFetching(true);
    try {
      const response = await axios.get(
        `/api/admin/activity/campaign?page=${nextPage}&size=${itemCount}`
      );

      if (response.data.data.list.length < itemCount) {
        setHasMore(false); // Stop fetching when no more data is returned
      } else {
        setLogs((prevLogs) => [...prevLogs, ...response.data.data.list]);
        nextPage += 1;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (elements) => {
        if (elements[0].isIntersecting && !isFetching && hasMore) {
          fetchMoreActivities();
        }
      },
      {
        root: containerRef.current,
        rootMargin: '200px',
      }
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [isFetching, hasMore]);

  return (
    <Card sx={sx}>
      <CardHeader title="Campaign activities" />
      {logs.length === 0 && (
        <Typography align="center" color="text.secondary" sx={{ py: 3 }} variant="h6">
          No activities yet
        </Typography>
      )}
      <List ref={containerRef} sx={{ maxHeight: '50vh', overflow: 'auto', overflowAnchor: 'none' }}>
        {logs.map((campaign, index) => {
          const hasDivider = index < logs.length - 1;
          const ago = formatRelativeTime(new Date(campaign.createdAt));
          return (
            <ListItem divider={hasDivider} key={campaign.id}>
              <ListItemAvatar>
                <SvgIcon>
                  <Campaign />
                </SvgIcon>
              </ListItemAvatar>
              <ListItemText
                primary={campaign.message}
                primaryTypographyProps={{ variant: 'subtitle1' }}
                secondary={`${timeFormat.format(new Date(campaign.createdAt))} (${ago})`}
                secondaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          );
        })}
        <ListItem ref={observerRef}>
          {isFetching && (
            <>
              <ListItemAvatar>
                <Skeleton variant="circular" width={24} height={24} />
              </ListItemAvatar>
              <ListItemText
                primary={<Skeleton variant="text" />}
                secondary={<Skeleton variant="text" />}
              />
            </>
          )}
        </ListItem>
      </List>
      <Divider />
    </Card>
  );
};

OverviewCampaignActivitieList.propTypes = {
  activities: PropTypes.object,
  sx: PropTypes.object,
};
