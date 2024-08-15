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
        title: 'Screen Campaing',
        path: '/screens/campaing',
        icon: (
          <SvgIcon fontSize="small">
            <Campaign />
          </SvgIcon>
        ),
        matchers: ['campaing'],
      },
    ],
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
    title: 'Campaing',
    type: 'drop-down',
    icon: (
      <SvgIcon fontSize="small">
        <Campaign />
      </SvgIcon>
    ),
    matchers: ['campaing'],
    links: [
      {
        title: 'Create Ads',
        path: '/campaing',
        icon: (
          <SvgIcon fontSize="small">
            <OndemandVideo />
          </SvgIcon>
        ),
        matchers: ['campaing'],
      },
      {
        title: 'Create Campaing',
        path: '/campaing/create-campaing',
        icon: (
          <SvgIcon fontSize="small">
            <Campaign />
          </SvgIcon>
        ),
        matchers: ['create-campaing'],
      },
      {
        title: 'Create Shedule',
        path: '/campaing/create-schedule',
        icon: (
          <SvgIcon fontSize="small">
            <History />
          </SvgIcon>
        ),
        matchers: ['screens'],
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
    path: '/generate-report',
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
