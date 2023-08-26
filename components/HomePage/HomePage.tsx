import {
  Box,
  Button,
  Container,
  Flex,
  Image,
  Stack,
  Text,
  Title,
  createStyles,
} from "@mantine/core";

const useStyles = createStyles((theme) => ({
  titleText: {
    [theme.fn.smallerThan("md")]: {
      fontSize: 32,
    },
    [theme.fn.smallerThan("lg")]: {
      fontSize: 60,
    },
    fontSize: 80,
  },
  left: {
    flex: 1,
    padding: 50,
    minWidth: 350,
  },
  right: {
    [theme.fn.smallerThan(700)]: {
      borderLeft: "solid 0px",
    },
    flex: 1,
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.blue[6]
        : theme.colors.blue[3],
    borderLeft: "solid 10px",
    borderLeftColor:
      theme.colorScheme === "dark"
        ? theme.colors.blue[3]
        : theme.colors.blue[9],
    backgroundImage:
      theme.colorScheme === "dark"
        ? `radial-gradient(${theme.colors.blue[3]}, ${theme.colors.blue[6]}, ${theme.colors.blue[9]})`
        : `radial-gradient(${theme.colors.blue[0]}, ${theme.colors.blue[3]}, ${theme.colors.blue[6]})`,
    minWidth: 350,
    alignItems: "center",
    justifyContent: "center",
    overflow: "auto",
  },
  subText: {
    [theme.fn.smallerThan(800)]: {
      fontSize: 16,
    },
    fontSize: 20,
  },
  simplifyContainer: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.blue[0]
        : theme.colors.dark[6],
    padding: "50px 20px",
    textAlign: "center",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.blue[0],
  },
  themeTitle: {
    color: theme.colors.blue[4],
  },
}));

const HomePage = () => {
  const { classes } = useStyles();

  return (
    <Container fluid p={0} m={0}>
      <Flex w="100%" wrap="wrap">
        <Stack className={classes.left} spacing="xl">
          <Title className={classes.titleText}>Create. Approve.</Title>
          <Title className={classes.titleText} mt={-20}>
            Get Stuff Done
          </Title>
          <Text className={classes.subText} color="dimmed" pr={100}>
            Formsly lets you create customized forms and request approvals from
            mobile devices or the web.
          </Text>
          <Box>
            <Button w={200} h={40}>
              Get Started
            </Button>
          </Box>
        </Stack>
        <Flex className={classes.right}>
          <Image mt={20} src="/laptop_and_mobile.png" alt="Laptop and Mobile" />
        </Flex>
      </Flex>

      <Stack className={classes.simplifyContainer}>
        <Title>Simplify Your Workflow and Save Paper</Title>
        <Text>
          Cut the time it takes to approve documents by signing anytime,
          anywhere with Formsly.
        </Text>
      </Stack>

      <Container>
        <Flex p="xl" gap="xl" wrap="wrap">
          <Stack sx={{ flex: 1 }} p="xl" miw={300}>
            <Title order={3} className={classes.themeTitle}>
              ABOUT
            </Title>
            <Title order={2}>Replace Manual Work With A Modern Solution</Title>
            <Text color="dimmed">
              Formsly speeds up your workflow by providing an electronic way to
              obtain and track approvals of documents. Eliminate inefficient,
              ineffective processes and enjoy all the benefits of an efficient,
              integrated, digital workflow solution.
            </Text>
          </Stack>
          <Box sx={{ flex: 1 }} p="xl" miw={300}>
            <Image src="/about.png" alt="About" />
          </Box>
        </Flex>
      </Container>

      <Container>
        <Flex p="xl" gap="xl" wrap="wrap-reverse">
          <Box sx={{ flex: 1 }} p="xl" miw={300}>
            <Image src="/features.png" alt="About" />
          </Box>
          <Stack sx={{ flex: 1 }} p="xl" miw={300}>
            <Title order={3} className={classes.themeTitle}>
              FEATURES
            </Title>
            <Title order={2}>
              Get Rid of Paper and Take Control of The Document Approval Process
            </Title>
            <Text color="dimmed">
              Learn how the formsly approval process gets your document to
              approval faster and more securely than ever.
            </Text>
          </Stack>
        </Flex>
      </Container>
    </Container>
  );
};

export default HomePage;
