import { Spinner } from "theme-ui";

interface ComponentLoaderProps {
  size?: number;
  color?: string;
}

const ComponentLoader = ({
  size = 20,
  color = "primary",
}: ComponentLoaderProps) => {
  return <Spinner size={size} color={color} />;
};

export default ComponentLoader;
