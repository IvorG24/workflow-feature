// https://mantine.dev/theming/theme-object/

import { MantineThemeOverride } from "@mantine/core";

export const theme: MantineThemeOverride = {
  primaryColor: "green",
  components: {
    Title: {
      styles(theme) {
        return {
          root: {
            color:
              theme.colorScheme === "dark"
                ? theme.colors.dark[0]
                : theme.colors.dark[6],
          },
        };
      },
    },
    Text: {
      styles(theme) {
        return {
          root: {
            color:
              theme.colorScheme === "dark"
                ? theme.colors.dark[0]
                : theme.colors.dark[3],
          },
        };
      },
    },
  },
};

export default theme;
