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

// function generateAdSequence(input) {
//   const adIndices = input.map((account) => account.map(() => 0)); // Track current ad index for each campaign in each account
//   const output = [];
//   const totalAds = input.reduce((max, campaigns) => {
//     const totalAds = campaigns.reduce((count, ads) => count + ads.length, 0);
//     return Math.max(max, totalAds);
//   }, 0); // There are max 4 ads per account, across all campaigns
//   let adsPlayed = 0;

//   // Continue until we've generated the required number of ads
//   while (adsPlayed < totalAds) {
//     // Loop through each account
//     for (let accIdx = 0; accIdx < input.length; accIdx++) {
//       const account = input[accIdx];

//       // Try to pick the next ad for each campaign in the account
//       let pickedAd = false;
//       for (let campIdx = 0; campIdx < account.length; campIdx++) {
//         const campaign = account[campIdx];
//         const adIdx = adIndices[accIdx][campIdx];

//         // If there's an ad available at the current index
//         if (adIdx < campaign.length) {
//           output.push(campaign[adIdx]); // Add the ad to the output
//           adIndices[accIdx][campIdx]++; // Increment index for the campaign
//           adsPlayed++; // Track total ads played
//           pickedAd = true;
//           break; // Stop looking once an ad is picked
//         }
//       }

//       // If no ad was picked in any campaign, loop back to the first campaign
//       if (!pickedAd) {
//         for (let campIdx = 0; campIdx < account.length; campIdx++) {
//           // If all ads in this campaign have been picked, restart the loop
//           if (adIndices[accIdx][campIdx] === account[campIdx].length) {
//             output.push(account[campIdx][0]); // Pick the first ad from this campaign
//             adIndices[accIdx][campIdx] = 1; // Set the index to 1 (loop back)
//             adsPlayed++;
//             break;
//           }
//         }
//       }

//       if (adsPlayed >= totalAds) break; // Stop when the required number of ads is reached
//     }
//   }

//   return output;
// }

// // Example input
// const input = [
//   [
//     ['ad1', 'ad2'],
//     ['ad3', 'ad4'],
//   ],
//   [['ad5'], ['ad6', 'ad7']],
//   [['ad8'], ['ad11'], ['ad9', 'ad10']],
// ];

// console.log(generateAdSequence(input));

// ['ad1', 'ad5', 'ad8', 'ad2', 'ad6', 'ad11', 'ad3', 'ad7', 'ad9', 'ad4', 'ad6', 'ad10'];

// screen
// const input = [
//   // ad account
//   [
//     // campaign
//     [
//       // ad
//       'ad1',
//       // ad
//       'ad2',
//     ],
//     // campaign
//     [
//       // ad
//       'ad3',
//       // ad
//       'ad4',
//     ],
//   ],
//   //ad account
//   [
//     // campaign
//     [
//       // ad
//       'ad5',
//     ],
//     // campaign
//     [
//       // ad
//       'ad6',
//       // ad
//       'ad7',
//     ],
//   ],
//   //ad account
//   [
//     // campaign
//     [
//       // ad
//       'ad8',
//     ],
//     // campaign
//     [
//       // ad
//       'ad11',
//     ],
//     // campaign
//     [
//       // ad
//       'ad9',
//       // ad
//       'ad10',
//     ],
//   ],
// ];
