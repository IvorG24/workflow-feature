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
import { usePathname } from "next/navigation";
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
  const pathName = usePathname();
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
                    active={pathName === link.href}
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
