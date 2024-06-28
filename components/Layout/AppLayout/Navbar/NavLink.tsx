import { getApproverRequestCount } from "@/backend/api/get";
import { useFormList } from "@/stores/useFormStore";
import { useUnreadNotificationCount } from "@/stores/useNotificationStore";
import { useActiveTeam, useTeamList } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { UNHIDEABLE_FORMLY_FORMS } from "@/utils/constant";
import { Database } from "@/utils/database";
import { isEmpty } from "@/utils/functions";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { FormTableRow, TeamMemberTableRow } from "@/utils/types";
import {
  Box,
  Button,
  Divider,
  Menu,
  Portal,
  Space,
  Stack,
  Text,
} from "@mantine/core";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import {
  IconBell,
  IconCirclePlus,
  IconDashboard,
  IconFile,
  IconFileDescription,
  IconFilePlus,
  IconFileReport,
  IconFileStack,
  IconFileText,
  IconFiles,
  IconListDetails,
  IconReportAnalytics,
  IconSettingsAutomation,
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

  const supabaseClient = createPagesBrowserClient<Database>();
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

  const itemForm = forms.filter(
    (form) => form.form_is_formsly_form && form.form_name === "Item"
  )[0] as unknown as FormTableRow & {
    form_team_group: string[];
  };

  const renderCreateRequestMenu = () => {
    return (
      <Box h="fit-content" mt="md">
        <Text size="xs" weight={400}>
          Create
        </Text>
        <Menu
          shadow="1px 1px 3px rgba(0, 0, 0, .25)"
          withArrow
          position="right"
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
            <Button
              fw={400}
              leftIcon={<IconFileDescription {...defaultIconProps} />}
              variant="transparent"
              onClick={() => router.push(`/${activeTeamNameToUrl}/memo/create`)}
            >
              Create Memo
            </Button>
          </Stack>

          <Portal>
            <Menu.Dropdown>
              {unhiddenForms
                .sort((a, b) => a.form_name.localeCompare(b.form_name))
                .map((form) => (
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
          </Portal>
        </Menu>
      </Box>
    );
  };

  const renderManageFormMenu = () => {
    return (
      <Box h="fit-content">
        <Menu
          shadow="1px 1px 3px rgba(0, 0, 0, .25)"
          withArrow
          position="right"
        >
          <Stack align="start" {...defaultNavLinkContainerProps}>
            <Menu.Target>
              <Button
                fw={400}
                leftIcon={<IconFileText {...defaultIconProps} />}
                variant="transparent"
              >
                Manage Form{unhiddenForms.length > 1 ? "s" : ""} ({forms.length}
                )
              </Button>
            </Menu.Target>
            <Button
              fw={400}
              leftIcon={<IconFilePlus {...defaultIconProps} />}
              variant="transparent"
              onClick={() => router.push(`/${activeTeamNameToUrl}/forms/build`)}
            >
              Build Form
            </Button>
          </Stack>

          <Portal>
            <Menu.Dropdown>
              <Menu.Item
                key={"all-form"}
                onClick={() => router.push(`/${activeTeamNameToUrl}/forms/`)}
                c="blue"
              >
                View All
              </Menu.Item>
              <Divider />
              {unhiddenForms.map((form) => (
                <Menu.Item
                  key={form.form_id}
                  onClick={() =>
                    router.push(`/${activeTeamNameToUrl}/forms/${form.form_id}`)
                  }
                >
                  {form.form_name}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Portal>
        </Menu>
      </Box>
    );
  };

  const metricsSection = [
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
      label: `SLA`,
      icon: (
        <Box ml="sm" {...defaultNavLinkContainerProps}>
          <IconFileReport {...defaultIconProps} />
        </Box>
      ),
      href: `/${activeTeamNameToUrl}/sla`,
    },
    {
      label: `Report`,
      icon: (
        <Box ml="sm" {...defaultNavLinkContainerProps}>
          <IconReportAnalytics {...defaultIconProps} />
        </Box>
      ),
      href: `/${activeTeamNameToUrl}/report`,
    },
  ];

  const createSection = [
    {
      label: "Create Request",
      icon: (
        <Box ml="sm" {...defaultNavLinkContainerProps}>
          <IconFile {...defaultIconProps} />
        </Box>
      ),
      href: itemForm
        ? `/${activeTeamNameToUrl}/forms/${itemForm.form_id}/create`
        : "",
    },
    {
      label: "Create Ticket",
      icon: (
        <Box ml="sm" {...defaultNavLinkContainerProps}>
          <IconTicket {...defaultIconProps} />
        </Box>
      ),
      href: itemForm ? `/${activeTeamNameToUrl}/tickets/create` : "",
    },
    {
      label: "Create Memo",
      icon: (
        <Box ml="sm" {...defaultNavLinkContainerProps}>
          <IconFileDescription {...defaultIconProps} />
        </Box>
      ),
      href: `/${activeTeamNameToUrl}/memo/create`,
    },
  ];

  const listSection = [
    {
      label: `Request List`,
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
    {
      label: `Memo List`,
      icon: (
        <Box ml="sm" {...defaultNavLinkContainerProps}>
          <IconFileStack {...defaultIconProps} />
        </Box>
      ),
      href: `/${activeTeamNameToUrl}/memo`,
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

  const jiraSection = [
    {
      label: "Manage Automation",
      icon: (
        <Box ml="sm" {...defaultNavLinkContainerProps}>
          <IconSettingsAutomation {...defaultIconProps} />
        </Box>
      ),
      href: `/${activeTeamNameToUrl}/jira/settings`,
    },
  ];

  useEffect(() => {
    const fetchApproverRequestCount = async (
      userTeamMemberData: TeamMemberTableRow
    ) => {
      const pendingRequestCount = await getApproverRequestCount(
        supabaseClient,
        {
          teamMemberId: userTeamMemberData.team_member_id,
          status: "PENDING",
        }
      );
      
      setUserNotificationCount(pendingRequestCount + unreadNotificationCount);
    };
    if (
      userTeamMemberData &&
      userTeamMemberData.team_member_role === "APPROVER"
    ) {
      fetchApproverRequestCount(userTeamMemberData);
    }
  }, [supabaseClient, unreadNotificationCount, userTeamMemberData]);

  return (
    <>
      {!isEmpty(activeTeam) && hasTeam ? (
        <NavLinkSection
          label={"Metrics"}
          links={metricsSection}
          {...defaultNavLinkProps}
        />
      ) : null}

      {itemForm &&
      itemForm.form_is_hidden === false &&
      itemForm.form_team_group.length &&
      hasTeam ? (
        unhiddenForms.length > 1 ? (
          renderCreateRequestMenu()
        ) : (
          <NavLinkSection
            label="Create"
            links={createSection}
            {...defaultNavLinkProps}
          />
        )
      ) : null}

      {!isEmpty(activeTeam) && hasTeam ? (
        <NavLinkSection
          label={"List"}
          links={listSection}
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
            <>
              <NavLinkSection
                label={"Form"}
                links={[]}
                {...defaultNavLinkProps}
              />
              {/* <NavLinkSection
                label={"Form"}
                links={ownerAndAdminFormSection}
                {...defaultNavLinkProps}
              /> */}
              {renderManageFormMenu()}
            </>
          )}
        </>
      )}

      {(userTeamMemberData?.team_member_role === "ADMIN" ||
        userTeamMemberData?.team_member_role === "OWNER") && (
        <>
          <NavLinkSection
            label={"Jira"}
            links={jiraSection}
            {...defaultNavLinkProps}
          />
        </>
      )}

      <Space h="sm" />
    </>
  );
};

export default ReviewAppNavLink;
