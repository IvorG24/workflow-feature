import { getUnresolvedRequestListPerApprover } from "@/backend/api/get";
import { useFormList } from "@/stores/useFormStore";
import { useUnreadNotificationCount } from "@/stores/useNotificationStore";
import {
  useActiveApp,
  useActiveTeam,
  useTeamList,
} from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { UNHIDEABLE_FORMLY_FORMS } from "@/utils/constant";
import { Database } from "@/utils/database";
import { isEmpty } from "@/utils/functions";
import { formatTeamNameToUrlKey, startCase } from "@/utils/string";
import { FormTableRow } from "@/utils/types";
import { Box, Button, Menu, Select, Space, Stack, Text } from "@mantine/core";
import { usePrevious } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import {
  IconBell,
  IconCirclePlus,
  IconDashboard,
  IconFile,
  IconFilePlus,
  IconFileText,
  IconFiles,
  IconListDetails,
  IconSearch,
  IconTicket,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NavLinkSection from "./NavLinkSection";

const ReviewAppNavLink = () => {
  const defaultIconProps = { size: 20, stroke: 1 };
  const defaultNavLinkProps = { px: 0 };
  const defaultNavLinkContainerProps = { py: 5, mt: 3 };

  const [userNotificationCount, setUserNotificationCount] = useState(0);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);

  const supabaseClient = createPagesBrowserClient<Database>();
  const activeApp = useActiveApp();
  const activeTeam = useActiveTeam();
  const teamList = useTeamList();
  const hasTeam = teamList.length > 0;
  const forms = useFormList();
  const userTeamMemberData = useUserTeamMember();
  const unreadNotificationCount = useUnreadNotificationCount();
  const activeTeamNameToUrl = formatTeamNameToUrlKey(
    activeTeam.team_name ?? ""
  );
  const router = useRouter();
  const unhiddenForms = forms.filter(
    (form) => !UNHIDEABLE_FORMLY_FORMS.includes(form.form_name)
  );

  const previousTeamId = usePrevious(activeTeam.team_id);

  const isFormslyTeam = forms.some((form) => form.form_is_formsly_form);

  const rfForm = forms.filter(
    (form) => form.form_is_formsly_form && form.form_name === "Requisition"
  )[0];
  const requisitionForm = rfForm as unknown as FormTableRow & {
    form_team_group: string[];
  };

  const renderFormMenu = () => {
    return (
      <Box h="fit-content" mt="md">
        <Menu
          shadow="1px 1px 3px rgba(0, 0, 0, .25)"
          withArrow
          position="bottom-start"
        >
          <Stack align="start" {...defaultNavLinkContainerProps}>
            <Menu.Target>
              <Button
                fw={400}
                leftIcon={<IconFile {...defaultIconProps} />}
                variant="transparent"
              >
                Create Request
              </Button>
            </Menu.Target>
            <Button
              fw={400}
              leftIcon={<IconTicket {...defaultIconProps} />}
              variant="transparent"
              onClick={() =>
                router.push(`/${activeTeamNameToUrl}/tickets/create`)
              }
            >
              Create Ticket
            </Button>
          </Stack>

          <Menu.Dropdown>
            {unhiddenForms.map((form) => (
              <Menu.Item
                key={form.form_id}
                onClick={() =>
                  router.push(
                    `/${activeTeamNameToUrl}/forms/${form.form_id}/create`
                  )
                }
              >
                {form.form_name}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </Box>
    );
  };

  const tempCreateRequest = [
    {
      label: "Create Request",
      icon: (
        <Box ml="sm" {...defaultNavLinkContainerProps}>
          <IconFile {...defaultIconProps} />
        </Box>
      ),
      href: requisitionForm
        ? `/${activeTeamNameToUrl}/forms/${requisitionForm.form_id}/create`
        : "",
    },
    {
      label: "Create Ticket",
      icon: (
        <Box ml="sm" {...defaultNavLinkContainerProps}>
          <IconTicket {...defaultIconProps} />
        </Box>
      ),
      href: requisitionForm ? `/${activeTeamNameToUrl}/tickets/create` : "",
    },
  ];

  const overviewSection = [
    {
      label: `Dashboard`,
      icon: (
        <Box ml="sm" {...defaultNavLinkContainerProps}>
          <IconDashboard {...defaultIconProps} />
        </Box>
      ),
      href: `/${activeTeamNameToUrl}/dashboard`,
    },
    {
      label: `${startCase(activeApp)} List`,
      icon: (
        <Box ml="sm" {...defaultNavLinkContainerProps}>
          <IconFiles {...defaultIconProps} />
        </Box>
      ),
      href: `/${activeTeamNameToUrl}/requests`,
    },
    {
      label: `Notification List`,
      icon: (
        <Box ml="sm" {...defaultNavLinkContainerProps}>
          <IconBell {...defaultIconProps} />
        </Box>
      ),
      href: `/user/notification`,
      withIndicator: userNotificationCount > 0,
      indicatorLabel: `${userNotificationCount}`,
    },
    {
      label: `Ticket List`,
      icon: (
        <Box ml="sm" {...defaultNavLinkContainerProps}>
          <IconListDetails {...defaultIconProps} />
        </Box>
      ),
      href: `/${activeTeamNameToUrl}/tickets`,
    },
  ];

  const teamSectionWithManageTeam = [
    {
      label: "Manage Team",
      icon: (
        <Box ml="sm" {...defaultNavLinkContainerProps}>
          <IconUsersGroup {...defaultIconProps} />
        </Box>
      ),
      href: `/${activeTeamNameToUrl}/settings`,
    },
    {
      label: "Create Team",
      icon: (
        <Box ml="sm" {...defaultNavLinkContainerProps}>
          <IconCirclePlus {...defaultIconProps} />
        </Box>
      ),
      href: `/create-team`,
    },
  ];

  const teamSection = [
    {
      label: "Create Team",
      icon: (
        <Box ml="sm" {...defaultNavLinkContainerProps}>
          <IconCirclePlus {...defaultIconProps} />
        </Box>
      ),
      href: `/create-team`,
    },
  ];

  const ownerAndAdminFormSection = [
    {
      label: `Manage Form${unhiddenForms.length > 1 ? "s" : ""} (${
        isFormslyTeam
          ? forms.length - UNHIDEABLE_FORMLY_FORMS.length
          : forms.length
      })`,
      icon: (
        <Box ml="sm" {...defaultNavLinkContainerProps}>
          <IconFileText {...defaultIconProps} />
        </Box>
      ),
      href: `/${activeTeamNameToUrl}/forms`,
    },
    {
      label: "Build Form",
      icon: (
        <Box ml="sm" {...defaultNavLinkContainerProps}>
          <IconFilePlus {...defaultIconProps} />
        </Box>
      ),
      href: `/${activeTeamNameToUrl}/forms/build`,
    },
  ];

  const handleFormSelection = (value: string | null) => {
    setSelectedForm(value);
    if (!value) return;
    const formMatch = unhiddenForms.find((form) => form.form_name === value);

    if (!formMatch) {
      return notifications.show({
        message: "Form cannot be found.",
        color: "red",
      });
    }

    router.push(`/${activeTeamNameToUrl}/forms/${formMatch.form_id}`);
  };

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

  useEffect(() => {
    if (activeTeam.team_id !== previousTeamId) {
      setSelectedForm(null);
    }
  }, [activeTeam, previousTeamId]);

  return (
    <>
      {requisitionForm &&
      requisitionForm.form_is_hidden === false &&
      requisitionForm.form_team_group.length &&
      hasTeam ? (
        unhiddenForms.length > 1 ? (
          renderFormMenu()
        ) : (
          <NavLinkSection links={tempCreateRequest} {...defaultNavLinkProps} />
        )
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

      {forms.length > 0 && (
        <>
          {(userTeamMemberData?.team_member_role === "ADMIN" ||
            userTeamMemberData?.team_member_role === "OWNER") && (
            <NavLinkSection
              label={"Form"}
              links={ownerAndAdminFormSection}
              {...defaultNavLinkProps}
            />
          )}
          <Select
            label={
              <Text size="xs" weight={400}>
                Edit Form
              </Text>
            }
            mt="sm"
            searchable
            clearable
            placeholder="Search and select a form"
            icon={<IconSearch size={12} stroke={1.5} />}
            value={selectedForm}
            data={unhiddenForms.map((form) => form.form_name)}
            onChange={handleFormSelection}
            styles={{
              dropdown: { maxWidth: "fit-content" },
            }}
          />
        </>
      )}

      <Space h="sm" />
    </>
  );
};

export default ReviewAppNavLink;
