import { TeamTableRow } from "@/utils/types-new";
import { Container, Tabs, Title } from "@mantine/core";
import { useRouter } from "next/router";
import GeneralSettingsPage from "../GeneralSettingsPage/GeneralSettingsPage";

import MembersPage from "../MembersPage/MembersPage";
import NotificationSettingsPage from "../NotificationSettingsPage/NotificationSettingsPage";
import ProfileSettingsPage from "../ProfileSettingsPage/ProfileSettingsPage";

type Props = {
  activeTab: string;
  team?: TeamTableRow;
};

const Setting = ({ activeTab, team }: Props) => {
  const router = useRouter();

  return (
    <Container fluid px="0">
      <Title>Settings</Title>
      <Tabs
        value={activeTab}
        onTabChange={(value) =>
          router.push(`/t/${router.query.tid}/settings/${value}`)
        }
        defaultValue={activeTab}
        mt="xl"
      >
        <Tabs.List>
          <Tabs.Tab value="general">General</Tabs.Tab>
          <Tabs.Tab value="profile">Profile</Tabs.Tab>
          <Tabs.Tab value="members">Members</Tabs.Tab>
          {/* <Tabs.Tab value="notification">Notification</Tabs.Tab> */}
          {/* <Tabs.Tab value="billing">Billing</Tabs.Tab> */}
        </Tabs.List>

        <Tabs.Panel value="general" pt="xl">
          {team ? <GeneralSettingsPage team={team} /> : null}
        </Tabs.Panel>
        <Tabs.Panel value="profile" pt="xl">
          <ProfileSettingsPage />
        </Tabs.Panel>
        <Tabs.Panel value="members" pt="xl">
          <MembersPage />
        </Tabs.Panel>
        <Tabs.Panel value="notification" pt="xl">
          <NotificationSettingsPage />
        </Tabs.Panel>
        <Tabs.Panel value="billing" pt="xl">
          {/* <Billing /> */}
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default Setting;
