import { Tooltip } from "@mantine/core";
import moment from "moment";

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

export const setTimeDifference = (date: Date) => {
  const minutes = Math.floor(
    moment.duration(moment(new Date()).diff(date)).asMinutes()
  );
  if (minutes <= 0) return `a few seconds ago`;
  else if (minutes < 60)
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(
    moment.duration(moment(new Date()).diff(date)).asHours()
  );
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(
    moment.duration(moment(new Date()).diff(date)).asDays()
  );
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

  const months = Math.floor(
    moment.duration(moment(new Date()).diff(date)).asMonths()
  );
  return `${months} month${months === 1 ? "" : "s"} ago`;
};
