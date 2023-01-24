import { Button, createStyles, Footer, MediaQuery } from "@mantine/core";
import { IconBallpen, IconChartBar, IconPlant } from "@tabler/icons";

const useStyles = createStyles((theme) => ({
  buttonGroup: {
    justifyContent: "center",
  },
}));

function FormslyFooter() {
  const { classes } = useStyles();
  return (
    <MediaQuery largerThan="md" styles={{ display: "none" }}>
      <Footer height={60} p="md">
        <Button.Group orientation="horizontal" className={classes.buttonGroup}>
          <Button
            variant="subtle"
            size="xs"
            leftIcon={<IconBallpen size={12} />}
          >
            Requests
          </Button>
          <Button
            variant="subtle"
            size="xs"
            leftIcon={<IconChartBar size={12} />}
          >
            Analytics
          </Button>
          <Button variant="subtle" size="xs" leftIcon={<IconPlant size={12} />}>
            Environment
          </Button>
        </Button.Group>
      </Footer>
    </MediaQuery>
  );
}

export default FormslyFooter;
