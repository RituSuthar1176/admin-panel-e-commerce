import { Flex } from "theme-ui";
import ComponentLoader from "./ComponentLoader";

const PageLoader = () => (
  <Flex sx={{ minHeight: 300, alignItems: "center", justifyContent: "center" }}>
    <ComponentLoader size={36} />
  </Flex>
);

export default PageLoader;
