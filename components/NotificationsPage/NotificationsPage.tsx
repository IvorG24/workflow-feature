import { Container, Divider, Flex, Switch, Text, Title } from "@mantine/core";
import { useState } from "react";

const tempData = {
  inApp: true,
  email: false,
};

const NotificationsPage = () => {
  const [workspaceInvitation, setWorkspaceInvitation] = useState(tempData);
  const [requestsApproval, setRequestsApproval] = useState(tempData);
  const [staledRequests, setStaledRequests] = useState(tempData);

  return (
    <Container fluid>
      <Title order={2}>Notifications</Title>
      <Text mt="sm">
        We may still send you important notifications about your account outside
        of your notification settings.
      </Text>
      <Divider mt="lg" color="gray.2" />
      <Flex gap="xl" align="center">
        <Container m={0} p={0}>
          <Text weight="bold">Workspace Invitations</Text>
          <Text>Lorem ipsum dolor sit amet, consectetur adipisicing.</Text>
        </Container>
        <Container m={0} p={0}>
          <Switch
            label="In-app"
            onLabel="ON"
            offLabel="OFF"
            aria-label="workspace invitations in-app"
            size="md"
            checked={workspaceInvitation.inApp}
            onChange={() => {
              setWorkspaceInvitation((value) => {
                return { ...value, inApp: !value.inApp };
              });
            }}
          />
          <Switch
            label="Email"
            onLabel="ON"
            offLabel="OFF"
            aria-label="workspace invitations email"
            size="md"
            checked={workspaceInvitation.email}
            onChange={() =>
              setWorkspaceInvitation((value) => {
                return { ...value, email: !value.email };
              })
            }
          />
        </Container>
      </Flex>
      <Divider mt="lg" color="gray.2" />
      <Flex gap="xl" align="center">
        <Container m={0} p={0}>
          <Text weight="bold">Requests For Approval</Text>
          <Text>Lorem ipsum dolor sit amet, consectetur adipisicing.</Text>
        </Container>
        <Container m={0} p={0}>
          <Switch
            label="In-app"
            onLabel="ON"
            offLabel="OFF"
            aria-label="requests approval in-app"
            size="md"
            checked={requestsApproval.inApp}
            onChange={() =>
              setRequestsApproval((value) => {
                return { ...value, inApp: !value.inApp };
              })
            }
          />
          <Switch
            label="Email"
            onLabel="ON"
            offLabel="OFF"
            aria-label="requests approval email"
            size="md"
            checked={requestsApproval.email}
            onChange={() =>
              setRequestsApproval((value) => {
                return { ...value, email: !value.email };
              })
            }
          />
        </Container>
      </Flex>
      <Divider mt="lg" color="gray.2" />
      <Flex gap="xl" align="center">
        <Container m={0} p={0}>
          <Text weight="bold">Staled Requests</Text>
          <Text>Lorem ipsum dolor sit amet, consectetur adipisicing.</Text>
        </Container>
        <Container m={0} p={0}>
          <Switch
            label="In-app"
            onLabel="ON"
            offLabel="OFF"
            aria-label="staled requests in-app"
            size="md"
            checked={staledRequests.inApp}
            onChange={() =>
              setStaledRequests((value) => {
                return { ...value, inApp: !value.inApp };
              })
            }
          />
          <Switch
            label="Email"
            onLabel="ON"
            offLabel="OFF"
            aria-label="staled requests email"
            size="md"
            checked={staledRequests.email}
            onChange={() =>
              setStaledRequests((value) => {
                return { ...value, email: !value.email };
              })
            }
          />
        </Container>
      </Flex>
    </Container>
  );
};

export default NotificationsPage;
