import { useTeamMemberList } from "@/stores/useTeamMemberStore";
import {
  Button,
  Chip,
  Divider,
  Flex,
  Modal,
  Select,
  Stack,
  Title,
} from "@mantine/core";
import { RequestSignerType } from "./RequestSignerSection";

type Props = {
  opened: boolean;
  onClose: () => void;
  initialSignerList: RequestSignerType[];
};

const RequestUpdateSignerModal = ({
  opened,
  onClose,
  initialSignerList,
}: Props) => {
  const signerList = useTeamMemberList("OWNER & APPROVER");
  const signerOptions = signerList.map(
    ({
      team_member_id,
      team_member_user: { user_first_name, user_last_name },
    }) => ({
      value: team_member_id,
      label: `${user_first_name} ${user_last_name}`,
    })
  );
  //   const [updatedSignerList, setUpdatedSignerList] = useState(initialSignerList);

  //   const { control } = useFormContext<UpdateSignerFormValues>();

  return (
    <Modal centered opened={opened} onClose={onClose} withCloseButton={false}>
      <Stack p="sm" data-autofocus>
        <Title align="center" order={4}>
          Update Request Signer Form
        </Title>
        {initialSignerList.map((signer, index) => {
          return (
            <Flex key={index} align="center" gap="sm">
              <Select
                value={signer.signer_team_member.team_member_id}
                data={signerOptions}
                sx={{ flex: 1 }}
                withinPortal
                searchable
              />
              {signer.signer_is_primary_signer ? (
                <Chip
                  size="xs"
                  variant="outline"
                  checked={signer.signer_is_primary_signer}
                  w={105}
                >
                  Primary
                </Chip>
              ) : (
                <Button size="xs" variant="light">
                  Make Primary
                </Button>
              )}
            </Flex>
          );
        })}
        <Divider />
        <Stack spacing={12}>
          <Button>Submit</Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
};
export default RequestUpdateSignerModal;
