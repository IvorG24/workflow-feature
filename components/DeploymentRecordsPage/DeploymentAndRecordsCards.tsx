import { useActiveTeam } from "@/stores/useTeamStore";
import {
  BASE_URL,
  DEFAULT_REQUEST_LIST_LIMIT,
  formatDate,
} from "@/utils/constant";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  DeploymentRecordType,
  TechnicalAssessmentFilterValues,
} from "@/utils/types";
import {
  ActionIcon,
  Anchor,
  Box,
  Card,
  CopyButton,
  Flex,
  Grid,
  Group,
  Loader,
  Pagination,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconCopy } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useMemo } from "react";
import { UseFormSetValue } from "react-hook-form";
import DeploymentAndRecordsModal from "./DeploymentAndRecordsModal";

type Props = {
  deploymentRecordList: DeploymentRecordType[];
  deploymentRecordCount: number;
  activePage: number;
  setActivePage: Dispatch<SetStateAction<number>>;
  isFetchingRequestList: boolean;
  handlePagination: (p: number) => void;
  setValue: UseFormSetValue<TechnicalAssessmentFilterValues>;
};

const DeploymentAndRecordsCards = ({
  deploymentRecordList,
  deploymentRecordCount,
  activePage,
  isFetchingRequestList,
  handlePagination,
  setActivePage,
}: Props) => {
  const activeTeam = useActiveTeam();

  const totalPages = useMemo(
    () => Math.ceil(deploymentRecordCount / DEFAULT_REQUEST_LIST_LIMIT),
    [deploymentRecordCount]
  );

  return (
    <>
      <Grid gutter="md">
        {isFetchingRequestList ? (
          <Grid.Col span={12}>
            <Box
              style={{
                position: "relative",
                height: "300px",
                width: "100%",
              }}
            >
              <Box
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backdropFilter: "blur(5px)",
                  backgroundColor: "transparent",
                  zIndex: 1,
                }}
              />

              <Flex
                justify="center"
                align="center"
                style={{
                  position: "relative",
                  zIndex: 2,
                  height: "100%",
                }}
              >
                <Loader />
              </Flex>
            </Box>
          </Grid.Col>
        ) : (
          deploymentRecordList.map((record) => (
            <Grid.Col span={12} key={record.request_id}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group position="apart">
                  <Group position="left" align="center">
                    <Text weight={500} truncate>
                      <Anchor
                        href={`/${formatTeamNameToUrlKey(
                          activeTeam.team_name ?? ""
                        )}/requests/${record.request_formsly_id}`}
                        target="_blank"
                        ml="xs"
                      >
                        {record.request_formsly_id}
                      </Anchor>
                    </Text>

                    <CopyButton
                      value={`${BASE_URL}/${formatTeamNameToUrlKey(
                        activeTeam.team_name ?? ""
                      )}/requests/${record.request_formsly_id}`}
                    >
                      {({ copied, copy }) => (
                        <Tooltip
                          withinPortal
                          label={copied ? "Copied!" : "Copy Link"}
                        >
                          <ActionIcon onClick={copy}>
                            <IconCopy size={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                  </Group>

                  <Text>
                    {formatDate(new Date(record.request_date_created))}
                  </Text>

                  <DeploymentAndRecordsModal
                    requestId={record.request_id}
                    handleFetch={() => handlePagination(activePage)}
                  />
                </Group>
              </Card>
            </Grid.Col>
          ))
        )}
      </Grid>

      <Pagination
        value={activePage}
        onChange={setActivePage}
        total={totalPages}
        position="right"
        mt="md"
        size="sm"
      />
    </>
  );
};

export default DeploymentAndRecordsCards;
