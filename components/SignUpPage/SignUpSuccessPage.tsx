import {
  ActionIcon,
  Button,
  Center,
  Container,
  Flex,
  Paper,
  Text,
  Title,
} from "@mantine/core";
import { IconCircleCheck } from "@tabler/icons-react";
import Link from "next/link";

const SuccessPage = () => {
  return (
    <Container h="100%" p={24}>
      <Center mt={65}>
        <Paper
          px={{ base: 32, sm: 64 }}
          py={32}
          w={493}
          shadow="sm"
          radius="md"
        >
          <Flex
            w="100%"
            justify="center"
            direction="column"
            align="center"
            ta="center"
            gap={16}
          >
            <ActionIcon size={84} color="green">
              <IconCircleCheck size={84} />
            </ActionIcon>

            <Title size={20}>Check your mailbox</Title>
            <Text size={14}>
              We have sent you a confirmation email to complete your
              registration. To proceed, click the link provided in the email. If
              you don&apos;t see it in your inbox, please check your spam
              folder.
            </Text>
            <Link href={"/"} style={{ textDecoration: "none", width: "100%" }}>
              <Button h={38} fullWidth>
                Return to homepage
              </Button>
            </Link>
          </Flex>
        </Paper>
      </Center>
    </Container>
  );
};

export default SuccessPage;
