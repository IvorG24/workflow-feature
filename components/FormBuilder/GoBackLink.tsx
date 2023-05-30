import { Button, ButtonProps, createStyles } from "@mantine/core";
import { IconArrowNarrowLeft } from "@tabler/icons-react";
import { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
} & ButtonProps;

const useStyles = createStyles((theme) => ({
  button: {
    color: "#444746",
    fontWeight: 500,
    "&:hover": {
      backgroundColor: theme.colors.gray[1],
    },
  },
}));

const GoBackLink = ({ href, children, ...props }: Props) => {
  const { classes } = useStyles();
  return (
    <Button
      component="a"
      href={href}
      variant="subtle"
      className={classes.button}
      leftIcon={<IconArrowNarrowLeft />}
      {...props}
    >
      {children}
    </Button>
  );
};

export default GoBackLink;
