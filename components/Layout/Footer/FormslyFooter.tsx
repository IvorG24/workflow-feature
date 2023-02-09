import { Button, createStyles, Footer, MediaQuery } from "@mantine/core";
import { IconBallpen, IconChartBar, IconPlant } from "@tabler/icons";
import { useRouter } from "next/router";

const useStyles = createStyles(() => ({
  buttonGroup: {
    justifyContent: "center",
  },
}));

function FormslyFooter() {
  const router = useRouter();
  const { classes } = useStyles();
  return (
    <MediaQuery largerThan="md" styles={{ display: "none" }}>
      <Footer height={60} p="md">
        <Button.Group orientation="horizontal" className={classes.buttonGroup}>
          <Button
            variant="subtle"
            size="xs"
            leftIcon={<IconBallpen size={12} />}
            onClick={() =>
              router.push(`/teams/${router.query.teamName}/requests`)
            }
          >
            Requests
          </Button>
          <Button
            variant="subtle"
            size="xs"
            leftIcon={<IconChartBar size={12} />}
            onClick={() =>
              router.push(`/teams/${router.query.teamName}/analytics`)
            }
          >
            Analytics
          </Button>
          <Button
            variant="subtle"
            size="xs"
            leftIcon={
              <IconPlant
                size={12}
                onClick={() =>
                  router.push(
                    `/teams/${router.query.teamName}/environment-impact`
                  )
                }
              />
            }
          >
            Environment
          </Button>
        </Button.Group>
      </Footer>
    </MediaQuery>
  );
}

export default FormslyFooter;
