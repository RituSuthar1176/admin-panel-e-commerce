import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Box, Button, Flex, IconButton, Text } from "theme-ui";
import { FiChevronLeft, FiHome, FiList, FiMinus, FiPlus } from "react-icons/fi";

interface MenuChild {
  label: string;
  path: string;
}

interface MenuItem {
  label: string;
  icon: ReactNode;
  path?: string; // an item with a path is a single link
  children?: MenuChild[]; // an item with children is an expandable group
}

// To add a menu item later, add a line here
const menuItems: MenuItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: <FiHome size={18} /> },
  {
    label: "Catalog",
    icon: <FiList size={18} />,
    children: [
      { label: "Attribute", path: "/catalog/attribute" },
      { label: "Attribute Set", path: "/catalog/attribute-set" },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { pathname } = useLocation();

  // The group that contains the current page starts open
  const [openGroup, setOpenGroup] = useState<string | null>(
    () =>
      menuItems.find((item) =>
        item.children?.some((child) => child.path === pathname),
      )?.label ?? null,
  );

  const toggleGroup = (label: string) =>
    setOpenGroup((current) => (current === label ? null : label));

  return (
    <>
      {/* Dark overlay behind the sidebar (mobile only) */}
      <Box
        onClick={onClose}
        sx={{
          display: isOpen ? ["block", null, "none"] : "none",
          position: "fixed",
          inset: 0,
          bg: "rgba(0,0,0,0.4)",
          zIndex: 19,
        }}
      />

      <Box
        as="aside"
        sx={{
          position: ["fixed", null, "sticky"],
          top: 0,
          left: 0,
          zIndex: 20,
          width: 260,
          height: "100vh",
          flexShrink: 0,
          overflowY: "auto",
          bg: "background",
          borderRight: "1px solid",
          borderColor: "border",
          transform: [
            isOpen ? "translateX(0)" : "translateX(-100%)",
            null,
            "none",
          ],
          transition: "transform 0.25s ease",
        }}
      >
        <Flex
          sx={{
            height: 64,
            px: 3,
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "border",
          }}
        >
          <Text sx={{ fontWeight: "bold" }}>E-Commerce</Text>
          <IconButton
            aria-label="Close menu"
            onClick={onClose}
            sx={{ display: ["flex", null, "none"] }}
          >
            <FiChevronLeft size={20} />
          </IconButton>
        </Flex>

        <Box as="nav" sx={{ p: 3 }}>
          {menuItems.map((item) => {
            // Single link (Dashboard)
            if (item.path) {
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={onClose}
                  style={{ textDecoration: "none" }}
                >
                  <Flex
                    sx={{
                      alignItems: "center",
                      gap: 2,
                      px: 3,
                      py: 3,
                      mb: 1,
                      borderRadius: 10,
                      fontWeight: 500,
                      color: pathname === item.path ? "primary" : "text",
                      bg: pathname === item.path ? "activeBg" : "transparent",
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Flex>
                </Link>
              );
            }

            // Expandable group (Catalog)
            const isGroupOpen = openGroup === item.label;
            const isGroupActive = Boolean(
              item.children?.some((child) => child.path === pathname),
            );

            return (
              <Box key={item.label} sx={{ mb: 1 }}>
                <Button
                  variant="menuItem"
                  aria-expanded={isGroupOpen}
                  onClick={() => toggleGroup(item.label)}
                  sx={{
                    justifyContent: "space-between",
                    py: 3,
                    color: isGroupActive ? "primary" : "text",
                    bg: isGroupActive ? "activeBg" : "transparent",
                  }}
                >
                  <Flex sx={{ alignItems: "center", gap: 2 }}>
                    {item.icon}
                    {item.label}
                  </Flex>
                  {isGroupOpen ? <FiMinus size={18} /> : <FiPlus size={18} />}
                </Button>

                {/* Sub-items: bullet dots joined by a vertical line */}
                {isGroupOpen && (
                  <Box
                    sx={{
                      ml: "26px",
                      my: 2,
                      borderLeft: "2px solid",
                      borderColor: "border",
                    }}
                  >
                    {item.children?.map((child) => {
                      const isChildActive = pathname === child.path;

                      return (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={onClose}
                          style={{ textDecoration: "none" }}
                        >
                          <Flex
                            sx={{
                              position: "relative",
                              alignItems: "center",
                              pl: "24px",
                              py: 2,
                              fontWeight: 500,
                              color: isChildActive ? "primary" : "text",
                              "&:hover": { color: "primary" },
                            }}
                          >
                            {/* The bullet dot, sitting on the vertical line */}
                            <Box
                              sx={{
                                position: "absolute",
                                left: "-5px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bg: isChildActive ? "#d9a99b" : "text",
                              }}
                            />
                            {child.label}
                          </Flex>
                        </Link>
                      );
                    })}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </>
  );
};

export default Sidebar;
