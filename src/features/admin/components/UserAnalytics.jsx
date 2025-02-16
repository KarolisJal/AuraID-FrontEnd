import { Box, Card, CardContent, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PropTypes from 'prop-types';
import { useTheme } from '../../../theme/ThemeProvider';

const UserAnalytics = ({ data }) => {
  const { currentTheme } = useTheme();

  if (!data) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          User Growth Analytics
        </Typography>
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart
              data={data.timeline || []}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                stroke={currentTheme === 'dark' ? '#fff' : '#666'}
              />
              <YAxis 
                stroke={currentTheme === 'dark' ? '#fff' : '#666'}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            New users in last 24h: {data.last24Hours}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Growth rate: {data.growthRate}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

UserAnalytics.propTypes = {
  data: PropTypes.shape({
    timeline: PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string,
        users: PropTypes.number,
      })
    ),
    last24Hours: PropTypes.number,
    growthRate: PropTypes.number,
  }),
};

export default UserAnalytics; 