import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import { InputAdornment, OutlinedInput, SvgIcon } from '@mui/material';

export const CustomersSearch = ({ value, setValue }) => (
  <OutlinedInput
    fullWidth
    value={value}
    placeholder="Search"
    color="error"
    onChange={(e) => setValue(e.target.value)}
    startAdornment={
      <InputAdornment position="start">
        <SvgIcon color="action" fontSize="small">
          <MagnifyingGlassIcon />
        </SvgIcon>
      </InputAdornment>
    }
    sx={{ maxWidth: 500 }}
  />
);
