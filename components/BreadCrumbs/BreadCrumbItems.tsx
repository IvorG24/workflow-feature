import { Anchor, Breadcrumbs } from "@mantine/core";

type BreadcrumbItemProps = {
  items: {
    title: string;
    action?: () => void;
  }[];
};

const BreadcrumbItems = ({ items }: BreadcrumbItemProps) => {
  return (
    <Breadcrumbs>
      {items.map((item, index) => (
        <Anchor key={index} onClick={item.action || undefined}>
          {item.title}
        </Anchor>
      ))}
    </Breadcrumbs>
  );
};

export default BreadcrumbItems;
