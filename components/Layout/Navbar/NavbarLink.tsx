import { Group, Text, UnstyledButton } from "@mantine/core";
import { toLower } from "lodash";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction } from "react";

export type NavbarLinkProps = {
  //   icon: React.ReactNode;
  //   color: string;
  label: string;
  setOpened: Dispatch<SetStateAction<boolean>>;
};

// function NavbarLink({ icon, color, label }: NavbarLinkProps) {
function NavbarLink({ label, setOpened }: NavbarLinkProps) {
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
      // onClick={() =>
      //   router.push(`/teams/${toLower(router.query.teamName as string)}/forms/${toLower(label)}/edit`)
      // }
      onClick={async () => {
        await router.push(
          `/teams/${toLower(
            router.query.teamName as string
          )}/requests/create?form=${toLower(label)}`
        );
        setOpened(false);
      }}
    >
      <Group position="apart">
        {/* <ThemeIcon color={color} variant="light">
          {icon}
        </ThemeIcon> */}
        <Text size="sm">{label}</Text>
      </Group>
    </UnstyledButton>
  );
}

export default NavbarLink;
