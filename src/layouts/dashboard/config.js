import ChartBarIcon from '@heroicons/react/24/solid/ChartBarIcon';
// import CogIcon from '@heroicons/react/24/solid/CogIcon';
import LockClosedIcon from '@heroicons/react/24/solid/LockClosedIcon';
// import ShoppingBagIcon from '@heroicons/react/24/solid/ShoppingBagIcon';
// import UserIcon from '@heroicons/react/24/solid/UserIcon';
// import UserPlusIcon from '@heroicons/react/24/solid/UserPlusIcon';
import UsersIcon from '@heroicons/react/24/solid/UsersIcon';
// import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';
import ShieldCheckIcon from '@heroicons/react/24/solid/ShieldCheckIcon';
import PuzzlePieceIcon from '@heroicons/react/24/solid/PuzzlePieceIcon';
import WrenchScrewdriverIcon from '@heroicons/react/24/solid/WrenchScrewdriverIcon';
import CalendarDaysIcon from '@heroicons/react/24/solid/CalendarDaysIcon';
import RocketLaunchIcon from '@heroicons/react/24/solid/RocketLaunchIcon';
import { SvgIcon } from '@mui/material';
import permissions from 'src/utils/permissions-config';

export const items = [
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
    page_access_permission: permissions.view_roles,
  },
  {
    title: 'Top Leagues',
    path: '/top-leagues',
    icon: (
      <SvgIcon fontSize="small">
        <ChartBarIcon />
      </SvgIcon>
    ),
    page_access_permission: permissions.view_top_leagues,
  },
  {
    title: 'Users',
    path: '/users',
    icon: (
      <SvgIcon fontSize="small">
        <UsersIcon />
      </SvgIcon>
    ),
    page_access_permission: permissions.view_users,
  },
  {
    title: 'Events',
    path: '/events',
    icon: (
      <SvgIcon fontSize="small">
        <PuzzlePieceIcon />
      </SvgIcon>
    ),
    page_access_permission: permissions.view_events,
  },
  {
    title: 'App Settings',
    path: '/app-settings',
    icon: (
      <SvgIcon fontSize="small">
        <WrenchScrewdriverIcon />
      </SvgIcon>
    ),
    page_access_permission: permissions.view_settings,
  },
  {
    title: 'Fixtures',
    path: '/fixtures',
    icon: (
      <SvgIcon fontSize="small">
        <CalendarDaysIcon />
      </SvgIcon>
    ),
    page_access_permission: permissions.view_fixtures,
  },
  {
    title: 'Open Duels',
    path: '/open-duels',
    icon: (
      <SvgIcon fontSize="small">
        <RocketLaunchIcon />
      </SvgIcon>
    ),
    page_access_permission: permissions.view_open_duels,
  },
  {
    title: 'Locked Duels',
    path: '/locked-duels',
    icon: (
      <SvgIcon fontSize="small">
        <LockClosedIcon />
      </SvgIcon>
    ),
    page_access_permission: permissions.view_locked_duels,
  },
  {
    title: 'Leaderboards',
    path: '/leaderboards',
    icon: (
      <SvgIcon fontSize="small">
        <ChartBarIcon />
      </SvgIcon>
    ),
    page_access_permission: permissions.view_leader_board,
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
