import { useActiveTeam } from "@/stores/useTeamStore";
import { formatDate, formatTime } from "@/utils/constant";
import { formatTeamNameToUrlKey, formatTimeString } from "@/utils/string";
import { SignerRequestSLA } from "@/utils/types";
import {
  Alert,
  Anchor,
  Badge,
  Flex,
  ScrollArea,
  Table,
  Text,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

type Props = {
  signerSLAList: SignerRequestSLA[] | null;
};

const SignerSLAList = ({ signerSLAList }: Props) => {
  const activeTeam = useActiveTeam();

  return (
    <Flex direction="column">
      {signerSLAList === null ? (
        <Alert icon={<IconAlertCircle size="1rem" />} color="orange">
          Please select a form, project, and approver then search
        </Alert>
      ) : signerSLAList && signerSLAList.length > 0 ? (
        <ScrollArea>
          <Table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Status</th>
                <th>Time Difference</th>
                <th>Date Created</th>
                <th>Date Approved/Rejected</th>
              </tr>
            </thead>
            <tbody>
              {signerSLAList.map((request) => (
                <tr key={request.request_id}>
                  <td>
                    <Text truncate maw={150}>
                      <Anchor
                        href={`/${formatTeamNameToUrlKey(
                          activeTeam.team_name ?? ""
                        )}/requests/${request.formsly_id}`}
                        target="_blank"
                      >
                        {request.formsly_id || request.request_id}
                      </Anchor>
                    </Text>
                  </td>

                  <td>
                    <Badge
                      color={request.status === "PASSED" ? "green" : "red"}
                    >
                      {request.status}
                    </Badge>
                  </td>
                  <td>
                    <Text>{formatTimeString(request.time_difference)}</Text>
                  </td>
                  <td>
                    <Text>
                      {`${formatDate(
                        new Date(request.request_date_created)
                      )} ${formatTime(new Date(request.request_date_created))}`}
                    </Text>
                  </td>
                  <td>
                    <Text>
                      {`${formatDate(
                        new Date(request.request_signer_status_date_updated)
                      )} ${formatTime(
                        new Date(request.request_signer_status_date_updated)
                      )}`}
                    </Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ScrollArea>
      ) : (
        <Alert icon={<IconAlertCircle size="1rem" />} color="orange">
          No results found for your form
        </Alert>
      )}
    </Flex>
  );
};

export default SignerSLAList;
