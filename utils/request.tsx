import { Tooltip } from "@mantine/core";

export const setBadgeColor = (status: string) => {
  switch (status) {
    case "pending":
      return "blue";
    case "approved":
      return "green";
    case "rejected":
      return "red";
    case "revision":
      return "orange";
    case "stale":
      return "gray";
    case "cancelled":
      return "dark";
  }
};

export const renderTooltip = (child: JSX.Element, tooltip: string) => {
  if (tooltip) {
    return (
      <Tooltip label={tooltip} withArrow key={child.key}>
        {child}
      </Tooltip>
    );
  } else {
    return child;
  }
};
