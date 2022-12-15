import { FieldTypeEnum } from "./types";

type ExpectedResponseType = {
  value: FieldTypeEnum;
};

const EXPECTED_RESPONSE_TYPE_VALUE: ExpectedResponseType[] = [
  {
    value: "number",
  },
  {
    value: "text",
  },
  {
    value: "date",
  },
  {
    value: "daterange",
  },
  {
    value: "email",
  },
  {
    value: "multiple",
  },
  {
    value: "slider",
  },
  {
    value: "select",
  },
  {
    value: "time",
  },
];

export { EXPECTED_RESPONSE_TYPE_VALUE };
