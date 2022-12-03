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
