import {
  Alert,
  Container,
  LoadingOverlay,
  Paper,
  Text,
  Title,
} from "@mantine/core";

import { TeamMemberType, UserIssuedItem } from "@/utils/types";
import { IconAlertCircle } from "@tabler/icons-react";
import { useState } from "react";
import UserItemBarChart from "./UserItemBarChart";
import UserItemFilter from "./UserItemFilter";

type Props = { teamMemberList: TeamMemberType[] };

const UserItemAnalyticsPage = ({ teamMemberList }: Props) => {
  const [resultList, setResultList] = useState<UserIssuedItem[] | undefined>(
    undefined
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <Container p={0}>
      <Title color="dimmed" order={2}>
        User Issued Item Analytics
      </Title>
      <UserItemFilter
        teamMemberList={teamMemberList}
        setResultList={setResultList}
        isAnalyzing={isAnalyzing}
        setIsAnalyzing={setIsAnalyzing}
      />

      <Paper p="xl" shadow="xs" mt="xl" pos="relative">
        <LoadingOverlay visible={isAnalyzing} overlayBlur={2} />
        {resultList && resultList.length > 0 ? (
          <UserItemBarChart data={resultList} />
        ) : (
          <Text align="center" size={24} weight="bolder" color="dimmed">
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              color="orange"
              mt="xs"
            >
              {Array.isArray(resultList)
                ? "No item/s found."
                : "Please select a user to show the item list."}
            </Alert>
          </Text>
        )}
      </Paper>
    </Container>
  );
};

export default UserItemAnalyticsPage;
