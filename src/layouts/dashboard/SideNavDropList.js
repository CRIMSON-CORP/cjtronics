import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Accordion, AccordionDetails, AccordionSummary, Box, ButtonBase } from '@mui/material';
import { usePathname } from 'next/navigation';
import { SideNavItem } from './side-nav-item';

function SideNavDropList({ title, icon, links, active, disabled }) {
  const pathname = usePathname();
  return (
    <Accordion
      disableGutters
      sx={{
        p: 0,
        my: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        '&:before': {
          content: 'none',
        },
        overflow: 'hidden',
        '&,&:last-of-type, &:first-of-type': {
          borderRadius: ' 8px',
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ArrowDropDownIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
        sx={{
          p: 0,
          my: 0,
          backgroundColor: 'transparent',
          minHeight: '0px',
          '& .MuiAccordionSummary-content': {
            margin: '0px',
          },
          ...(active && {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          }),
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          },
        }}
      >
        <li>
          <ButtonBase
            sx={{
              alignItems: 'center',
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'flex-start',
              pl: '16px',
              pr: '16px',
              py: '6px',
              textAlign: 'left',
              width: '100%',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
              },
            }}
          >
            {icon && (
              <Box
                component="span"
                sx={{
                  alignItems: 'center',
                  color: 'neutral.500',
                  display: 'inline-flex',
                  justifyContent: 'center',
                  mr: 2,
                  ...(active && {
                    color: 'neutral.800',
                  }),
                }}
              >
                {icon}
              </Box>
            )}
            <Box
              component="span"
              sx={{
                color: 'neutral.500',
                flexGrow: 1,
                fontFamily: (theme) => theme.typography.fontFamily,
                fontSize: 14,
                fontWeight: 600,
                lineHeight: '24px',
                ...(active && {
                  color: 'neutral.800',
                }),
                ...(disabled && {
                  color: 'neutral.500',
                }),
              }}
            >
              {title}
            </Box>
          </ButtonBase>
        </li>
      </AccordionSummary>
      <AccordionDetails>
        {links.map((item, index) => {
          const splitPath = pathname.split('/');
          const active =
            index === 0
              ? item.matchers.includes(splitPath[1]) && splitPath.length === 2
              : item?.matchers.includes(splitPath[index === 0 ? 1 : 2]);
          return (
            <SideNavItem
              active={active}
              disabled={item.disabled}
              external={item.external}
              icon={item.icon}
              key={item.title}
              path={item.path}
              title={item.title}
            />
          );
        })}
      </AccordionDetails>
    </Accordion>
  );
}

export default SideNavDropList;
