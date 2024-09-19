import {
  AddBusiness,
  Business,
  Campaign,
  ContactSupport,
  Dashboard,
  Dvr,
  History,
  Monitor,
  OndemandVideo,
  OpenInNew,
  People,
  ShowChart,
  VideoCameraFront,
  Widgets,
} from '@mui/icons-material';
import { SvgIcon } from '@mui/material';

export const items = [
  {
    title: 'Dashboard',
    path: '/',
    icon: (
      <SvgIcon fontSize="small">
        <Dashboard />
      </SvgIcon>
    ),
  },
  {
    title: 'Add Ad Company',
    path: '/add-ad-company',
    icon: (
      <SvgIcon fontSize="small">
        <AddBusiness />
      </SvgIcon>
    ),
  },
  {
    title: 'Users',
    type: 'drop-down',
    icon: (
      <SvgIcon fontSize="small">
        <People />
      </SvgIcon>
    ),
    matchers: ['users'],
    roles: ['admin', 'user', 'advertiser', 'partner'],
    links: [
      {
        title: 'All Users',
        path: '/users',
        icon: (
          <SvgIcon fontSize="small">
            <People />
          </SvgIcon>
        ),
        matchers: ['users'],
      },
      {
        title: 'Companies',
        path: '/users/companies',
        icon: (
          <SvgIcon fontSize="small">
            <Business />
          </SvgIcon>
        ),
        matchers: ['companies'],
      },
      {
        title: 'Organizations',
        path: '/users/organizations',
        icon: (
          <SvgIcon fontSize="small">
            <Business />
          </SvgIcon>
        ),
        matchers: ['organizations'],
        roles: ['admin'],
      },
    ],
  },
  {
    title: 'Screens',
    type: 'drop-down',
    icon: (
      <SvgIcon fontSize="small">
        <Monitor />
      </SvgIcon>
    ),
    matchers: ['screens'],
    links: [
      {
        title: 'All Screens',
        path: '/screens',
        icon: (
          <SvgIcon fontSize="small">
            <People />
          </SvgIcon>
        ),
        matchers: ['screens'],
      },
      {
        title: 'Screen Campaign',
        path: '/screens/campaign',
        icon: (
          <SvgIcon fontSize="small">
            <Campaign />
          </SvgIcon>
        ),
        matchers: ['campaign'],
      },
    ],
    roles: ['admin', 'partner'],
  },
  {
    title: 'Ad Account',
    path: '/ad-account',
    icon: (
      <SvgIcon fontSize="small">
        <VideoCameraFront />
      </SvgIcon>
    ),
  },
  {
    title: 'Campaign',
    type: 'drop-down',
    icon: (
      <SvgIcon fontSize="small">
        <Campaign />
      </SvgIcon>
    ),
    matchers: ['campaign'],
    links: [
      {
        title: 'Create Ads',
        path: '/campaign',
        icon: (
          <SvgIcon fontSize="small">
            <OndemandVideo />
          </SvgIcon>
        ),
        matchers: ['campaign'],
      },
      {
        title: 'Active Campaigns',
        path: '/campaign/active-campaigns',
        icon: (
          <SvgIcon fontSize="small">
            <Campaign />
          </SvgIcon>
        ),
        matchers: ['active-campaigns'],
      },
      {
        title: 'Create campaign',
        path: '/campaign/create-campaign',
        icon: (
          <SvgIcon fontSize="small">
            <Campaign />
          </SvgIcon>
        ),
        matchers: ['create-campaign'],
      },
      {
        title: 'Campaign Shedule',
        path: '/campaign/campaign-schedule',
        icon: (
          <SvgIcon fontSize="small">
            <History />
          </SvgIcon>
        ),
        matchers: ['campaign-schedule'],
      },
    ],
  },
  {
    title: 'External Organizations',
    type: 'drop-down',
    icon: (
      <SvgIcon fontSize="small">
        <OpenInNew />
      </SvgIcon>
    ),
    matchers: ['external-organizations'],
    roles: ['admin'],
    links: [
      {
        title: 'External Organizations',
        path: '/external-organizations',
        icon: (
          <SvgIcon fontSize="small">
            <OndemandVideo />
          </SvgIcon>
        ),
        matchers: ['external-organizations'],
      },
      {
        title: 'External Campaigns',
        path: '/external-organizations/external-campaigns',
        icon: (
          <SvgIcon fontSize="small">
            <Campaign />
          </SvgIcon>
        ),
        matchers: ['external-campaigns'],
      },
    ],
  },
  {
    title: 'Widgets',
    path: '/widgets',
    icon: (
      <SvgIcon fontSize="small">
        <Widgets />
      </SvgIcon>
    ),
  },
  {
    title: 'Activity Log',
    path: '/activity-log',
    icon: (
      <SvgIcon fontSize="small">
        <ShowChart />
      </SvgIcon>
    ),
  },
  {
    title: 'Device Log',
    path: '/device-log',
    icon: (
      <SvgIcon fontSize="small">
        <Dvr />
      </SvgIcon>
    ),
  },
  {
    title: 'Support',
    path: '/support',
    icon: (
      <SvgIcon fontSize="small">
        <ContactSupport />
      </SvgIcon>
    ),
  },
];
