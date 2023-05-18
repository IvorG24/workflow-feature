import {
  Button,
  Container,
  createStyles,
  SimpleGrid,
  Text,
  Title,
} from "@mantine/core";
import { useRouter } from "next/router";

const useStyles = createStyles((theme) => ({
  root: {
    paddingTop: 80,
    paddingBottom: 80,
  },

  title: {
    fontWeight: 900,
    fontSize: 34,
    marginBottom: theme.spacing.md,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,

    [theme.fn.smallerThan("sm")]: {
      fontSize: 32,
    },
  },

  control: {
    [theme.fn.smallerThan("sm")]: {
      width: "100%",
    },
  },

  mobileImage: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },

  desktopImage: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },
}));

const Error401Page = () => {
  const { classes } = useStyles();
  const router = useRouter();

  return (
    <Container className={classes.root}>
      <SimpleGrid
        spacing={80}
        cols={2}
        breakpoints={[{ maxWidth: "sm", cols: 1, spacing: 40 }]}
      >
        <div>
          <Title className={classes.title}>Something is not right...</Title>
          <Text color="dimmed" size="lg">
            You do not have permission to access this page.
          </Text>
          <Button
            size="md"
            mt="xl"
            className={classes.control}
            onClick={() => router.push("/")}
          >
            Get back to home page
          </Button>
        </div>
      </SimpleGrid>
    </Container>
  );
};

export default Error401Page;
