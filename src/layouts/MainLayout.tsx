import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import moment from 'moment';
import { Box, Flex, Text } from 'theme-ui';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { getAdminProfile, getApiErrorMessage } from '../api/profileApi';
import type { AdminProfile, ProfileContextValue } from '../api/profileApi';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  // Load the admin profile once, when the layout opens
  useEffect(() => {
    getAdminProfile()
      .then((result) => {
        setProfile(result);
      })
      .catch((error) => {
        setProfileError(getApiErrorMessage(error));
      })
      .finally(() => {
        setIsProfileLoading(false);
      });
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Shared with the pages shown inside the layout
  const profileContext: ProfileContextValue = { profile, isLoading: isProfileLoading, errorMessage: profileError };

  return (
    <Flex sx={{ minHeight: '100vh', bg: 'background' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <Flex sx={{ flex: 1, flexDirection: 'column', minWidth: 0 }}>
        <Header onMenuClick={toggleSidebar} profile={profile} />

        {/* The current page (Dashboard, Profile...) appears here */}
        <Box as="main" sx={{ flex: 1, p: [3, 4] }}>
          <Outlet context={profileContext} />
        </Box>

        <Text sx={{ py: 3, px: 3, textAlign: 'center', fontSize: 1 }}>
          Copyright © {moment().format('YYYY')} <Text sx={{ color: 'primary', fontWeight: 500 }}>Shivinfotech</Text> All rights reserved.
        </Text>
      </Flex>
    </Flex>
  );
};

export default MainLayout;