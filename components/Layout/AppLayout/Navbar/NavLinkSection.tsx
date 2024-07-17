import {
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
  label?: string;
  links: NavLinkType[];
} & NavLinkProps;

const NavLinkSection = ({
  label,
  links,
  rightSection,
  ...props
}: NavLinkSectionProps) => {
  const router = useRouter();

  return (
    <Box h="fit-content" mt="sm">
      <Text mb={4} size="xs" weight={400}>
        {label}
      </Text>
      <Stack spacing={0}>
        {links.map((link, idx) => (
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
            active={router.pathname === link.href}
            onClick={async () => await router.push(link.href)}
            rightSection={rightSection ? rightSection : <></>}
            {...props}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default NavLinkSection;
