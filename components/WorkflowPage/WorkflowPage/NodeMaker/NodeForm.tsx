import { COLOR_SET_OPTIONS } from "@/utils/constant";
import { NodeTypeData } from "@/utils/types";
import { Button, Group, Select, TextInput } from "@mantine/core";
import { SubmitHandler, useFormContext } from "react-hook-form";

type NodeFormProps = {
  onSubmit: SubmitHandler<NodeTypeData>;
};

const NodeForm = ({ onSubmit }: NodeFormProps) => {
  const {
    register,
    watch,
    setValue,
    getValues,
    formState: { errors },
    handleSubmit,
  } = useFormContext<NodeTypeData>();

  const label = watch("presetLabel");
  const nodeColor = watch("presetBackgroundColor");
  const fontColor = watch("presetTextColor");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Group position="center">
        <Button
          variant="outline"
          fullWidth
          style={{
            height: "250px",
            fontSize: "2.5rem",
            backgroundColor: nodeColor ? nodeColor : "white",
            color: fontColor ? fontColor : "black",
            border: "1px solid black",
          }}
        >
          {label || "Sample Label"}
        </Button>
      </Group>
      <TextInput
        label="Node Label"
        withAsterisk
        placeholder="Enter node label"
        {...register("presetLabel", {
          required: "Node label is required",
        })}
        error={errors.presetLabel?.message as string}
      />
      <Group grow>
        <Select
          searchable={true}
          placeholder="Select background color"
          data={COLOR_SET_OPTIONS}
          label="Background Color"
          value={getValues("presetBackgroundColor") || ""}
          nothingFound="Color not found"
          withAsterisk
          {...register("presetBackgroundColor", {
            required: "Node color is required",
          })}
          error={errors.presetBackgroundColor?.message as string}
          onChange={(color: string) => {
            setValue("presetBackgroundColor", color);
          }}
        />

        <Select
          searchable={true}
          data={COLOR_SET_OPTIONS}
          placeholder="Select font color"
          value={getValues("presetTextColor") || ""}
          label="Font Color"
          withAsterisk
          {...register("presetTextColor", {
            required: "Font color is required",
          })}
          nothingFound="Color not found"
          error={errors.presetTextColor?.message as string}
          onChange={(color: string) => {
            setValue("presetTextColor", color);
          }}
        />
      </Group>
      <Button type="submit" fullWidth mt="md">
        Create Node
      </Button>
    </form>
  );
};

export default NodeForm;
