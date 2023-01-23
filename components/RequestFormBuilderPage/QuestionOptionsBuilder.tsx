import { AddCircle } from "@/components/Icon";
import { FormRequest } from "@/utils/types";
import { Flex, Select } from "@mantine/core";
import { FC, memo, useCallback, useEffect, useState } from "react";
import {
  Control,
  useFieldArray,
  UseFormGetValues,
  useFormState,
} from "react-hook-form";

type Props = {
  control: Control<FormRequest>;
  questionIndex: number;
  getValues: UseFormGetValues<FormRequest>;
};

const QuestionOptionsBuilder: FC<Props> = (props) => {
  const { control, questionIndex, getValues } = props;
  const isInEditMode = getValues().form_id ? true : false;
  const [valueToRemove, setValueToRemove] = useState("");
  const [search, setSearch] = useState("");

  const {
    append: appendOption,
    fields: optionList,
    remove: removeOption,
  } = useFieldArray({
    control,
    name: `questions.${questionIndex}.option`,
    rules: {
      required: "Option is required",
      minLength: {
        value: 2,
        message: "Option must be two or more",
      },
    },
  });

  const { errors } = useFormState({
    control,
    name: `questions.${questionIndex}.option`,
  });

  const handleOnCreateOption = useCallback(
    (value: string) => {
      appendOption({ value });
      setValueToRemove("");
      setSearch("");
      return "";
    },
    [appendOption]
  );

  const handleRemoveOption = useCallback(
    (value: string) => {
      const optionIndex = optionList.findIndex((item) => item.value === value);
      removeOption(optionIndex);
    },
    [optionList, removeOption]
  );

  useEffect(() => {
    if (!valueToRemove) return;
    handleRemoveOption(valueToRemove);
    setValueToRemove("");
  }, [handleRemoveOption, valueToRemove]);

  return (
    <Select
      placeholder="Type option name to create"
      withAsterisk
      label="Add Option"
      searchable
      creatable
      searchValue={search}
      onChangeCapture={(e) => setSearch(e.currentTarget.value)}
      getCreateLabel={(query) => (
        <Flex align="center">
          <AddCircle />
          &nbsp;Add&nbsp;{query}
        </Flex>
      )}
      data={optionList.map((item) => ({ ...item, label: item.value }))}
      onChange={(v) => setValueToRemove(v as string)}
      onCreate={(v) => handleOnCreateOption(v as string)}
      description="Select the item to remove from the list"
      error={errors.questions?.[questionIndex]?.option?.root?.message}
      disabled={isInEditMode}
      data-cy="select-field"
    />
  );
};

export default memo(QuestionOptionsBuilder);
