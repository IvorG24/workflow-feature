import { Box, NavLink, NavLinkProps, Stack, Text } from "@mantine/core";
import { useRouter } from "next/router";
import { ReactNode } from "react";

export type NavLinkType = {
  label: string;
  icon?: ReactNode;
  href: string;
};

type NavLinkSectionProps = {
  label?: string;
  links: NavLinkType[];
} & NavLinkProps;

const NavLinkSection = ({ label, links, ...props }: NavLinkSectionProps) => {
  const router = useRouter();

  return (
    <Box h="fit-content" mt="sm">
      <Text mb={4} size="xs" weight={400}>
        {label}
      </Text>
      <Stack spacing={0}>
        {links.map((link, idx) => (
          <NavLink
            label={link.label}
            style={{ borderRadius: 5 }}
            icon={link.icon ? link.icon : null}
            key={`navLink-${idx}`}
            px="xl"
            active={router.pathname === link.href}
            onClick={() => router.push(link.href)}
            {...props}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default NavLinkSection;
