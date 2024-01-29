import { useActiveTeam } from "@/stores/useTeamStore";
import { formatTeamNameToUrlKey } from "@/utils/string";
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
          Please select a form and search
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
                        {request.formsly_id}
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
                    <Text>{request.time_difference}</Text>
                  </td>
                  <td>
                    <Text>
                      {`${new Date(
                        request.request_date_created
                      ).toLocaleDateString()} ${new Date(
                        request.request_date_created
                      ).toLocaleTimeString()}`}
                    </Text>
                  </td>
                  <td>
                    <Text>
                      {`${new Date(
                        request.request_signer_status_date_updated
                      ).toLocaleDateString()} ${new Date(
                        request.request_signer_status_date_updated
                      ).toLocaleTimeString()}`}
                    </Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ScrollArea>
      ) : (
        <Alert icon={<IconAlertCircle size="1rem" />} mt="xl" color="orange">
          No results found for your form
        </Alert>
      )}
    </Flex>
  );
};

export default SignerSLAList;
