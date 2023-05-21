import { Box, NavLink, NavLinkProps, Stack, Text } from "@mantine/core";
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
  return (
    <Box h="fit-content">
      <Text mb={4} size="xs" weight={400}>
        {label}
      </Text>
      <Stack spacing={0}>
        {links.map((link, idx) => (
          <NavLink
            label={link.label}
            icon={link.icon ? link.icon : null}
            key={`navLink-${idx}`}
            {...props}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default NavLinkSection;
