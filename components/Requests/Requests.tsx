import { Tabs, Title } from "@mantine/core";
import { useRouter } from "next/router";
import All from "./All";
import Received from "./Received";
import styles from "./Requests.module.scss";
import Sent from "./Sent";

type Props = {
  activeTab: string;
};

const Requests = ({ activeTab }: Props) => {
  const router = useRouter();

  const renderActiveTab = () => {
    switch (activeTab) {
      case "all":
        return <All />;
      case "sent":
        return <Sent />;
      case "received":
        return <Received />;
    }
  };

  return (
    <div className={styles.container}>
      <Title>Requests</Title>

      <Tabs
        value={activeTab}
        onTabChange={(value) =>
          router.push(`/requests/${value === "all" ? "" : value}`)
        }
        defaultValue={activeTab}
        className={styles.tabsContainer}
      >
        <Tabs.List>
          <Tabs.Tab value="all">All</Tabs.Tab>
          <Tabs.Tab value="sent">Sent</Tabs.Tab>
          <Tabs.Tab value="received">Received</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <div>{renderActiveTab()}</div>
    </div>
  );
};

export default Requests;
