import {
  Box,
  Center,
  Container,
  Divider,
  Flex,
  Grid,
  Group,
  Image,
  Stack,
  Text,
  Title,
  createStyles,
  useMantineTheme,
} from "@mantine/core";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
  IconBrandYoutube,
  IconMail,
  IconMap,
  IconPhone,
} from "@tabler/icons-react";

const useStyles = createStyles((theme) => ({
  container: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.blue[0]
        : theme.colors.dark[6],
  },
}));

const Footer = () => {
  const { classes } = useStyles();
  const { colorScheme } = useMantineTheme();

  const textColor = colorScheme === "dark" ? "black" : "white";

  return (
    <Container p="xl" className={classes.container} fluid>
      <Grid gutter="xl">
        <Grid.Col span="auto">
          <Image
            alt="Logo"
            src={`/logo-request-${
              colorScheme === "dark" ? "light" : "dark"
            }.svg`}
            width={200}
          />
        </Grid.Col>
        <Grid.Col span="auto" px="xl">
          <Stack>
            <Title color={textColor} order={4}>
              Get in Touch
            </Title>
            <Flex gap="xs">
              <IconMail color={textColor} />
              <Text color={textColor}>help@formsly.io</Text>
            </Flex>
            <Flex gap="xs">
              <IconPhone color={textColor} />
              <Text color={textColor}>(+63) 917 807 4806</Text>
            </Flex>
            <Flex gap="xs">
              <Box>
                <IconMap color={textColor} />
              </Box>
              <Text color={textColor}>
                Sta. Clara International Corporation Highway 54 Plaza 986 EDSA
                Wack-Wack Mandaluyong City 1550 Philippines
              </Text>
            </Flex>
            <Group spacing="xs">
              <IconBrandFacebook color={textColor} />
              <IconBrandInstagram color={textColor} />
              <IconBrandTwitter color={textColor} />
              <IconBrandYoutube color={textColor} />
            </Group>
          </Stack>
        </Grid.Col>
        <Grid.Col span="auto">
          <Title order={4} color={textColor}>
            Site Links
          </Title>
          <Stack spacing={5} mt="sm">
            <Text color={textColor}>Home</Text>
            <Text color={textColor}>Features</Text>
            <Text color={textColor}>Pricing</Text>
            <Text color={textColor}>Contact Us</Text>
          </Stack>
        </Grid.Col>
      </Grid>

      <Divider my="xl" />
      <Center>
        <Text color={textColor}>
          Copyright © 2023, Formsly. All Rights Reserved.
        </Text>
      </Center>
    </Container>
  );
};

export default Footer;
