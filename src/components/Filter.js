import { Card, Grid } from '@mui/material';
import FilterOptionsList from './FilterOptionList';

function Filter({ filterParams, setFilterParams, additionalElement }) {
  return (
    <Card sx={{ p: 2 }}>
      <Grid container spacing={{ xs: 2, md: 3 }} columns={4}>
        {filterParams.map((filter) => (
          <Grid item key={filter.fieldKey} xs={4} md={2} lg={1}>
            <FilterOptionsList {...filter} setFilterParams={setFilterParams} />
          </Grid>
        ))}
        <Grid item alignItems="center" display="flex">
          {additionalElement}
        </Grid>
      </Grid>
    </Card>
  );
}

export default Filter;
