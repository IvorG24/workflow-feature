import { Group, Text, UnstyledButton } from "@mantine/core";
import { useRouter } from "next/router";

export type NavbarLinkProps = {
  //   icon: React.ReactNode;
  //   color: string;
  label: string;
};

// function NavbarLink({ icon, color, label }: NavbarLinkProps) {
function NavbarLink({ label }: NavbarLinkProps) {
  const router = useRouter();

  return (
    <UnstyledButton
      sx={(theme) => ({
        display: "block",
        width: "100%",
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color:
          theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

        "&:hover": {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.colors.gray[0],
        },
      })}
    >
      <Group position="apart">
        {/* <ThemeIcon color={color} variant="light">
          {icon}
        </ThemeIcon> */}
        <Text
          onClick={() =>
            router.push(
              `/teams/${router.query.teamName}/forms/${router.query.formName}/edit`
            )
          }
          size="sm"
        >
          {label}
        </Text>
      </Group>
    </UnstyledButton>
  );
}

export default NavbarLink;
