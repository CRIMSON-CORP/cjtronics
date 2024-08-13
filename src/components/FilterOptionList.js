import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import {
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SvgIcon,
} from '@mui/material';
import { useCallback, useId } from 'react';

function FilterOptionsList({ value, fieldKey, type, title, list, setFilterParams }) {
  const id = useId();
  const handleChange = useCallback(
    (e) => {
      setFilterParams((prev) => {
        return prev.map((field) => {
          const _value = e.target.value;
          if (field.fieldKey === fieldKey) {
            field.value = typeof _value === 'string' ? _value.toLowerCase() : _value;
          }
          return field;
        });
      });
    },
    [fieldKey, setFilterParams]
  );

  if (type === 'option') {
    return (
      <FormControl fullWidth>
        <InputLabel id={id}>{title}</InputLabel>
        <Select labelId={id} value={value} label={title} onChange={handleChange}>
          <MenuItem value="">&nbsp;</MenuItem>
          {list.map((listItem, index) => (
            <MenuItem key={index} value={listItem.value ?? listItem}>
              {(listItem.render ?? listItem).toString()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }
  return (
    <OutlinedInput
      fullWidth
      value={value}
      placeholder="Search"
      color="error"
      onChange={handleChange}
      startAdornment={
        <InputAdornment position="start">
          <SvgIcon color="action" fontSize="small">
            <MagnifyingGlassIcon />
          </SvgIcon>
        </InputAdornment>
      }
    />
  );
}

export default FilterOptionsList;
