import { MAX_FILE_SIZE } from "@/utils/constant";
import {
  Box,
  Button,
  FileInput,
  Flex,
  Group,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconPhotoUp,
  IconSquarePlus,
  IconTrashFilled,
} from "@tabler/icons-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import {
  MemoFormValues,
  getDefaultMemoLineItemValue,
} from "./CreateMemoFormPage";
import MemoMarkdownEditor from "./MemoMarkdownEditor";

type Props = {
  onSubmit: (data: MemoFormValues) => void;
};
const MemoForm = ({ onSubmit }: Props) => {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack>
        <TextInput
          label="Author"
          readOnly
          {...register("author", {
            required: "This field is required",
          })}
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
          <>
            <Box key={lineItem.id}>
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
                rules={{ required: "This field is required" }}
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
                  />
                )}
                // rules={{validate: {
                //   maxFileSize: (value: File) => value.size > MAX_FILE_SIZE
                // }}}
                rules={{
                  validate: (v) => {
                    if (!v) {
                      return true;
                    }
                    return (
                      v.size > MAX_FILE_SIZE ||
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
                  Add new line
                </Button>
              )}
            </Group>
          </>
        ))}

        <Flex
          direction={{ base: "column-reverse", sm: "row" }}
          gap="sm"
          justify="space-between"
        >
          <Button fullWidth type="button" variant="outline">
            Cancel
          </Button>
          <Button fullWidth type="submit">
            Submit
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default MemoForm;
