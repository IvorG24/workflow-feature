import {
  Button,
  Container,
  Flex,
  SimpleGrid,
  Text,
  Title,
  createStyles,
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

const Error404Page = () => {
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
            Page you are trying to open does not exist. You may have mistyped
            the address, or the page has been moved to another URL. If you think
            this is an error contact support.
          </Text>
          <Flex gap="xs">
            <Button
              size="md"
              mt="xl"
              className={classes.control}
              onClick={() => router.back()}
              variant="outline"
            >
              Get back
            </Button>
            <Button
              size="md"
              mt="xl"
              className={classes.control}
              onClick={() => router.push("/")}
            >
              Get to home page
            </Button>
          </Flex>
        </div>
      </SimpleGrid>
    </Container>
  );
};

export default Error404Page;
