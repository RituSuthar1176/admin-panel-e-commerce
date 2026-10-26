import { Link } from 'react-router-dom';
import { Box, Heading, Text } from 'theme-ui';

const NotFound = () => (
  <Box sx={{ textAlign: 'center', mt: 6 }}>
    <Heading sx={{ fontSize: 6 }}>404</Heading>
    <Text sx={{ display: 'block', my: 3 }}>Page not found</Text>
    <Link to="/login">Go to Login</Link>
  </Box>
);

export default NotFound;