import {
  IconCirclePlus,
  IconMessage2,
  IconUsersGroup,
} from "@tabler/icons-react";
import NavLinkSection from "./NavLinkSection";

const ReviewAppNavLink = () => {
  const defaultIconProps = { size: 20, stroke: 1 };
  const defaultNavLinkProps = { px: 0 };

  const overviewSection = [
    {
      label: "Reviews",
      icon: <IconMessage2 {...defaultIconProps} />,
      href: `/team-reviews/reviews`,
    },
  ];

  const teamSection = [
    {
      label: "Manage Team",
      icon: <IconUsersGroup {...defaultIconProps} />,
      href: `/team-reviews/team-settings`,
    },
    {
      label: "Create Team",
      icon: <IconCirclePlus {...defaultIconProps} />,
      href: `/team-reviews/reviews`,
    },
  ];

  return (
    <>
      <NavLinkSection
        label={"Overview"}
        links={overviewSection}
        {...defaultNavLinkProps}
      />
      <NavLinkSection
        label={"Team"}
        links={teamSection}
        {...defaultNavLinkProps}
      />
    </>
  );
};

export default ReviewAppNavLink;
