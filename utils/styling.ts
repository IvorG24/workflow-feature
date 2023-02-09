import { MantineTheme } from "@mantine/core";

export const getRandomColor = (theme: MantineTheme) => {
  // gte random mantine color
  const randomColor = Object.keys(theme.colors)[
    Math.floor(Math.random() * Object.keys(theme.colors).length)
  ];

  return randomColor as keyof MantineTheme["colors"];
};