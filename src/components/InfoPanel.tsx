import { Box, Flex, Heading, Text } from "theme-ui";
import { FiBox, FiShoppingCart, FiTrendingUp, FiUsers } from "react-icons/fi";

const features = [
  {
    icon: <FiTrendingUp size={22} />,
    title: "Real-time Analytics",
    text: "Track sales & revenue live",
    color: "#8b4533",
  },
  {
    icon: <FiBox size={22} />,
    title: "Inventory Control",
    text: "Smart stock management",
    color: "#8a9a86",
  },
  {
    icon: <FiUsers size={22} />,
    title: "Customer Insights",
    text: "Understand your audience",
    color: "#2f9e8f",
  },
];

const InfoPanel = () => {
  return (
    // hidden on mobile and tablet, shown on desktop
    <Flex
      sx={{
        flex: 1,
        display: ["none", null, "flex"],
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
      }}
    >
      <Flex
        sx={{
          width: 76,
          height: 76,
          mb: 3,
          borderRadius: 20,
          bg: "primary",
          color: "white",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 0 8px rgba(139,69,51,0.12)",
        }}
      >
        <FiShoppingCart size={38} />
      </Flex>

      <Heading as="h1" sx={{ fontSize: 5 }}>
        Admin <Text sx={{ color: "primary" }}>Commerce</Text>
      </Heading>
      <Text
        sx={{
          maxWidth: 420,
          mt: 2,
          mb: 4,
          textAlign: "center",
          color: "muted",
        }}
      >
        The all-in-one dashboard to manage your e-commerce business with ease
        and confidence.
      </Text>

      <Box sx={{ width: "100%", maxWidth: 640 }}>
        {features.map((item) => (
          <Flex
            key={item.title}
            sx={{
              alignItems: "center",
              gap: 3,
              p: 3,
              mb: 3,
              bg: "white",
              borderRadius: 16,
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            }}
          >
            <Flex
              sx={{
                width: 46,
                height: 46,
                borderRadius: 12,
                bg: item.color,
                color: "white",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {item.icon}
            </Flex>
            <Box>
              <Text sx={{ display: "block", fontWeight: 600 }}>
                {item.title}
              </Text>
              <Text sx={{ fontSize: 1, color: "muted" }}>{item.text}</Text>
            </Box>
          </Flex>
        ))}
      </Box>
    </Flex>
  );
};

export default InfoPanel;
