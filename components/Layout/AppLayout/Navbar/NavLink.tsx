import { useFormList } from "@/stores/useFormStore";
import { useActiveApp, useActiveTeam } from "@/stores/useTeamStore";
import { isEmpty } from "@/utils/functions";
import { startCase } from "@/utils/string";
import { FormTableRow } from "@/utils/types";
import { Box, Space } from "@mantine/core";
import {
  IconCirclePlus,
  IconDashboard,
  IconFile,
  IconListDetails,
  IconMessage2,
  IconTicket,
  IconUsersGroup,
} from "@tabler/icons-react";
import NavLinkSection from "./NavLinkSection";

const ReviewAppNavLink = () => {
  const defaultIconProps = { size: 20, stroke: 1 };
  const defaultNavLinkProps = { px: 0 };

  const activeApp = useActiveApp();
  const activeTeam = useActiveTeam();
  const forms = useFormList();

  const rfForm = forms.filter(
    (form) => form.form_is_formsly_form && form.form_name === "Requisition"
  )[0];
  const requisitionForm = rfForm as unknown as FormTableRow & {
    form_team_group: string[];
  };

  const tempCreateRequest = [
    {
      label: "Create Request",
      icon: (
        <Box ml="sm" py={5} mt={3}>
          <IconFile {...defaultIconProps} />
        </Box>
      ),
      href: requisitionForm
        ? `/team-requests/forms/${requisitionForm.form_id}/create`
        : "",
    },
    {
      label: "Create Ticket",
      icon: (
        <Box ml="sm" py={5} mt={3}>
          <IconTicket {...defaultIconProps} />
        </Box>
      ),
      href: requisitionForm ? `/team-requests/tickets/create` : "",
    },
  ];

  const overviewSection = [
    {
      label: `Dashboard`,
      icon: (
        <Box ml="sm" py={5} mt={3}>
          <IconDashboard {...defaultIconProps} />
        </Box>
      ),
      href: `/team-${activeApp.toLowerCase()}s/dashboard`,
    },
    {
      label: `${startCase(activeApp)}`,
      icon: (
        <Box ml="sm" py={5} mt={3}>
          <IconMessage2 {...defaultIconProps} />
        </Box>
      ),
      href: `/team-${activeApp.toLowerCase()}s/${activeApp.toLowerCase()}s`,
    },
    {
      label: `Ticket List`,
      icon: (
        <Box ml="sm" py={5} mt={3}>
          <IconListDetails {...defaultIconProps} />
        </Box>
      ),
      href: `/team-${activeApp.toLowerCase()}s/tickets`,
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
      {requisitionForm &&
      requisitionForm.form_is_hidden === false &&
      requisitionForm.form_team_group.length ? (
        <NavLinkSection links={tempCreateRequest} {...defaultNavLinkProps} />
      ) : null}

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
