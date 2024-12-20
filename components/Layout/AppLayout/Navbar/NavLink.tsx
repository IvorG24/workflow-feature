import {
  getApproverRequestCount,
  getHRIndicatorCount,
} from "@/backend/api/get";
import { useModuleList } from "@/hooks/useModuleStore";
import { useFormList } from "@/stores/useFormStore";
import { useUnreadNotificationCount } from "@/stores/useNotificationStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { useActiveTeam, useTeamList } from "@/stores/useTeamStore";
import {
  useUserTeamMember,
  useUserTeamMemberGroupList,
} from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import { isEmpty } from "@/utils/functions";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { FormTableRow, TeamMemberTableRow } from "@/utils/types";
import {
  Accordion,
  Box,
  Button,
  Menu,
  NavLink,
  Portal,
  ScrollArea,
  Space,
  Stack,
  Text,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import {
  IconBell,
  IconBook,
  IconClipboard,
  IconClockRecord,
  IconCode,
  IconDashboard,
  IconDeviceIpadHorizontalQuestion,
  IconFile,
  IconFileCertificate,
  IconFileDescription,
  IconFilePlus,
  IconFileReport,
  IconFileStack,
  IconFileText,
  IconFiles,
  IconFolderDown,
  IconInfoCircle,
  IconListDetails,
  IconPhoneCall,
  IconQuestionMark,
  IconReportAnalytics,
  IconSettingsAutomation,
  IconShieldCheck,
  IconTableExport,
  IconTerminal,
  IconTicket,
  IconTools,
  IconUserCircle,
  IconUsersGroup,
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NavLinkSection from "./NavLinkSection";

type HRIndicatorCountType = {
  applicationInformation: number;
  hrPhoneInterview: number;
  technicalInterview1: number;
  technicalInterview2: number;
  tradeTest: number;
  backgroundCheck: number;
  jobOffer: number;
};

type NavigationLinkType = {
  idx: number;
  link: {
    label: string;
    icon?: JSX.Element;
  };
  onClick: () => (void | Promise<void> | Promise<boolean>) | null;
  active: boolean;
};

const NavigationLink = ({ idx, link, onClick, active }: NavigationLinkType) => {
  return (
    <NavLink
      px={0}
      key={`navLink-${idx}`}
      label={link.label}
      style={{ borderRadius: 5, display: "flex" }}
      icon={link.icon ? link.icon : null}
      active={active}
      onClick={onClick}
    />
  );
};

const ReviewAppNavLink = () => {
  const router = useRouter();
  const pathName = usePathname();
  const defaultIconProps = { size: 20, stroke: 1 };
  const defaultNavLinkProps = { px: 0 };
  const defaultNavLinkContainerProps = { py: 5, mt: 3 };
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [userNotificationCount, setUserNotificationCount] = useState(0);
  const [openedFormAccordion, setOpenedFormAccordion] = useState<string[]>([]);
  const [openedRequestAccordion, setOpenedRequestAccordion] = useState<
    string[]
  >([]);
  const [hrIndicatorCount, setHrIndicatorCount] = useState({
    applicationInformation: 0,
    hrPhoneInterview: 0,
    technicalInterview1: 0,
    technicalInterview2: 0,
    tradeTest: 0,
    backgroundCheck: 0,
    jobOffer: 0,
  });

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
  const teamMemberGroup = useUserTeamMemberGroupList();
  const teamMemberGroups = useUserTeamMemberGroupList();
  const { preferences, initializePreferences, updatePreference } =
    useSidebarStore((state) => ({
      preferences: state.preferences,
      initializePreferences: state.initializePreferences,
      updatePreference: state.setUpdatedPreference,
    }));

  useEffect(() => {
    initializePreferences();
  }, []);

  const createRequestFormList = forms.filter(
    (form) =>
      ![
        "Petty Cash Voucher Balance",
        "Request For Payment Code",
        "Bill of Quantity",
      ].includes(form.form_name) &&
      !form.form_is_public_form &&
      !form.form_is_hidden
  );

  const hrFormNames = [
    "Application Information",
    "Background Investigation",
    "Practical Test",
    "General Assessment",
    "Technical Assessment",
  ];

  const financeFormNames = [
    "Liquidation Reimbursement",
    "Petty Cash Voucher",
    "Petty Cash Voucher Balance",
    "Request for Payment Code",
    "Bill of Quantity",
  ];
  const moduleForms = useModuleList();
  const hrManageForm = forms.filter((form) =>
    hrFormNames.includes(form.form_name)
  );

  const financeManageForm = forms.filter((form) =>
    financeFormNames.includes(form.form_name)
  );

  const operationManageForm = forms.filter(
    (form) => !(hrManageForm.includes(form) || financeManageForm.includes(form))
  );

  const hrRequestForm = createRequestFormList.filter((form) =>
    hrFormNames.includes(form.form_name)
  );

  const financeRequestForm = createRequestFormList.filter((form) =>
    financeFormNames.includes(form.form_name)
  );

  const operationRequestForm = createRequestFormList.filter(
    (form) =>
      !hrFormNames.includes(form.form_name) &&
      !financeFormNames.includes(form.form_name)
  );

  const itemForm = forms.filter(
    (form) => form.form_is_formsly_form && form.form_name === "Item"
  )[0] as unknown as FormTableRow & {
    form_team_group: string[];
  };

  const analyticsMenuOptions = ["Human Resources"];
  const isUserHR =
    teamMemberGroups.includes("HUMAN RESOURCES") ||
    teamMemberGroups.includes("HUMAN RESOURCES COORDINATOR");
  const isUserHRViewer = teamMemberGroups.includes("HUMAN RESOURCES VIEWER");

  const handleRedirectToAnalyticsPage = (option: string) => {
    const url = `/${activeTeamNameToUrl}/analytics/${formatTeamNameToUrlKey(
      option
    )}`;
    switch (option) {
      case "Human Resources":
        if (!isUserHR) {
          notifications.show({
            message: "You do not have permission to access this page.",
            color: "red",
          });
          return;
        }
        break;

      default:
        break;
    }

    router.push(url);
  };

  const renderCreateRequestMenu = () => {
    return (
      <Box h="fit-content">
        <Accordion
          variant="separated"
          multiple
          value={
            openedRequestAccordion && openedRequestAccordion.length > 0
              ? openedRequestAccordion
              : preferences.create
                ? ["create"]
                : []
          }
          onChange={(value) => {
            setOpenedRequestAccordion(value);
            updatePreference("create", value.includes("create"));
          }}
        >
          <Accordion.Item value="create">
            <Accordion.Control>
              <Text size="sm" weight={400}>
                Create
              </Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Menu
                trigger={isMobile ? "click" : "hover"}
                shadow="1px 1px 3px rgba(0, 0, 0, .25)"
                withArrow
                position={isMobile ? "bottom-end" : "right"}
              >
                <Stack
                  spacing={0}
                  align="start"
                  {...defaultNavLinkContainerProps}
                >
                  <Menu.Target>
                    <Box w="100%">
                      <NavigationLink
                        idx={0}
                        link={{
                          label: "Create Request",
                          icon: (
                            <Box ml="sm" {...defaultNavLinkContainerProps}>
                              <IconFile {...defaultIconProps} />
                            </Box>
                          ),
                        }}
                        onClick={() => {
                          return null;
                        }}
                        active={
                          pathName.includes("forms") &&
                          pathName.includes("create") &&
                          !pathName.includes("module-forms")
                        }
                      />
                    </Box>
                  </Menu.Target>
                  <Box w="100%">
                    <NavigationLink
                      idx={0}
                      link={{
                        label: "Create Ticket",
                        icon: (
                          <Box ml="sm" {...defaultNavLinkContainerProps}>
                            <IconTicket {...defaultIconProps} />
                          </Box>
                        ),
                      }}
                      onClick={async () =>
                        await router.push(
                          `/${activeTeamNameToUrl}/tickets/create`
                        )
                      }
                      active={
                        pathName === `/${activeTeamNameToUrl}/tickets/create`
                      }
                    />
                  </Box>
                  <Box w="100%">
                    <NavigationLink
                      idx={0}
                      link={{
                        label: "Create Memo",
                        icon: (
                          <Box ml="sm" {...defaultNavLinkContainerProps}>
                            <IconFileDescription {...defaultIconProps} />
                          </Box>
                        ),
                      }}
                      onClick={async () =>
                        await router.push(`/${activeTeamNameToUrl}/memo/create`)
                      }
                      active={
                        pathName === `/${activeTeamNameToUrl}/memo/create`
                      }
                    />
                  </Box>
                  <Menu
                    trigger={isMobile ? "click" : "hover"}
                    shadow="1px 1px 3px rgba(0, 0, 0, .25)"
                    withArrow
                    position={isMobile ? "bottom-end" : "right"}
                  >
                    <Menu.Target>
                      <Box w="100%">
                        <NavigationLink
                          idx={0}
                          link={{
                            label: "Create Module Request",
                            icon: (
                              <Box ml="sm" {...defaultNavLinkContainerProps}>
                                <IconFileStack {...defaultIconProps} />
                              </Box>
                            ),
                          }}
                          onClick={() => {
                            return null;
                          }}
                          active={
                            pathName.includes("module-forms") &&
                            pathName.includes("create")
                          }
                        />
                      </Box>
                    </Menu.Target>

                    <Portal>
                      <Menu.Dropdown>
                        {moduleForms.map((module) => (
                          <Menu.Item
                            key={module.module_id}
                            onClick={async () =>
                              await router.push(
                                `/${activeTeamNameToUrl}/module-forms/${module.module_id}/create`
                              )
                            }
                          >
                            {module.module_name}
                          </Menu.Item>
                        ))}
                      </Menu.Dropdown>
                    </Portal>
                  </Menu>
                </Stack>

                <Portal>
                  <Menu.Dropdown>
                    <ScrollArea.Autosize mah={300}>
                      {/* HR Forms Section */}
                      {hrRequestForm.length > 0 && (
                        <Accordion variant="contained">
                          <Accordion.Item value="hr">
                            <Accordion.Control>
                              <Text size="sm" weight={400} color="black">
                                Human Resources
                              </Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                              {hrRequestForm
                                .sort((a, b) =>
                                  a.form_name.localeCompare(b.form_name)
                                )
                                .map((form) => (
                                  <Button
                                    key={form.form_id}
                                    onClick={async () =>
                                      await router.push(
                                        `/${activeTeamNameToUrl}/forms/${form.form_id}/create`
                                      )
                                    }
                                  >
                                    {form.form_name}
                                  </Button>
                                ))}
                            </Accordion.Panel>
                          </Accordion.Item>
                        </Accordion>
                      )}

                      {/* Finance Forms Section */}
                      {financeRequestForm.length > 0 && (
                        <Accordion variant="contained">
                          <Accordion.Item value="finance">
                            <Accordion.Control>
                              <Text size="sm" weight={400} color="black">
                                Finance
                              </Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                              {financeRequestForm
                                .sort((a, b) =>
                                  a.form_name.localeCompare(b.form_name)
                                )
                                .map((form) => (
                                  <Menu.Item
                                    key={form.form_id}
                                    onClick={async () =>
                                      await router.push(
                                        `/${activeTeamNameToUrl}/forms/${form.form_id}/create`
                                      )
                                    }
                                  >
                                    {form.form_name}
                                  </Menu.Item>
                                ))}
                            </Accordion.Panel>
                          </Accordion.Item>
                        </Accordion>
                      )}

                      {/* Operation Forms Section */}
                      {operationRequestForm.length > 0 && (
                        <Accordion variant="contained">
                          <Accordion.Item value="operations">
                            <Accordion.Control>
                              <Text size="sm" weight={400} color="black">
                                Operations
                              </Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                              {operationRequestForm
                                .sort((a, b) =>
                                  a.form_name.localeCompare(b.form_name)
                                )
                                .map((form) => (
                                  <Menu.Item
                                    key={form.form_id}
                                    onClick={async () =>
                                      await router.push(
                                        `/${activeTeamNameToUrl}/forms/${form.form_id}/create`
                                      )
                                    }
                                  >
                                    {form.form_name}
                                  </Menu.Item>
                                ))}
                            </Accordion.Panel>
                          </Accordion.Item>
                        </Accordion>
                      )}
                    </ScrollArea.Autosize>
                  </Menu.Dropdown>
                </Portal>
              </Menu>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Box>
    );
  };

  const renderManageFormMenu = () => {
    return (
      <Box h="fit-content">
        <Accordion
          variant="separated"
          multiple
          value={
            openedFormAccordion && openedFormAccordion.length > 0
              ? openedFormAccordion
              : preferences.form
                ? ["form"]
                : []
          }
          onChange={(value) => {
            updatePreference("form", value.includes("form"));
            setOpenedFormAccordion(value);
          }}
        >
          <Accordion.Item value="form">
            <Accordion.Control>
              <Text size="sm" weight={400}>
                Form
              </Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Menu
                trigger={isMobile ? "click" : "hover"}
                shadow="1px 1px 3px rgba(0, 0, 0, .25)"
                withArrow
                position={isMobile ? "bottom-end" : "right"}
              >
                <Stack
                  spacing={0}
                  align="start"
                  {...defaultNavLinkContainerProps}
                >
                  <Menu.Target>
                    <Box w="100%">
                      <NavigationLink
                        idx={0}
                        link={{
                          label:
                            forms.length > 1 ? "Manage Forms" : "Manage Form",
                          icon: (
                            <Box ml="sm" {...defaultNavLinkContainerProps}>
                              <IconFileText {...defaultIconProps} />
                            </Box>
                          ),
                        }}
                        onClick={() => {
                          return null;
                        }}
                        active={pathName === `/${activeTeamNameToUrl}/forms`}
                      />
                    </Box>
                  </Menu.Target>
                  <Box w="100%">
                    <NavigationLink
                      idx={0}
                      link={{
                        label: "Build Form",
                        icon: (
                          <Box ml="sm" {...defaultNavLinkContainerProps}>
                            <IconFilePlus {...defaultIconProps} />
                          </Box>
                        ),
                      }}
                      onClick={async () =>
                        await router.push(`/${activeTeamNameToUrl}/forms/build`)
                      }
                      active={pathName.includes("forms/build")}
                    />
                  </Box>
                </Stack>

                <Portal>
                  <Menu.Dropdown>
                    <Menu.Item
                      w={290}
                      key={"all-form"}
                      onClick={async () =>
                        await router.push(`/${activeTeamNameToUrl}/forms/`)
                      }
                      c="blue"
                    >
                      View All
                    </Menu.Item>
                    <ScrollArea.Autosize mah={300}>
                      {/* HR Forms Section */}
                      {hrManageForm.length > 0 && (
                        <Accordion variant="contained">
                          <Accordion.Item value="hr">
                            <Accordion.Control>
                              <Text size="sm" weight={400} color="black">
                                Human Resources
                              </Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                              {hrManageForm
                                .sort((a, b) =>
                                  a.form_name.localeCompare(b.form_name)
                                )
                                .map((form) => (
                                  <Menu.Item
                                    key={form.form_id}
                                    onClick={async () =>
                                      await router.push(
                                        `/${activeTeamNameToUrl}/forms/${form.form_id}`
                                      )
                                    }
                                  >
                                    {form.form_name}
                                  </Menu.Item>
                                ))}
                            </Accordion.Panel>
                          </Accordion.Item>
                        </Accordion>
                      )}

                      {/* Finance Forms Section */}
                      {financeManageForm.length > 0 && (
                        <Accordion variant="contained">
                          <Accordion.Item value="finance">
                            <Accordion.Control>
                              <Text size="sm" weight={400} color="black">
                                Finance
                              </Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                              {financeManageForm
                                .sort((a, b) =>
                                  a.form_name.localeCompare(b.form_name)
                                )
                                .map((form) => (
                                  <Menu.Item
                                    key={form.form_id}
                                    onClick={async () =>
                                      await router.push(
                                        `/${activeTeamNameToUrl}/forms/${form.form_id}`
                                      )
                                    }
                                  >
                                    {form.form_name}
                                  </Menu.Item>
                                ))}
                            </Accordion.Panel>
                          </Accordion.Item>
                        </Accordion>
                      )}

                      {/* Operation Forms Section */}
                      {operationManageForm.length > 0 && (
                        <Accordion variant="contained">
                          <Accordion.Item value="operations">
                            <Accordion.Control>
                              <Text size="sm" weight={400} color="black">
                                Operations
                              </Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                              {operationManageForm
                                .sort((a, b) =>
                                  a.form_name.localeCompare(b.form_name)
                                )
                                .map((form) => (
                                  <Menu.Item
                                    key={form.form_id}
                                    onClick={async () =>
                                      await router.push(
                                        `/${activeTeamNameToUrl}/forms/${form.form_id}`
                                      )
                                    }
                                  >
                                    {form.form_name}
                                  </Menu.Item>
                                ))}
                            </Accordion.Panel>
                          </Accordion.Item>
                        </Accordion>
                      )}
                    </ScrollArea.Autosize>
                  </Menu.Dropdown>
                </Portal>
              </Menu>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Box>
    );
  };

  const renderMetricsMenu = () => {
    return (
      <Box h="fit-content" mt="md">
        <Accordion
          variant="separated"
          value={preferences.metrics ? "metrics" : null}
          onChange={(value) => updatePreference("metrics", value === "metrics")}
        >
          <Accordion.Item value="metrics">
            <Accordion.Control>
              <Text size="sm" weight={400}>
                Metrics
              </Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Menu
                trigger={isMobile ? "click" : "hover"}
                shadow="1px 1px 3px rgba(0, 0, 0, .25)"
                withArrow
                position={isMobile ? "bottom-end" : "right"}
              >
                <Stack
                  spacing={0}
                  align="start"
                  {...defaultNavLinkContainerProps}
                >
                  <Box w="100%">
                    <NavigationLink
                      idx={0}
                      link={{
                        label: "Dashboard",
                        icon: (
                          <Box ml="sm" {...defaultNavLinkContainerProps}>
                            <IconDashboard {...defaultIconProps} />
                          </Box>
                        ),
                      }}
                      onClick={async () =>
                        await router.push(`/${activeTeamNameToUrl}/dashboard`)
                      }
                      active={pathName.includes("dashboard")}
                    />
                  </Box>
                  <Menu.Target>
                    <Box w="100%">
                      <NavigationLink
                        idx={0}
                        link={{
                          label: "Analytics",
                          icon: (
                            <Box ml="sm" {...defaultNavLinkContainerProps}>
                              <IconTicket {...defaultIconProps} />
                            </Box>
                          ),
                        }}
                        onClick={() => {
                          return null;
                        }}
                        active={pathName.includes("analytics")}
                      />
                    </Box>
                  </Menu.Target>
                  <Box w="100%">
                    <NavigationLink
                      idx={0}
                      link={{
                        label: "SLA",
                        icon: (
                          <Box ml="sm" {...defaultNavLinkContainerProps}>
                            <IconFileReport {...defaultIconProps} />
                          </Box>
                        ),
                      }}
                      onClick={async () =>
                        await router.push(`/${activeTeamNameToUrl}/sla`)
                      }
                      active={pathName.includes("sla")}
                    />
                  </Box>
                  <Box w="100%">
                    <NavigationLink
                      idx={0}
                      link={{
                        label: "Report",
                        icon: (
                          <Box ml="sm" {...defaultNavLinkContainerProps}>
                            <IconReportAnalytics {...defaultIconProps} />
                          </Box>
                        ),
                      }}
                      onClick={async () =>
                        await router.push(`/${activeTeamNameToUrl}/report`)
                      }
                      active={pathName.includes("report")}
                    />
                  </Box>
                </Stack>

                <Portal>
                  <Menu.Dropdown>
                    {analyticsMenuOptions.map((option, index) => (
                      <Menu.Item
                        key={index}
                        onClick={() => handleRedirectToAnalyticsPage(option)}
                      >
                        {option}
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Portal>
              </Menu>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Box>
    );
  };

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
    {
      label: "Create Module Request",
      icon: (
        <Box ml="sm" {...defaultNavLinkContainerProps}>
          <IconFileDescription {...defaultIconProps} />
        </Box>
      ),
      href: itemForm
        ? `/${activeTeamNameToUrl}/forms/${itemForm.form_id}/create`
        : "",
    },
  ];

  const listSection = [
    {
      label: activeTeam.team_id ? "Request List" : "Application List",
      icon: (
        <Box ml="sm" {...defaultNavLinkContainerProps}>
          <IconFiles {...defaultIconProps} />
        </Box>
      ),
      href: activeTeam.team_id
        ? `/${activeTeamNameToUrl}/requests`
        : `/user/requests`,
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
    ...(userTeamMemberData?.team_member_role === "ADMIN" ||
    userTeamMemberData?.team_member_role === "OWNER"
      ? [
          {
            label: `Workflow List`,
            icon: (
              <Box ml="sm" {...defaultNavLinkContainerProps}>
                <IconFolderDown {...defaultIconProps} />
              </Box>
            ),
            href: `/${activeTeamNameToUrl}/workflows`,
          },
        ]
      : []),
    ...(userTeamMemberData?.team_member_role === "ADMIN" ||
    userTeamMemberData?.team_member_role === "OWNER"
      ? [
          {
            label: `Module List`,
            icon: (
              <Box ml="sm" {...defaultNavLinkContainerProps}>
                <IconBook {...defaultIconProps} />
              </Box>
            ),
            href: `/${activeTeamNameToUrl}/modules`,
          },
        ]
      : []),

    {
      label: `Module Request List`,
      icon: (
        <Box ml="sm" {...defaultNavLinkContainerProps}>
          <IconTableExport {...defaultIconProps} />
        </Box>
      ),
      href: `/${activeTeamNameToUrl}/module-request`,
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
    // {
    //   label: "Create Team",
    //   icon: (
    //     <Box ml="sm" {...defaultNavLinkContainerProps}>
    //       <IconCirclePlus {...defaultIconProps} />
    //     </Box>
    //   ),
    //   href: `/create-team`,
    // },
  ];

  const hrSection = [
    ...(isUserHR || isUserHRViewer
      ? [
          {
            label: `Application Information`,
            icon: (
              <Box ml="sm" {...defaultNavLinkContainerProps}>
                <IconInfoCircle {...defaultIconProps} />
              </Box>
            ),
            href: `/${activeTeamNameToUrl}/requests/application-information-spreadsheet-view`,
            withIndicator: Boolean(hrIndicatorCount.applicationInformation),
            indicatorLabel: `${hrIndicatorCount.applicationInformation}`,
          },
          {
            label: `HR Interview`,
            icon: (
              <Box ml="sm" {...defaultNavLinkContainerProps}>
                <IconPhoneCall {...defaultIconProps} />
              </Box>
            ),
            href: `/${activeTeamNameToUrl}/requests/hr-phone-interview-spreadsheet-view`,
            withIndicator: Boolean(hrIndicatorCount.hrPhoneInterview),
            indicatorLabel: `${hrIndicatorCount.hrPhoneInterview}`,
          },
          {
            label: `Department Interview`,
            icon: (
              <Box ml="sm" {...defaultNavLinkContainerProps}>
                <IconCode {...defaultIconProps} />
              </Box>
            ),
            href: `/${activeTeamNameToUrl}/requests/technical-interview-1-spreadsheet-view`,
            withIndicator: Boolean(hrIndicatorCount.technicalInterview1),
            indicatorLabel: `${hrIndicatorCount.technicalInterview1}`,
          },
          {
            label: `Requestor Interview`,
            icon: (
              <Box ml="sm" {...defaultNavLinkContainerProps}>
                <IconTerminal {...defaultIconProps} />
              </Box>
            ),
            href: `/${activeTeamNameToUrl}/requests/technical-interview-2-spreadsheet-view`,
            withIndicator: Boolean(hrIndicatorCount.technicalInterview2),
            indicatorLabel: `${hrIndicatorCount.technicalInterview2}`,
          },
          {
            label: `Practical Test`,
            icon: (
              <Box ml="sm" {...defaultNavLinkContainerProps}>
                <IconTools {...defaultIconProps} />
              </Box>
            ),
            href: `/${activeTeamNameToUrl}/requests/trade-test-spreadsheet-view`,
            withIndicator: Boolean(hrIndicatorCount.tradeTest),
            indicatorLabel: `${hrIndicatorCount.tradeTest}`,
          },
          {
            label: `Background Check`,
            icon: (
              <Box ml="sm" {...defaultNavLinkContainerProps}>
                <IconShieldCheck {...defaultIconProps} />
              </Box>
            ),
            href: `/${activeTeamNameToUrl}/requests/background-check-spreadsheet-view`,
            withIndicator: Boolean(hrIndicatorCount.backgroundCheck),
            indicatorLabel: `${hrIndicatorCount.backgroundCheck}`,
          },
          {
            label: `Job Offer`,
            icon: (
              <Box ml="sm" {...defaultNavLinkContainerProps}>
                <IconFileCertificate {...defaultIconProps} />
              </Box>
            ),
            href: `/${activeTeamNameToUrl}/requests/job-offer-spreadsheet-view`,
            withIndicator: Boolean(hrIndicatorCount.jobOffer),
            indicatorLabel: `${hrIndicatorCount.jobOffer}`,
          },
          ...(isUserHR
            ? [
                {
                  label: `Representing Application`,
                  icon: (
                    <Box ml="sm" {...defaultNavLinkContainerProps}>
                      <IconUserCircle {...defaultIconProps} />
                    </Box>
                  ),
                  href: `/${activeTeamNameToUrl}/hr/application-information`,
                  indicatorLabel: `${hrIndicatorCount.applicationInformation}`,
                },
              ]
            : []),
        ]
      : []),
    ...(userTeamMemberData?.team_member_role === "ADMIN" && isUserHR
      ? [
          {
            label: `Questionnaire List`,
            icon: (
              <Box ml="sm" {...defaultNavLinkContainerProps}>
                <IconQuestionMark {...defaultIconProps} />
              </Box>
            ),
            href: `/${activeTeamNameToUrl}/technical-question`,
          },
        ]
      : []),
    ...(userTeamMemberData?.team_member_role === "ADMIN" && isUserHR
      ? [
          {
            label: `Practical Test Form`,
            icon: (
              <Box ml="sm" {...defaultNavLinkContainerProps}>
                <IconClipboard {...defaultIconProps} />
              </Box>
            ),
            href: `/${activeTeamNameToUrl}/practical-test-form`,
          },
        ]
      : []),
    ...(userTeamMemberData?.team_member_role === "ADMIN" && isUserHR
      ? [
          {
            label: `Preferred Position`,
            icon: (
              <Box ml="sm" {...defaultNavLinkContainerProps}>
                <IconDeviceIpadHorizontalQuestion {...defaultIconProps} />
              </Box>
            ),
            href: `/${activeTeamNameToUrl}/preferred-position`,
          },
        ]
      : []),
    ...(teamMemberGroup.includes("DEPLOYMENT AND RECORDS")
      ? [
          {
            label: `Deployment And Records`,
            icon: (
              <Box ml="sm" {...defaultNavLinkContainerProps}>
                <IconClockRecord {...defaultIconProps} />
              </Box>
            ),
            href: `/${activeTeamNameToUrl}/deployment-records`,
          },
        ]
      : []),
  ];

  // const teamSection = [
  //   {
  //     label: "Create Team",
  //     icon: (
  //       <Box ml="sm" {...defaultNavLinkContainerProps}>
  //         <IconCirclePlus {...defaultIconProps} />
  //       </Box>
  //     ),
  //     href: `/create-team`,
  //   },
  // ];

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

  const joinTeamSection = [
    {
      label: "Join Team",
      icon: (
        <Box ml="sm" {...defaultNavLinkContainerProps}>
          <IconUsersGroup {...defaultIconProps} />
        </Box>
      ),
      href: `/user/join-team`,
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
    const fetchHrIndicatorCount = async (
      userTeamMemberData: TeamMemberTableRow
    ) => {
      const count = await getHRIndicatorCount(supabaseClient, {
        teamMemberId: userTeamMemberData.team_member_id,
      });

      setHrIndicatorCount(count as HRIndicatorCountType);
    };
    if (userTeamMemberData) {
      if (userTeamMemberData.team_member_role === "APPROVER") {
        fetchApproverRequestCount(userTeamMemberData);
      }
      if (teamMemberGroup.includes("HUMAN RESOURCES")) {
        fetchHrIndicatorCount(userTeamMemberData);
      }
    }
  }, [supabaseClient, unreadNotificationCount, userTeamMemberData]);

  return (
    <>
      {!isEmpty(activeTeam) && hasTeam
        ? // <NavLinkSection
          //   label={"Metrics"}
          //   links={metricsSection}
          //   {...defaultNavLinkProps}
          // />
          renderMetricsMenu()
        : null}

      {!isEmpty(activeTeam) && hasTeam && hrSection.length ? (
        <NavLinkSection
          accordionItemValue="hr"
          accordionValue={preferences.humanResources ? "hr" : null}
          accordionOnChange={(value) => {
            updatePreference("humanResources", value === "hr");
          }}
          label={"Human Resources"}
          links={hrSection}
          {...defaultNavLinkProps}
        />
      ) : null}

      {itemForm &&
      itemForm.form_is_hidden === false &&
      itemForm.form_team_group.length &&
      hasTeam ? (
        forms.length > 1 ? (
          renderCreateRequestMenu()
        ) : (
          <NavLinkSection
            accordionItemValue="create"
            accordionValue={preferences.create ? "create" : null}
            accordionOnChange={(value) => {
              updatePreference("create", value === "create");
            }}
            label="Create"
            links={createSection}
            {...defaultNavLinkProps}
          />
        )
      ) : null}

      {!isEmpty(activeTeam) && hasTeam ? (
        <NavLinkSection
          accordionItemValue="list"
          accordionValue={preferences.list ? "list" : null}
          accordionOnChange={(value) => {
            updatePreference("list", value === "list");
          }}
          label={"List"}
          links={listSection}
          {...defaultNavLinkProps}
        />
      ) : (
        <NavLinkSection
          accordionItemValue="list"
          accordionValue={preferences.list ? "list" : null}
          accordionOnChange={(value) => {
            updatePreference("list", value === "list");
          }}
          label={"List"}
          links={listSection.slice(0, 2)}
          {...defaultNavLinkProps}
        />
      )}

      {forms.length > 0 && (
        <>
          {
            (userTeamMemberData?.team_member_role === "ADMIN" ||
              userTeamMemberData?.team_member_role === "OWNER") &&
              renderManageFormMenu()
            // <>
            //   <NavLinkSection
            //     label={"Form"}
            //     links={[]}
            //     {...defaultNavLinkProps}
            //   />
            //   {renderManageFormMenu()}
            //   {/* <NavLinkSection
            //     label={"Form"}
            //     links={ownerAndAdminFormSection}
            //     {...defaultNavLinkProps}
            //   /> */}
            // </>
          }
        </>
      )}

      {!isEmpty(activeTeam) && hasTeam && (
        <NavLinkSection
          accordionItemValue="team"
          accordionValue={preferences.team ? "team" : null}
          accordionOnChange={(value) => {
            updatePreference("team", value === "team");
          }}
          label={"Team"}
          links={teamSectionWithManageTeam}
          {...defaultNavLinkProps}
        />
      )}

      {!hasTeam && (
        <NavLinkSection
          accordionItemValue="team"
          accordionValue={preferences.team ? "team" : null}
          accordionOnChange={(value) => {
            updatePreference("team", value === "team");
          }}
          label="Team"
          links={joinTeamSection}
          {...defaultNavLinkProps}
        />
      )}

      {(userTeamMemberData?.team_member_role === "ADMIN" ||
        userTeamMemberData?.team_member_role === "OWNER") && (
        <>
          <NavLinkSection
            accordionItemValue="jira"
            accordionValue={preferences.jira ? "jira" : null}
            accordionOnChange={(value) => {
              updatePreference("jira", value === "jira");
            }}
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
