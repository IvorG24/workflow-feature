import { getMemoFormat } from "@/backend/api/get";
import { updateMemoFormat } from "@/backend/api/update";
import { MemoFormatType } from "@/utils/types";
import {
  Box,
  Button,
  Container,
  Flex,
  Group,
  LoadingOverlay,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import logo from "../../public/logo-scic.png";

type Props = {
  opened: boolean;
  close: () => void;
};

const MemoFormatEditor = ({ opened, close }: Props) => {
  const supabaseClient = createPagesBrowserClient();

  const [isLoading, setIsLoading] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<MemoFormatType>();
  const formatValues = useWatch({ control });

  const handleSaveFormat = async (data: MemoFormatType) => {
    try {
      setIsLoading(true);

      await updateMemoFormat(supabaseClient, data);

      notifications.show({
        message: "Memo format updated.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        message: "Failed to save format",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchMemoFormat = async () => {
      const memoFormat = await getMemoFormat(supabaseClient);
      setValue("memo_format_id", memoFormat.memo_format_id);
      setValue("header", memoFormat.header);
      setValue("body", memoFormat.body);
      setValue("footer", memoFormat.footer);
    };
    fetchMemoFormat();
  }, [setValue, supabaseClient]);

  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Memo Format Editor"
      fullScreen
      transitionProps={{ transition: "fade", duration: 200 }}
    >
      <Container p="lg" h="100%" fluid>
        <LoadingOverlay visible={isLoading} overlayBlur={2} />
        <Flex mih={600} wrap="wrap" gap="xl">
          <Box sx={{ flex: 1 }}>
            <form onSubmit={handleSubmit(handleSaveFormat)}>
              <Stack>
                <Title order={4}>
                  Adjust the following input to update the format of the Memo
                  Document
                </Title>
                <Stack spacing="xs">
                  <Text color="green" weight={600}>
                    Header
                  </Text>
                  <Flex wrap="wrap" gap="md">
                    <Controller
                      control={control}
                      name="header.top"
                      rules={{ required: "This field is required" }}
                      render={({ field: { onChange, value } }) => (
                        <NumberInput
                          w={120}
                          min={0}
                          max={500}
                          label="Top Margin"
                          onChange={(value) => onChange(Number(value))}
                          value={value}
                          error={errors.header?.top?.message}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="header.right"
                      rules={{ required: "This field is required" }}
                      render={({ field: { onChange, value } }) => (
                        <NumberInput
                          w={120}
                          min={0}
                          max={500}
                          label="Right Margin"
                          onChange={(value) => onChange(Number(value))}
                          value={value}
                          error={errors.header?.right?.message}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="header.bottom"
                      rules={{ required: "This field is required" }}
                      render={({ field: { onChange, value } }) => (
                        <NumberInput
                          w={120}
                          min={0}
                          max={500}
                          label="Bottom Margin"
                          onChange={(value) => onChange(Number(value))}
                          value={value}
                          error={errors.header?.bottom?.message}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="header.left"
                      rules={{ required: "This field is required" }}
                      render={({ field: { onChange, value } }) => (
                        <NumberInput
                          w={120}
                          min={0}
                          max={500}
                          label="Left Margin"
                          onChange={(value) => onChange(Number(value))}
                          value={value}
                          error={errors.header?.left?.message}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="header.logoPosition"
                      rules={{ required: "This field is required" }}
                      render={({ field: { onChange, value } }) => (
                        <Select
                          w={200}
                          label="Logo Position"
                          data={["Left", "Center", "Right"]}
                          value={value}
                          onChange={onChange}
                          error={errors.header?.logoPosition?.message}
                        />
                      )}
                    />
                  </Flex>
                </Stack>
                <Stack spacing="xs">
                  <Text color="gray" weight={600}>
                    Body
                  </Text>
                  <Flex wrap="wrap" gap="md">
                    <Controller
                      control={control}
                      name="body.top"
                      rules={{ required: "This field is required" }}
                      render={({ field: { onChange, value } }) => (
                        <NumberInput
                          w={120}
                          min={0}
                          max={500}
                          label="Top Margin"
                          onChange={(value) => onChange(Number(value))}
                          value={value}
                          error={errors.body?.top?.message}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="body.right"
                      rules={{ required: "This field is required" }}
                      render={({ field: { onChange, value } }) => (
                        <NumberInput
                          w={120}
                          min={0}
                          max={500}
                          label="Right Margin"
                          onChange={(value) => onChange(Number(value))}
                          value={value}
                          error={errors.body?.right?.message}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="body.bottom"
                      rules={{ required: "This field is required" }}
                      render={({ field: { onChange, value } }) => (
                        <NumberInput
                          w={120}
                          min={0}
                          max={500}
                          label="Bottom Margin"
                          onChange={(value) => onChange(Number(value))}
                          value={value}
                          error={errors.body?.bottom?.message}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="body.left"
                      rules={{ required: "This field is required" }}
                      render={({ field: { onChange, value } }) => (
                        <NumberInput
                          w={120}
                          min={0}
                          max={500}
                          label="Left Margin"
                          onChange={(value) => onChange(Number(value))}
                          value={value}
                          error={errors.body?.left?.message}
                        />
                      )}
                    />
                  </Flex>
                </Stack>
                <Stack spacing="xs">
                  <Text color="blue" weight={600}>
                    Footer
                  </Text>
                  <Flex wrap="wrap" gap="md">
                    <Controller
                      control={control}
                      name="footer.top"
                      rules={{ required: "This field is required" }}
                      render={({ field: { onChange, value } }) => (
                        <NumberInput
                          w={120}
                          min={0}
                          max={500}
                          label="Top Margin"
                          onChange={(value) => onChange(Number(value))}
                          value={value}
                          error={errors.footer?.top?.message}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="footer.right"
                      rules={{ required: "This field is required" }}
                      render={({ field: { onChange, value } }) => (
                        <NumberInput
                          w={120}
                          min={0}
                          max={500}
                          label="Right Margin"
                          onChange={(value) => onChange(Number(value))}
                          value={value}
                          error={errors.footer?.right?.message}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="footer.bottom"
                      rules={{ required: "This field is required" }}
                      render={({ field: { onChange, value } }) => (
                        <NumberInput
                          w={120}
                          min={0}
                          max={500}
                          label="Bottom Margin"
                          onChange={(value) => onChange(Number(value))}
                          value={value}
                          error={errors.footer?.bottom?.message}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="footer.left"
                      rules={{ required: "This field is required" }}
                      render={({ field: { onChange, value } }) => (
                        <NumberInput
                          w={120}
                          min={0}
                          max={500}
                          label="Left Margin"
                          onChange={(value) => onChange(Number(value))}
                          value={value}
                          error={errors.footer?.left?.message}
                        />
                      )}
                    />
                  </Flex>
                </Stack>

                <Group mt="xl">
                  <Button onClick={close} w={120} size="md" variant="outline">
                    Close
                  </Button>
                  <Button type="submit" w={120} size="md">
                    Save
                  </Button>
                </Group>
              </Stack>
            </form>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Paper mx="auto" maw={420} h={600} withBorder>
              <Flex w="100%" h="100%" direction="column">
                <Flex
                  h={30}
                  mt={formatValues.header?.top}
                  mr={formatValues.header?.right}
                  mb={formatValues.header?.bottom}
                  ml={formatValues.header?.left}
                  justify={formatValues.header?.logoPosition}
                  sx={{ border: "1px solid green" }}
                >
                  <Image src={logo} width={90} height={30} alt="SCIC Logo" />
                </Flex>

                <Flex
                  h="100%"
                  mt={formatValues.body?.top}
                  mr={formatValues.body?.right}
                  mb={formatValues.body?.bottom}
                  ml={formatValues.body?.left}
                  sx={{ border: "1px solid gray" }}
                  justify="center"
                  align="center"
                >
                  <Text weight={600} color="dimmed">
                    Body
                  </Text>
                </Flex>

                <Flex
                  h={30}
                  mt={formatValues.footer?.top}
                  mr={formatValues.footer?.right}
                  mb={formatValues.footer?.bottom}
                  ml={formatValues.footer?.left}
                  sx={{ border: "1px solid blue" }}
                  justify="center"
                  align="center"
                >
                  <Text weight={600} color="dimmed">
                    Footer
                  </Text>
                </Flex>
              </Flex>
            </Paper>
          </Box>
        </Flex>
      </Container>
    </Modal>
  );
};

export default MemoFormatEditor;
