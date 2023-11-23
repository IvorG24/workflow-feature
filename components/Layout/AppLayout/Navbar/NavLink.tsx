import { getUnresolvedRequestListPerApprover } from "@/backend/api/get";
import { useFormList } from "@/stores/useFormStore";
import { useUnreadNotificationCount } from "@/stores/useNotificationStore";
import {
  useActiveApp,
  useActiveTeam,
  useTeamList,
} from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import { isEmpty } from "@/utils/functions";
import { startCase } from "@/utils/string";
import { FormTableRow } from "@/utils/types";
import { Box, Space } from "@mantine/core";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import {
  IconBell,
  IconCirclePlus,
  IconDashboard,
  IconFile,
  IconFiles,
  IconListDetails,
  IconTicket,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import NavLinkSection from "./NavLinkSection";

const ReviewAppNavLink = () => {
  const defaultIconProps = { size: 20, stroke: 1 };
  const defaultNavLinkProps = { px: 0 };

  const [userNotificationCount, setUserNotificationCount] = useState(0);

  const supabaseClient = createPagesBrowserClient<Database>();
  const activeApp = useActiveApp();
  const activeTeam = useActiveTeam();
  const teamList = useTeamList();
  const hasTeam = teamList.length > 0;
  const forms = useFormList();
  const userTeamMemberData = useUserTeamMember();
  const unreadNotificationCount = useUnreadNotificationCount();

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
      label: `${startCase(activeApp)} List`,
      icon: (
        <Box ml="sm" py={5} mt={3}>
          <IconFiles {...defaultIconProps} />
        </Box>
      ),
      href: `/team-${activeApp.toLowerCase()}s/${activeApp.toLowerCase()}s`,
    },
    {
      label: `Notification List`,
      icon: (
        <Box ml="sm" py={5} mt={3}>
          <IconBell {...defaultIconProps} />
        </Box>
      ),
      href: `/team-${activeApp.toLowerCase()}s/notification`,
      withIndicator: userNotificationCount > 0,
      indicatorLabel: `${userNotificationCount}`,
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

  useEffect(() => {
    const fetchApproverRequestList = async () => {
      if (!userTeamMemberData) return;
      const unresolvedRequestList = await getUnresolvedRequestListPerApprover(
        supabaseClient,
        {
          teamMemberId: userTeamMemberData.team_member_id,
        }
      );
      const pendingRequestList = unresolvedRequestList.filter(
        (request) =>
          request.request_signer_status === "PENDING" &&
          request.request.request_status === "PENDING"
      );

      setUserNotificationCount(
        pendingRequestList.length + unreadNotificationCount
      );
    };
    fetchApproverRequestList();
  }, [supabaseClient, unreadNotificationCount, userTeamMemberData]);

  return (
    <>
      {requisitionForm &&
      requisitionForm.form_is_hidden === false &&
      requisitionForm.form_team_group.length ? (
        <NavLinkSection links={tempCreateRequest} {...defaultNavLinkProps} />
      ) : null}

      {!isEmpty(activeTeam) && hasTeam ? (
        <NavLinkSection
          label={"Overview"}
          links={overviewSection}
          {...defaultNavLinkProps}
        />
      ) : null}

      <NavLinkSection
        label={"Team"}
        links={
          !isEmpty(activeTeam) && hasTeam
            ? teamSectionWithManageTeam
            : teamSection
        }
        {...defaultNavLinkProps}
      />

      <Space h="sm" />
    </>
  );
};

export default ReviewAppNavLink;
