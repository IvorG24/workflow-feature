import { Group, Text, Tooltip, UnstyledButton } from "@mantine/core";
import { IconPlus } from "@tabler/icons";
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
      //   router.push(`/teams/${router.query.teamName as string}/forms/${label}/edit`)
      // }
      onClick={async () => {
        await router.push(
          `/teams/${
            router.query.teamName as string
          }/requests/create?form=${label}`
        );
        setOpened(false);
      }}
    >
      <Tooltip label={`Click to create request with ${label} form`}>
        <Group position="apart" noWrap>
          {/* <ThemeIcon color={color} variant="light">
          {icon}
        </ThemeIcon> */}
          <Text size="sm" lineClamp={1}>
            {label}
          </Text>
          {/* on hover show action icon plus */}
          {/* <ActionIcon size="sm"> */}
          <IconPlus size={18} stroke={1.5} />
          {/* </ActionIcon> */}
        </Group>
      </Tooltip>
    </UnstyledButton>
  );
}

export default NavbarLink;
