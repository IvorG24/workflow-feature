import {
  Button,
  Group,
  MediaQuery,
  UnstyledButton,
  createStyles,
  rem,
} from "@mantine/core";
import { useRouter } from "next/router";

const useStyles = createStyles((theme) => ({
  link: {
    display: "flex",
    alignItems: "center",
    height: "100%",
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    textDecoration: "none",
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,

    [theme.fn.smallerThan("sm")]: {
      height: rem(42),
      display: "flex",
      alignItems: "center",
      width: "100%",
    },

    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    }),
  },
}));

const tabs = [
  {
    label: "Home",
    link: "/",
  },
  {
    label: "Features",
    link: "/",
  },
  {
    label: "Pricing",
    link: "/",
  },
  {
    label: "Contact Us",
    link: "/",
  },
];

const HeaderMenu = () => {
  const router = useRouter();
  const { classes } = useStyles();

  return (
    <>
      <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
        <Group sx={{ height: "100%" }} spacing={0}>
          {tabs.map((tab, index) => (
            <UnstyledButton
              key={index}
              className={classes.link}
              onClick={async () => await router.push(tab.link)}
            >
              {tab.label}
            </UnstyledButton>
          ))}
        </Group>
      </MediaQuery>
      <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
        <Group>
          <Button
            variant="outline"
            onClick={async () => await router.push("/sign-in")}
          >
            Log in
          </Button>
          <Button onClick={async () => await router.push("/sign-up")}>
            Sign up
          </Button>
        </Group>
      </MediaQuery>
    </>
  );
};

export default HeaderMenu;
