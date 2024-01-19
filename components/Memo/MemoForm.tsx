import { MAX_FILE_SIZE } from "@/utils/constant";
import { getInitials } from "@/utils/string";
import { getAvatarColor } from "@/utils/styling";
import { MemoSignerItem } from "@/utils/types";
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
import { useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import {
  MemoFormValues,
  getDefaultMemoLineItemValue,
} from "./CreateMemoFormPage";
import MemoMarkdownEditor from "./MemoMarkdownEditor";

type Props = {
  onSubmit: (data: MemoFormValues) => void;
  teamMemoSignerList: MemoSignerItem[];
};

const MemoForm = ({ onSubmit, teamMemoSignerList }: Props) => {
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
  } = useFormContext<MemoFormValues>();

  const {
    fields: lineItemList,
    remove: removeLineItem,
    insert: insertLineItem,
  } = useFieldArray({
    control,
    name: "lineItem",
  });

  const {
    fields: selectedSignerList,
    remove: removeSignerItem,
    insert: insertSignerItem,
    update: updateSignerItem,
  } = useFieldArray({
    control,
    name: "signerList",
  });

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

    const hasPrimarySigner = selectedSignerList.find(
      (signer) => signer.signer_is_primary
    );

    if (hasPrimarySigner && isSelectedSignerPrimary) {
      return notifications.show({
        message: "Memo already has an existing primary signer.",
        color: "orange",
      });
    }

    const signerSignatureList = selectedSigner.signature_list ?? [];
    const signerCurrentSignature =
      signerSignatureList[signerSignatureList.length - 1];

    const newMemoSigner: MemoFormValues["signerList"][0] = {
      signer_status: "PENDING",
      signer_team_member_id: selectedSigner.team_member_id,
      signer_is_primary: isSelectedSignerPrimary,
      signer_full_name: `${user_first_name.trim()} ${user_last_name.trim()}`,
      signer_avatar: user_avatar,
      signer_job_title: user_job_title,
      signer_user_id: user_id,
      signer_signature: signerCurrentSignature.signature_history_value,
    };

    insertSignerItem(selectedSignerList.length, newMemoSigner);

    // reset selected signer
    setIsSelectedSignerPrimary(false);
    setSelectedSigner(null);

    // remove new signer from signer selection
    setCurrentSignerList((prev) =>
      prev.filter(
        (item) => item.team_member_id !== newMemoSigner.signer_team_member_id
      )
    );
  };

  const handleRemoveSigner = (selectedSignerIndex: number) => {
    // add signer to signer selection
    const signerItem = selectedSignerList[selectedSignerIndex];
    const signerMatch = teamMemoSignerList.find(
      (signer) => signer.team_member_id === signerItem.signer_team_member_id
    );

    if (signerMatch) {
      setCurrentSignerList((prev) => [...prev, signerMatch]);
    }

    removeSignerItem(selectedSignerIndex);
  };

  const handleChangePrimarySigner = (signerIndex: number) => {
    const oldPrimarySignerIndex = selectedSignerList.findIndex(
      (signer) => signer.signer_is_primary
    );
    const newPrimarySigner = selectedSignerList[signerIndex];

    if (oldPrimarySignerIndex >= 0) {
      updateSignerItem(oldPrimarySignerIndex, {
        ...selectedSignerList[oldPrimarySignerIndex],
        signer_is_primary: false,
      });
    }

    updateSignerItem(signerIndex, {
      ...newPrimarySigner,
      signer_is_primary: true,
    });
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
            readOnly
            {...register("author", {
              required: "This field is required",
            })}
            variant="filled"
            error={errors.author?.message}
            withAsterisk
          />
          <TextInput
            label="Subject"
            placeholder="Type memo subject here"
            {...register("subject", {
              required: "This field is required",
            })}
            error={errors.subject?.message}
            withAsterisk
            mb="sm"
          />
          {lineItemList.map((lineItem, lineItemIndex) => (
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
                  name={`lineItem.${lineItemIndex}.line_item_content`}
                  render={({ field: { onChange, value } }) => (
                    <MemoMarkdownEditor value={value} onChange={onChange} />
                  )}
                  rules={{
                    required: "This field is required",
                  }}
                />
                {errors?.lineItem?.[lineItemIndex]?.line_item_content
                  ?.message && (
                  <Text size="xs" color="red">
                    {
                      errors?.lineItem?.[lineItemIndex]?.line_item_content
                        ?.message
                    }
                  </Text>
                )}
                <Controller
                  control={control}
                  name={`lineItem.${lineItemIndex}.line_item_image_attachment`}
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
                {errors?.lineItem?.[lineItemIndex]?.line_item_image_attachment
                  ?.message && (
                  <Text size="xs" color="red">
                    {
                      errors?.lineItem?.[lineItemIndex]
                        ?.line_item_image_attachment?.message
                    }
                  </Text>
                )}
                <TextInput
                  mt="xs"
                  placeholder="Image caption..."
                  {...register(
                    `lineItem.${lineItemIndex}.line_item_image_caption`
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
                        getDefaultMemoLineItemValue({
                          content: "",
                        })
                      )
                    }
                  >
                    Add Line Item
                  </Button>
                )}
              </Group>
            </Stack>
          ))}
        </Paper>

        <Paper p="md" radius="md">
          <Stack>
            <Title order={3} color="dimmed">
              Signers
            </Title>
            {selectedSignerList.map((signer, signerIndex) => {
              return (
                <Group key={signer.id} position="apart">
                  <Group spacing={12}>
                    <Avatar
                      size={32}
                      src={signer.signer_avatar}
                      color={getAvatarColor(
                        Number(`${signer.signer_team_member_id.charCodeAt(0)}`)
                      )}
                      radius={16}
                    >
                      {getInitials(signer.signer_full_name)}
                    </Avatar>
                    <Text>{signer.signer_full_name}</Text>
                    {signer.signer_is_primary ? (
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

        <Button mb={42} size="md" fullWidth type="submit">
          Submit
        </Button>
      </Stack>
    </form>
  );
};

export default MemoForm;
