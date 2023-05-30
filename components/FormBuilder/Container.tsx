import {
  ContainerProps,
  Container as MantineContainer,
  createStyles,
} from "@mantine/core";

const useStyles = createStyles((theme) => ({
  container: {
    padding: "32px",
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : "#fff",
    borderRadius: 4,
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[6] : "#e9ecef"
    }`,
  },
}));

const Container = ({ children, ...props }: ContainerProps) => {
  const { classes } = useStyles();
  return (
    <MantineContainer className={classes.container} {...props}>
      {children}
    </MantineContainer>
  );
};

export default Container;
