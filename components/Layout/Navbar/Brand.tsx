import {
  ActionIcon,
  Box,
  createStyles,
  Group,
  useMantineColorScheme,
} from "@mantine/core";
import { IconMoonStars, IconSun } from "@tabler/icons";
import { useRouter } from "next/router";
import { Logo } from "./Logo";

const useStyles = createStyles(() => ({
  logo: {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

export function Brand() {
  const { classes } = useStyles();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const router = useRouter();
  return (
    <Box>
      <Group position="apart">
        <Box onClick={() => router.push("/")} className={classes.logo}>
          <Logo colorScheme={colorScheme} />
        </Box>
        <ActionIcon
          variant="default"
          onClick={() => toggleColorScheme()}
          size={30}
        >
          {colorScheme === "dark" ? (
            <IconSun size={16} />
          ) : (
            <IconMoonStars size={16} />
          )}
        </ActionIcon>
      </Group>
    </Box>
  );
}
