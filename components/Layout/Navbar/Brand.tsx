import { ActionIcon, Box, Group, useMantineColorScheme } from "@mantine/core";
import { IconMoonStars, IconSun } from "@tabler/icons";
import { useRouter } from "next/router";
import { Logo } from "./Logo";

export function Brand() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const router = useRouter();
  return (
    <Box>
      <Group
        position="apart"
        onClick={() => router.push("/")}
        style={{ cursor: "pointer" }}
      >
        <Logo colorScheme={colorScheme} />
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
