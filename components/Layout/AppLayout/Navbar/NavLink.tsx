import { useActiveApp } from "@/stores/useTeamStore";
import { ActionIcon } from "@mantine/core";
import {
  IconCirclePlus,
  IconMessage2,
  IconUsersGroup,
} from "@tabler/icons-react";
import { capitalize, lowerCase } from "lodash";
import NavLinkSection from "./NavLinkSection";

const ReviewAppNavLink = () => {
  const defaultIconProps = { size: 20, stroke: 1 };
  const defaultNavLinkProps = { px: 0 };

  const activeApp = useActiveApp();

  const overviewSection = [
    {
      label: `${capitalize(activeApp)}`,
      icon: (
        <ActionIcon variant="transparent" ml="xs">
          <IconMessage2 {...defaultIconProps} />
        </ActionIcon>
      ),
      href: `/team-${lowerCase(activeApp)}s/${lowerCase(activeApp)}s`,
    },
  ];

  const teamSection = [
    {
      label: "Manage Team",
      icon: (
        <ActionIcon variant="transparent" ml="xs">
          <IconUsersGroup {...defaultIconProps} />
        </ActionIcon>
      ),
      href: `/team`,
    },
    {
      label: "Create Team",
      icon: (
        <ActionIcon variant="transparent" ml="xs">
          <IconCirclePlus {...defaultIconProps} />
        </ActionIcon>
      ),
      href: `/team/create`,
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
