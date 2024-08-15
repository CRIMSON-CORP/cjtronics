import ChartBarIcon from '@heroicons/react/24/solid/ChartBarIcon';
// import CogIcon from '@heroicons/react/24/solid/CogIcon';
// import ShoppingBagIcon from '@heroicons/react/24/solid/ShoppingBagIcon';
// import UserIcon from '@heroicons/react/24/solid/UserIcon';
// import UserPlusIcon from '@heroicons/react/24/solid/UserPlusIcon';
// import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';
import {
  AddBusiness,
  Business,
  Campaign,
  Dashboard,
  Dvr,
  Monitor,
  OndemandVideo,
  People,
  ShowChart,
  VideoCameraFront,
  Widgets,
} from '@mui/icons-material';
import HistoryIcon from '@mui/icons-material/History';
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
            <HistoryIcon />
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
    title: 'Leaderboards',
    path: '/leaderboards',
    icon: (
      <SvgIcon fontSize="small">
        <ChartBarIcon />
      </SvgIcon>
    ),
  },
  // {
  //   title: 'Companies',
  //   path: '/companies',
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <ShoppingBagIcon />
  //     </SvgIcon>
  //   ),
  // },
  // {
  //   title: 'Account',
  //   path: '/account',
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <UserIcon />
  //     </SvgIcon>
  //   ),
  // },
  // {
  //   title: 'Settings',
  //   path: '/settings',
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <CogIcon />
  //     </SvgIcon>
  //   ),
  // },
  // {
  //   title: 'Login',
  //   path: '/auth/login',
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <LockClosedIcon />
  //     </SvgIcon>
  //   ),
  // },
  // {
  //   title: 'Register',
  //   path: '/auth/register',
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <UserPlusIcon />
  //     </SvgIcon>
  //   ),
  // },
  // {
  //   title: 'Error',
  //   path: '/404',
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <XCircleIcon />
  //     </SvgIcon>
  //   ),
  // },
];
