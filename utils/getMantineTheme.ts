// https://mantine.dev/theming/theme-object/
// https://github.com/mantinedev/mantine/discussions/709 currently no way to access theme object inside here so we have to pass colorScheme instead
// Should use default props instead of modifying root styles

import { MantineThemeOverride } from "@mantine/core";
import { ColorScheme } from "@mantine/core";

const getMantineTheme = (colorScheme: ColorScheme): MantineThemeOverride => ({
  primaryColor: "green",
  components: {
    Title: {
      defaultProps: {
        color: colorScheme === "dark" ? "dark.0" : "dark.6",
      },
    },
    Text: {
      defaultProps: {
        color: colorScheme === "dark" ? "dark.0" : "dark.3",
        size: "sm",
      },
    },
    InputWrapper: {
      styles: () => ({
        label: {
          color: colorScheme === "dark" ? "dark.0" : "dark.6",
        },
      }),
    },
  },
});

export default getMantineTheme;
