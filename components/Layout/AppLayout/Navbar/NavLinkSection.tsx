import {
  Accordion,
  Badge,
  Box,
  Group,
  NavLink,
  NavLinkProps,
  Stack,
  Text,
} from "@mantine/core";
import { useRouter } from "next/router";
import { ReactNode } from "react";

export type NavLinkType = {
  label: string;
  icon?: ReactNode;
  href: string;
  withIndicator?: boolean;
  indicatorLabel?: string;
};

type NavLinkSectionProps = {
  accordionItemValue: string;
  accordionValue: string | null;
  accordionOnChange: (value: string) => void;
  label?: string;
  links: NavLinkType[];
} & NavLinkProps;

const isPathActive = (path: string, segment: string): boolean => {
  return path.includes(segment) && path.endsWith(segment);
};

const NavLinkSection = ({
  accordionItemValue,
  accordionValue,
  accordionOnChange,
  label,
  links,
  rightSection,
  ...props
}: NavLinkSectionProps) => {
  const router = useRouter();

  return (
    <Box h="fit-content">
      <Accordion
        variant="separated"
        value={accordionValue}
        onChange={accordionOnChange}
      >
        <Accordion.Item value={accordionItemValue}>
          <Accordion.Control>
            <Text mb={4} size="sm" weight={400}>
              {label}
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack spacing={0}>
              {links.map((link, idx) => {
                return (
                  <NavLink
                    key={`navLink-${idx}`}
                    label={
                      link.withIndicator ? (
                        <Group>
                          <Text>{link.label}</Text>
                          <Badge
                            px={6}
                            w="fit-content"
                            color="red"
                            variant="filled"
                            radius="xl"
                            sx={{ fontSize: "14px", fontWeight: 400 }}
                          >
                            {link.indicatorLabel}
                          </Badge>
                        </Group>
                      ) : (
                        link.label
                      )
                    }
                    style={{ borderRadius: 5 }}
                    icon={link.icon ? link.icon : null}
                    px="xl"
                    active={
                      link.label === "Manage Automation"
                        ? router.pathname.includes("jira") &&
                          router.pathname.includes("settings")
                        : link.label === "Manage Team"
                        ? router.pathname.includes("settings") &&
                          !router.pathname.includes("jira")
                        : link.label === "Application List"
                        ? router.pathname.endsWith("/requests")
                        : link.label === "Request List"
                        ? isPathActive(router.pathname, "/requests")
                        : link.label === "Application Information"
                        ? isPathActive(
                            router.pathname,
                            "/requests/application-information-spreadsheet-view"
                          )
                        : link.label === "HR Interview"
                        ? isPathActive(
                            router.pathname,
                            "/requests/hr-phone-interview-spreadsheet-view"
                          )
                        : link.label === "Department Interview"
                        ? isPathActive(
                            router.pathname,
                            "/requests/technical-interview-1-spreadsheet-view"
                          )
                        : link.label === "Requestor Interview"
                        ? isPathActive(
                            router.pathname,
                            "/requests/technical-interview-2-spreadsheet-view"
                          )
                        : link.label === "Practical Test"
                        ? isPathActive(
                            router.pathname,
                            "/requests/trade-test-spreadsheet-view"
                          )
                        : link.label === "Questionnaire List"
                        ? isPathActive(router.pathname, "/technical-question")
                        : link.label === "Practical Test Form"
                        ? isPathActive(router.pathname, "/practical-test-form")
                        : link.label === "Create Ticket"
                        ? isPathActive(router.pathname, "/tickets/create")
                        : link.label === "Ticket List"
                        ? isPathActive(router.pathname, "/tickets")
                        : link.label === "Create Memo"
                        ? isPathActive(router.pathname, "/memo/create")
                        : link.label === "Memo List"
                        ? isPathActive(router.pathname, "/memo")
                        : router.pathname.includes(
                            link.label.split(" ")[0].toLowerCase()
                          )
                    }
                    onClick={async () => await router.push(link.href)}
                    rightSection={rightSection ? rightSection : <></>}
                    {...props}
                  />
                );
              })}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Box>
  );
};

export default NavLinkSection;
