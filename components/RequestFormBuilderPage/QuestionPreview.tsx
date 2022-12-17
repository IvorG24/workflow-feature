import { FormQuestion } from "@/utils/types";
import {
  Box,
  MultiSelect,
  NumberInput,
  Select,
  Slider,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { DatePicker, DateRangePicker, TimeInput } from "@mantine/dates";
import { FC } from "react";

type Props = {
  question: FormQuestion;
};

type ParseOption = {
  label: string;
  value: string;
};
type Marks = {
  value: number;
  label: string;
};

const GENERIC_PLACEHOLDER = "Your Response...";
const MARKS: Marks[] = [
  {
    value: 1,
    label: "0%",
  },
  {
    value: 2,
    label: "25%",
  },
  {
    value: 3,
    label: "50%",
  },
  {
    value: 4,
    label: "75%",
  },
  {
    value: 5,
    label: "100%",
  },
];

const QuestionPreview: FC<Props> = (props) => {
  const { question } = props;
  const { data, option, fieldTooltip } = question;

  const parseOption = option?.map((item) => ({
    ...item,
    label: item.value,
  })) as ParseOption[];

  const renderTooltip = (element: JSX.Element) => {
    if (fieldTooltip) {
      return (
        <Tooltip label={fieldTooltip} withArrow>
          {element}
        </Tooltip>
      );
    } else {
      return element;
    }
  };

  if (data.expected_response_type === "text") {
    return (
      <Box>
        {renderTooltip(
          <Textarea label={data.question} placeholder={GENERIC_PLACEHOLDER} />
        )}
      </Box>
    );
  }

  if (data.expected_response_type === "number") {
    return (
      <Box>
        {renderTooltip(
          <NumberInput
            label={data.question}
            placeholder={GENERIC_PLACEHOLDER}
          />
        )}
      </Box>
    );
  }

  if (data.expected_response_type === "date") {
    return (
      <Box>
        {renderTooltip(
          <DatePicker label={data.question} placeholder={GENERIC_PLACEHOLDER} />
        )}
      </Box>
    );
  }

  if (data.expected_response_type === "daterange") {
    return (
      <Box>
        {renderTooltip(
          <DateRangePicker
            label={data.question}
            placeholder={GENERIC_PLACEHOLDER}
          />
        )}
      </Box>
    );
  }

  if (data.expected_response_type === "email") {
    return (
      <Box>
        {renderTooltip(
          <TextInput
            type="email"
            label={data.question}
            placeholder={GENERIC_PLACEHOLDER}
          />
        )}
      </Box>
    );
  }

  if (data.expected_response_type === "multiple") {
    return (
      <Box>
        {renderTooltip(
          <MultiSelect
            data={parseOption}
            label={data.question}
            placeholder={GENERIC_PLACEHOLDER}
          />
        )}
      </Box>
    );
  }

  if (data.expected_response_type === "select") {
    return (
      <Box>
        {renderTooltip(
          <Select
            data={parseOption}
            searchable
            clearable
            label={data.question}
            placeholder={GENERIC_PLACEHOLDER}
          />
        )}
      </Box>
    );
  }

  if (data.expected_response_type === "slider") {
    return (
      <Box my="md">
        {renderTooltip(
          <Text component="label" color="dark">
            {data.question}
          </Text>
        )}
        <Slider
          label={data.question}
          placeholder={GENERIC_PLACEHOLDER}
          marks={MARKS}
          min={1}
          max={5}
          labelAlwaysOn={false}
        />
      </Box>
    );
  }

  if (data.expected_response_type === "time") {
    return (
      <Box>
        {renderTooltip(
          <TimeInput
            label={data.question}
            placeholder={GENERIC_PLACEHOLDER}
            format="12"
          />
        )}
      </Box>
    );
  }

  return null;
};

export default QuestionPreview;
