import { useOutletContext } from "react-router-dom";
import { Alert, Box, Flex, Heading, Text } from "theme-ui";
import PageLoader from "../components/loaders/PageLoader";
import type { ProfileContextValue } from "../api/profileApi";

const Profile = () => {
  // The layout already loaded the profile. This page only shows it.
  const { profile, isLoading, errorMessage } =
    useOutletContext<ProfileContextValue>();

  const profileRows = [
    { label: "Name", value: profile?.name },
    { label: "Email", value: profile?.email },
    { label: "Password", value: "••••••••" }, // a password is never sent back by the backend
  ];

  return (
    <Box>
      <Heading as="h1" sx={{ fontSize: 3, mb: 3 }}>
        Admin Profile
      </Heading>

      {errorMessage && <Alert>{errorMessage}</Alert>}

      {isLoading ? (
        <PageLoader />
      ) : (
        <Box
          sx={{
            maxWidth: 520,
            p: [3, 4],
            bg: "white",
            borderRadius: 16,
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          }}
        >
          {profileRows.map((row) => (
            <Flex
              key={row.label}
              sx={{
                flexDirection: ["column", "row"],
                gap: [1, 3],
                py: 3,
                borderBottom: "1px solid",
                borderColor: "border",
              }}
            >
              <Text sx={{ width: 120, color: "muted", fontWeight: 500 }}>
                {row.label}
              </Text>
              <Text sx={{ wordBreak: "break-all" }}>{row.value || "-"}</Text>
            </Flex>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Profile;
