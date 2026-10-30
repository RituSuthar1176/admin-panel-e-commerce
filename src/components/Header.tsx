import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Flex, IconButton, Text } from "theme-ui";
import { FiChevronDown, FiLogOut, FiMenu, FiUser } from "react-icons/fi";
import type { AdminProfile } from "../api/profileApi";

interface HeaderProps {
  onMenuClick: () => void;
  profile: AdminProfile | null; // null while loading or if the request failed
}

// "John Doe" becomes "JD"
const getInitials = (name: string) => {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const Header = ({ onMenuClick, profile }: HeaderProps) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = profile?.name || "Admin";

  // Close the dropdown when the user clicks outside it
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleViewProfile = () => {
    setIsMenuOpen(false);
    navigate("/profile");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <Flex
      as="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        height: 64,
        px: [3, 4],
        alignItems: "center",
        bg: "background",
        borderBottom: "1px solid",
        borderColor: "border",
      }}
    >
      {/* Hamburger (mobile only) */}
      <IconButton
        aria-label="Open menu"
        onClick={onMenuClick}
        sx={{ display: ["flex", null, "none"] }}
      >
        <FiMenu size={22} />
      </IconButton>

      {/* Profile dropdown, pushed to the right */}
      <Box ref={menuRef} sx={{ position: "relative", ml: "auto" }}>
        <Button
          variant="menuItem"
          aria-haspopup="true"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          sx={{ width: "auto" }}
        >
          <Flex
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              bg: "primary",
              color: "white",
              fontSize: 1,
              fontWeight: 600,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {getInitials(displayName)}
          </Flex>
          <Text sx={{ display: ["none", "block"] }}>{displayName}</Text>
          <FiChevronDown size={16} />
        </Button>

        {isMenuOpen && (
          <Box
            sx={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 8px)",
              minWidth: 220,
              p: 2,
              bg: "white",
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              zIndex: 30,
            }}
          >
            <Box
              sx={{
                px: 3,
                py: 2,
                mb: 1,
                borderBottom: "1px solid",
                borderColor: "border",
              }}
            >
              <Text sx={{ display: "block", fontWeight: 600 }}>
                {displayName}
              </Text>
              {profile?.email && (
                <Text
                  sx={{
                    display: "block",
                    fontSize: 1,
                    color: "muted",
                    wordBreak: "break-all",
                  }}
                >
                  {profile.email}
                </Text>
              )}
            </Box>

            <Button variant="menuItem" onClick={handleViewProfile}>
              <FiUser size={16} /> View Profile
            </Button>
            <Button variant="menuItem" onClick={handleLogout}>
              <FiLogOut size={16} /> Logout
            </Button>
          </Box>
        )}
      </Box>
    </Flex>
  );
};

export default Header;
