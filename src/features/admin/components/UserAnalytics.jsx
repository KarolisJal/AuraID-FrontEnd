import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { ResponsiveBar } from '@nivo/bar';

const UserAnalytics = ({ data }) => {
  if (!data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!Array.isArray(data.trends)) {
    return (
      <Alert severity="warning">
        No analytics data available
      </Alert>
    );
  }

  return (
    <Box sx={{ height: 400 }}>
      <ResponsiveBar
        data={data.trends}
        keys={['activeUsers', 'newUsers']}
        indexBy="date"
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        padding={0.3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={{ scheme: 'nivo' }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Date',
          legendPosition: 'middle',
          legendOffset: 32
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Users',
          legendPosition: 'middle',
          legendOffset: -40
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            itemOpacity: 0.85,
            symbolSize: 20
          }
        ]}
      />
    </Box>
  );
};

UserAnalytics.propTypes = {
  data: PropTypes.shape({
    trends: PropTypes.arrayOf(PropTypes.shape({
      date: PropTypes.string.isRequired,
      activeUsers: PropTypes.number.isRequired,
      newUsers: PropTypes.number.isRequired
    }))
  })
};

export default UserAnalytics; 