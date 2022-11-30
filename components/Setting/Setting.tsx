import { Tabs, Title } from "@mantine/core";
import { useRouter } from "next/router";
import MembersPage from "../MembersPage/MembersPage";
import styles from "./Setting.module.scss";

type Props = {
  activeTab: string;
};

const Setting = ({ activeTab }: Props) => {
  const router = useRouter();

  const renderActiveTab = () => {
    switch (activeTab) {
      case "general":
      // return <General />;
      case "member":
        return <MembersPage />;
      case "profile":
      // return <Profile />;
      case "notification":
      // return <Notification />;
      case "billing":
      // return <Billing />;
    }
  };

  return (
    <div className={styles.container}>
      <Title>Settings</Title>
      <Tabs
        value={activeTab}
        onTabChange={(value) => router.push(`/settings/${value}`)}
        defaultValue={activeTab}
        className={styles.tabsContainer}
      >
        <Tabs.List>
          <Tabs.Tab value="general">General</Tabs.Tab>
          <Tabs.Tab value="member">Member</Tabs.Tab>
          <Tabs.Tab value="profile">Profile</Tabs.Tab>
          <Tabs.Tab value="notification">Notification</Tabs.Tab>
          <Tabs.Tab value="billing">Billing</Tabs.Tab>
        </Tabs.List>
        <div className={styles.mainContainer}>{renderActiveTab()}</div>
      </Tabs>
    </div>
  );
};

export default Setting;
