import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Accordion, AccordionDetails, AccordionSummary, Box, ButtonBase } from '@mui/material';
import { usePathname } from 'next/navigation';
import { SideNavItem } from './side-nav-item';

function SideNavDropList({ title, icon, links }) {
  const pathname = usePathname();
  return (
    <Accordion sx={{ p: 0, my: 0, backgroundColor: 'rgba(255, 255, 255, 0.04)' }}>
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
                  color: 'neutral.400',
                  display: 'inline-flex',
                  justifyContent: 'center',
                  mr: 2,
                }}
              >
                {icon}
              </Box>
            )}
            <Box
              component="span"
              sx={{
                color: 'neutral.400',
                flexGrow: 1,
                fontFamily: (theme) => theme.typography.fontFamily,
                fontSize: 14,
                fontWeight: 600,
                lineHeight: '24px',
              }}
            >
              {title}
            </Box>
          </ButtonBase>
        </li>
      </AccordionSummary>
      <AccordionDetails>
        {links.map((item, index) => {
          const active =
            item.path.includes(pathname.split('/')[1] || ' ') || (pathname === '/' && index === 0);
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
