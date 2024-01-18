import { MAX_FILE_SIZE } from "@/utils/constant";
import { convertDateNowToTimestampz, getInitials } from "@/utils/string";
import { getAvatarColor } from "@/utils/styling";
import { EditMemoType, MemoSignerItem } from "@/utils/types";
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Checkbox,
  FileInput,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconArrowsExchange,
  IconPhotoUp,
  IconSquarePlus,
  IconTrashFilled,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import EditMemoMarkdownEditor from "./EditMemoMarkdownEditor";

type Props = {
  onSubmit: (data: EditMemoType) => void;
  teamMemoSignerList: MemoSignerItem[];
};

export const getEditDefaultMemoLineItemValue = ({
  content = "",
  lineItemIndex,
  memoId,
}: {
  content?: string;
  lineItemIndex: number;
  memoId: string;
}) => {
  const newLineItem = {
    memo_line_item_content: content,
    memo_line_item_date_created: convertDateNowToTimestampz(),
    memo_line_item_date_updated: null,
    memo_line_item_id: uuidv4(),
    memo_line_item_memo_id: memoId,
    memo_line_item_order: lineItemIndex,
  };

  return newLineItem;
};

const EditMemoForm = ({ onSubmit, teamMemoSignerList }: Props) => {
  const router = useRouter();
  const [currentSignerList, setCurrentSignerList] =
    useState(teamMemoSignerList);
  const [selectedSigner, setSelectedSigner] = useState<MemoSignerItem | null>(
    null
  );
  const [isSelectedSignerPrimary, setIsSelectedSignerPrimary] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    getValues,
  } = useFormContext<EditMemoType>();

  const {
    fields: lineItemList,
    remove: removeLineItem,
    insert: insertLineItem,
  } = useFieldArray({
    control,
    name: "memo_line_item_list",
  });

  const {
    fields: selectedSignerList,
    remove: removeSignerItem,
    insert: insertSignerItem,
    update: updateSignerItem,
  } = useFieldArray({
    control,
    name: "memo_signer_list",
  });

  const memoAuthorFullname = `${getValues(
    "memo_author_user.user_first_name"
  )} ${getValues("memo_author_user.user_last_name")}`;

  const handleChangePrimarySigner = (signerIndex: number) => {
    const oldPrimarySignerIndex = selectedSignerList.findIndex(
      (signer) => signer.memo_signer_is_primary
    );
    const newPrimarySigner = selectedSignerList[signerIndex];

    if (oldPrimarySignerIndex >= 0) {
      updateSignerItem(oldPrimarySignerIndex, {
        ...selectedSignerList[oldPrimarySignerIndex],
        memo_signer_is_primary: false,
      });
    }

    updateSignerItem(signerIndex, {
      ...newPrimarySigner,
      memo_signer_is_primary: true,
    });
  };

  const handleRemoveSigner = (selectedSignerIndex: number) => {
    // add signer to signer selection
    const signerItem = selectedSignerList[selectedSignerIndex];
    const signerMatch = teamMemoSignerList.find(
      (signer) =>
        signer.team_member_id === signerItem.memo_signer_team_member_id
    );

    if (signerMatch) {
      setCurrentSignerList((prev) => [...prev, signerMatch]);
    }

    removeSignerItem(selectedSignerIndex);
  };

  const handleAddMemoSigner = () => {
    if (!selectedSigner) return;

    const {
      team_member_user: {
        user_first_name,
        user_last_name,
        user_avatar,
        user_job_title,
        user_id,
      },
    } = selectedSigner;

    const isDuplicate = selectedSignerList.find(
      (signer) =>
        signer.memo_signer_team_member?.team_member_id ===
        selectedSigner.team_member_id
    );

    if (isDuplicate) {
      return notifications.show({
        message: "Signer is already added.",
        color: "orange",
      });
    }

    const hasPrimarySigner = selectedSignerList.find(
      (signer) => signer.memo_signer_is_primary
    );

    if (hasPrimarySigner && isSelectedSignerPrimary) {
      return notifications.show({
        message: "Memo already has an existing primary signer.",
        color: "orange",
      });
    }

    const newMemoSigner: EditMemoType["memo_signer_list"][0] = {
      memo_signer_status: "PENDING",
      memo_signer_team_member_id: selectedSigner.team_member_id,
      memo_signer_is_primary: isSelectedSignerPrimary,
      memo_signer_id: uuidv4(),
      memo_signer_memo_id: getValues("memo_id"),
      memo_signer_order: selectedSignerList.length + 1,
      memo_signer_team_member: {
        team_member_id: selectedSigner.team_member_id,
        user: {
          user_first_name,
          user_last_name,
          user_avatar,
          user_job_title,
          user_id,
          user_signature_attachment: {
            user_signature_attachment_id: `${selectedSigner.team_member_user.user_signature_attachment?.attachment_id}`,
            attachment_value: `${selectedSigner.team_member_user.user_signature_attachment?.attachment_value}`,
          },
        },
      },
    };

    insertSignerItem(selectedSignerList.length, newMemoSigner);

    // reset selected signer
    setIsSelectedSignerPrimary(false);
    setSelectedSigner(null);

    // remove new signer from signer selection
    setCurrentSignerList((prev) =>
      prev.filter(
        (item) =>
          item.team_member_id !== newMemoSigner.memo_signer_team_member_id
      )
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack>
        <Paper p="md" radius="md">
          <Title order={3} mb="sm" color="dimmed">
            Memorandum
          </Title>
          <TextInput
            label="Author"
            value={memoAuthorFullname}
            readOnly
            variant="filled"
            withAsterisk
          />
          <TextInput
            label="Subject"
            placeholder="Type memo subject here"
            {...register("memo_subject", {
              required: "This field is required",
            })}
            error={errors.memo_subject?.message}
            withAsterisk
            mb="sm"
          />
          {lineItemList.map((lineItem, lineItemIndex) => {
            return (
              <Stack key={lineItem.id}>
                <Box>
                  <Group position="apart">
                    {" "}
                    <Text weight={600}>
                      Line Item{" "}
                      <Text color="red" span>
                        *
                      </Text>
                    </Text>{" "}
                    {lineItemIndex !== 0 && (
                      <Button
                        leftIcon={<IconTrashFilled size={16} />}
                        color="red"
                        variant="subtle"
                        px={0}
                        onClick={() => removeLineItem(lineItemIndex)}
                      >
                        Remove
                      </Button>
                    )}
                  </Group>

                  <Controller
                    control={control}
                    name={`memo_line_item_list.${lineItemIndex}.memo_line_item_content`}
                    render={({ field: { onChange, value } }) => (
                      <EditMemoMarkdownEditor
                        value={value}
                        onChange={onChange}
                      />
                    )}
                    rules={{
                      required: "This field is required",
                    }}
                  />
                  {errors?.memo_line_item_list?.[lineItemIndex]
                    ?.memo_line_item_content?.message && (
                    <Text size="xs" color="red">
                      {
                        errors?.memo_line_item_list?.[lineItemIndex]
                          ?.memo_line_item_content?.message
                      }
                    </Text>
                  )}
                  <Controller
                    control={control}
                    name={`memo_line_item_list.${lineItemIndex}.memo_line_item_attachment.memo_line_item_attachment_file`}
                    render={({ field: { onChange, value } }) => (
                      <FileInput
                        icon={<IconPhotoUp size={16} />}
                        mt="sm"
                        placeholder="For best results, use an image with an aspect ratio of 3:2 (900x600)"
                        label="Add an image below this line (Optional)"
                        accept="image/*"
                        value={value}
                        onChange={onChange}
                        clearable
                      />
                    )}
                    rules={{
                      validate: (v) => {
                        if (!v) {
                          return true;
                        }
                        return (
                          v.size < MAX_FILE_SIZE ||
                          "Image exceeds 5mb. Please use an image below 5mb."
                        );
                      },
                    }}
                  />
                  {errors?.memo_line_item_list?.[lineItemIndex]
                    ?.memo_line_item_attachment?.memo_line_item_attachment_file
                    ?.message && (
                    <Text size="xs" color="red">
                      {
                        errors?.memo_line_item_list?.[lineItemIndex]
                          ?.memo_line_item_attachment?.message
                      }
                    </Text>
                  )}
                  <TextInput
                    mt="xs"
                    placeholder="Image caption..."
                    {...register(
                      `memo_line_item_list.${lineItemIndex}.memo_line_item_attachment.memo_line_item_attachment_caption`
                    )}
                  />
                </Box>
                <Group>
                  {lineItemIndex === lineItemList.length - 1 && (
                    <Button
                      sx={{ flex: 1 }}
                      leftIcon={<IconSquarePlus size={16} />}
                      variant="light"
                      onClick={() =>
                        insertLineItem(
                          lineItemIndex + 1,
                          getEditDefaultMemoLineItemValue({
                            content: "",
                            lineItemIndex,
                            memoId: lineItem.memo_line_item_memo_id,
                          })
                        )
                      }
                    >
                      Add Line Item
                    </Button>
                  )}
                </Group>
              </Stack>
            );
          })}
        </Paper>

        <Paper p="md" radius="md">
          <Stack>
            <Title order={3} color="dimmed">
              Signers
            </Title>
            {selectedSignerList.map((signer, signerIndex) => {
              const user = signer.memo_signer_team_member?.user;
              const signerFullname = `${user?.user_first_name} ${user?.user_last_name}`;
              return (
                <Group key={signer.id} position="apart">
                  <Group spacing={12}>
                    <Avatar
                      size={32}
                      src={signer.memo_signer_team_member?.user.user_avatar}
                      color={getAvatarColor(
                        Number(`${signer.memo_signer_id.charCodeAt(0)}`)
                      )}
                      radius={16}
                    >
                      {getInitials(signerFullname)}
                    </Avatar>
                    <Text>{signerFullname}</Text>
                    {signer.memo_signer_is_primary ? (
                      <Badge size="sm" color="green" variant="light">
                        Primary
                      </Badge>
                    ) : (
                      <Tooltip label="Make primary">
                        <ActionIcon
                          color="blue"
                          onClick={() => handleChangePrimarySigner(signerIndex)}
                        >
                          <IconArrowsExchange size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Group>

                  <ActionIcon
                    color="red"
                    onClick={() => handleRemoveSigner(signerIndex)}
                  >
                    <IconTrashFilled size={16} />
                  </ActionIcon>
                </Group>
              );
            })}
            <Box>
              <Select
                searchable
                clearable
                nothingFound
                placeholder="Select memo signer"
                data={currentSignerList.map(
                  ({
                    team_member_id,
                    team_member_user: { user_first_name, user_last_name },
                  }) => ({
                    value: team_member_id,
                    label: `${user_first_name} ${user_last_name}`,
                  })
                )}
                value={selectedSigner ? selectedSigner.team_member_id : null}
                onChange={(value) => {
                  const signerMatch = teamMemoSignerList.find(
                    (signer) => signer.team_member_id === value
                  );
                  if (signerMatch) {
                    setSelectedSigner(signerMatch);
                  }
                }}
              />
              <Checkbox
                mt="sm"
                label="Primary Signer"
                checked={isSelectedSignerPrimary}
                onChange={(event) =>
                  setIsSelectedSignerPrimary(event.currentTarget.checked)
                }
              />
            </Box>
            <Button
              leftIcon={<IconSquarePlus size={16} />}
              variant="light"
              onClick={() => handleAddMemoSigner()}
            >
              Add Memo Signer
            </Button>
          </Stack>
        </Paper>

        <Box mb={42}>
          <Button mb={12} size="md" fullWidth type="submit">
            Save Edit
          </Button>
          <Button
            size="md"
            fullWidth
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </Box>
      </Stack>
    </form>
  );
};

export default EditMemoForm;
