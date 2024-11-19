import { ReactNode } from "react";
import { Paper, Space } from "@mantine/core";
import BreadcrumbItems from "./BreadCrumbItems";

type BreadcrumbWrapperProps = {
  breadcrumbItems: {
    title: string;
    action?: () => void;
  }[];
  children: ReactNode; 
};

const BreadcrumbWrapper = ({ breadcrumbItems, children }: BreadcrumbWrapperProps) => {
  return (
      <Paper p="xl" shadow="xs">
        <BreadcrumbItems items={breadcrumbItems} />
        <Space h="sm" />
        {children}
      </Paper>
  );
};

export default BreadcrumbWrapper;
