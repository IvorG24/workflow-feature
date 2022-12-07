import { Container, Tabs, Title } from "@mantine/core";
import { useRouter } from "next/router";
import MembersPage from "../MembersPage/MembersPage";
import NotificationsPage from "../NotificationsPage/NotificationsPage";

type Props = {
  activeTab: string;
};

const Setting = ({ activeTab }: Props) => {
  const router = useRouter();
  const { tid } = router.query;
  console.log(tid);

  return (
    <Container fluid px="xs" py="sm">
      <Title>Settings</Title>
      <Tabs
        value={activeTab}
        onTabChange={(value) => router.push(`/t/${tid}/settings/${value}`)}
        defaultValue={activeTab}
        mt="xl"
      >
        <Tabs.List>
          <Tabs.Tab value="general">General</Tabs.Tab>
          <Tabs.Tab value="member">Member</Tabs.Tab>
          <Tabs.Tab value="profile">Profile</Tabs.Tab>
          <Tabs.Tab value="notification">Notification</Tabs.Tab>
          <Tabs.Tab value="billing">Billing</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="general" pt="xl">
          {/* <General /> */}
        </Tabs.Panel>
        <Tabs.Panel value="member" pt="xl">
          <MembersPage />
        </Tabs.Panel>
        <Tabs.Panel value="profile" pt="xl">
          {/* <Profile /> */}
        </Tabs.Panel>
        <Tabs.Panel value="notification" pt="xl">
          <NotificationsPage />
        </Tabs.Panel>
        <Tabs.Panel value="billing" pt="xl">
          {/* <Billing /> */}
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default Setting;
