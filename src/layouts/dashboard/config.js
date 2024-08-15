import ChartBarIcon from '@heroicons/react/24/solid/ChartBarIcon';
// import CogIcon from '@heroicons/react/24/solid/CogIcon';
import LockClosedIcon from '@heroicons/react/24/solid/LockClosedIcon';
// import ShoppingBagIcon from '@heroicons/react/24/solid/ShoppingBagIcon';
// import UserIcon from '@heroicons/react/24/solid/UserIcon';
// import UserPlusIcon from '@heroicons/react/24/solid/UserPlusIcon';
import UsersIcon from '@heroicons/react/24/solid/UsersIcon';
// import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';
import CalendarDaysIcon from '@heroicons/react/24/solid/CalendarDaysIcon';
import PuzzlePieceIcon from '@heroicons/react/24/solid/PuzzlePieceIcon';
import RocketLaunchIcon from '@heroicons/react/24/solid/RocketLaunchIcon';
import ShieldCheckIcon from '@heroicons/react/24/solid/ShieldCheckIcon';
import WrenchScrewdriverIcon from '@heroicons/react/24/solid/WrenchScrewdriverIcon';
import {
  AddBusiness,
  Business,
  Campaign,
  Dashboard,
  Monitor,
  OndemandVideo,
  People,
  VideoCameraFront,
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
    title: 'Overview',
    path: '/',
    icon: (
      <SvgIcon fontSize="small">
        <ChartBarIcon />
      </SvgIcon>
    ),
  },
  {
    title: 'Roles and Permissions',
    path: '/roles',
    icon: (
      <SvgIcon fontSize="small">
        <ShieldCheckIcon />
      </SvgIcon>
    ),
  },
  {
    title: 'Top Leagues',
    path: '/top-leagues',
    icon: (
      <SvgIcon fontSize="small">
        <ChartBarIcon />
      </SvgIcon>
    ),
  },
  {
    title: 'Users',
    path: '/users',
    icon: (
      <SvgIcon fontSize="small">
        <UsersIcon />
      </SvgIcon>
    ),
  },
  {
    title: 'Events',
    path: '/events',
    icon: (
      <SvgIcon fontSize="small">
        <PuzzlePieceIcon />
      </SvgIcon>
    ),
  },
  {
    title: 'App Settings',
    path: '/app-settings',
    icon: (
      <SvgIcon fontSize="small">
        <WrenchScrewdriverIcon />
      </SvgIcon>
    ),
  },
  {
    title: 'Fixtures',
    path: '/fixtures',
    icon: (
      <SvgIcon fontSize="small">
        <CalendarDaysIcon />
      </SvgIcon>
    ),
  },
  {
    title: 'Open Duels',
    path: '/open-duels',
    icon: (
      <SvgIcon fontSize="small">
        <RocketLaunchIcon />
      </SvgIcon>
    ),
  },
  {
    title: 'Locked Duels',
    path: '/locked-duels',
    icon: (
      <SvgIcon fontSize="small">
        <LockClosedIcon />
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
