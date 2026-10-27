import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Flex, Text } from "theme-ui";
import { FiChevronRight } from "react-icons/fi";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

const Breadcrumb = ({ items }: { items: BreadcrumbItem[] }) => (
  <Flex
    as="nav"
    aria-label="Breadcrumb"
    sx={{
      alignItems: "center",
      gap: 1,
      flexWrap: "wrap",
      fontSize: 1,
      color: "muted",
    }}
  >
    {items.map((item, index) => (
      <Fragment key={item.label}>
        {item.path ? (
          <Link
            to={item.path}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {item.label}
          </Link>
        ) : (
          <Text>{item.label}</Text>
        )}
        {index < items.length - 1 && <FiChevronRight size={14} />}
      </Fragment>
    ))}
  </Flex>
);

export default Breadcrumb;
