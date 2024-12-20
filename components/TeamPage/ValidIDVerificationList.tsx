import { UserValidIDTableRow } from "@/utils/types";
import {
  Accordion,
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Paper,
  Space,
  Text,
} from "@mantine/core";
import { IconAlertCircle, IconId } from "@tabler/icons-react";
import { useRouter } from "next/router";

type Props = {
  pendingValidIDList: UserValidIDTableRow[];
};

const ValidIDVerificationList = ({ pendingValidIDList }: Props) => {
  const router = useRouter();

  return (
    <Container p={0} mt="xl" pos="relative" fluid>
      <Paper p="lg" shadow="xs">
        <Accordion>
          <Accordion.Item value="id">
            <Accordion.Control icon={<IconId size={16} />}>
              <Text weight={600}>Valid ID Verification</Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Text size={14} mt={12} color="dimmed">
                List of valid IDs that need verification
              </Text>
              <Space h={8} />
              {pendingValidIDList.length > 0 ? (
                pendingValidIDList.map((userValidID, index) => (
                  <Box key={userValidID.user_valid_id_id}>
                    {index !== 0 && <Divider mt={8} />}
                    <Flex justify="space-between" align="center" mt={8}>
                      <Text size={14}>
                        {`${userValidID.user_valid_id_first_name} ${userValidID.user_valid_id_middle_name} ${userValidID.user_valid_id_last_name}`}
                      </Text>

                      <Button
                        onClick={async () =>
                          await router.push(
                            `/user/valid-id-verification/${userValidID.user_valid_id_id}`
                          )
                        }
                      >
                        Verify
                      </Button>
                    </Flex>
                  </Box>
                ))
              ) : (
                <Text align="center" size={24} weight="bolder" color="dimmed">
                  <Alert
                    icon={<IconAlertCircle size="1rem" />}
                    color="blue"
                    mt="xs"
                  >
                    All IDs are verified; no pending verifications at the
                    moment.
                  </Alert>
                </Text>
              )}
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Paper>
    </Container>
  );
};

export default ValidIDVerificationList;
