import { useActiveApp, useActiveTeam } from "@/stores/useTeamStore";
import { Box, Space } from "@mantine/core";
import {
  IconCirclePlus,
  IconDashboard,
  IconMessage2,
  IconUsersGroup,
} from "@tabler/icons-react";
import { capitalize, isEmpty, lowerCase } from "lodash";
import NavLinkSection from "./NavLinkSection";

const ReviewAppNavLink = () => {
  const defaultIconProps = { size: 20, stroke: 1 };
  const defaultNavLinkProps = { px: 0 };

  const activeApp = useActiveApp();
  const activeTeam = useActiveTeam();

  const overviewSection = [
    {
      label: `Dashboard`,
      icon: (
        <Box ml="sm" py={5} mt={3}>
          <IconDashboard {...defaultIconProps} />
        </Box>
      ),
      href: `/team-${lowerCase(activeApp)}s/dashboard`,
    },
    {
      label: `${capitalize(activeApp)}`,
      icon: (
        <Box ml="sm" py={5} mt={3}>
          <IconMessage2 {...defaultIconProps} />
        </Box>
      ),
      href: `/team-${lowerCase(activeApp)}s/${lowerCase(activeApp)}s`,
    },
  ];

  const teamSectionWithManageTeam = [
    {
      label: "Manage Team",
      icon: (
        <Box ml="sm" py={5} mt={3}>
          <IconUsersGroup {...defaultIconProps} />
        </Box>
      ),
      href: `/team`,
    },
    {
      label: "Create Team",
      icon: (
        <Box ml="sm" py={5} mt={3}>
          <IconCirclePlus {...defaultIconProps} />
        </Box>
      ),
      href: `/team/create`,
    },
  ];

  const teamSection = [
    {
      label: "Create Team",
      icon: (
        <Box ml="sm" py={5} mt={3}>
          <IconCirclePlus {...defaultIconProps} />
        </Box>
      ),
      href: `/team/create`,
    },
  ];

  return (
    <>
      {!isEmpty(activeTeam) ? (
        <NavLinkSection
          label={"Overview"}
          links={overviewSection}
          {...defaultNavLinkProps}
        />
      ) : null}

      <NavLinkSection
        label={"Team"}
        links={!isEmpty(activeTeam) ? teamSectionWithManageTeam : teamSection}
        {...defaultNavLinkProps}
      />

      <Space h="sm" />
    </>
  );
};

export default ReviewAppNavLink;
