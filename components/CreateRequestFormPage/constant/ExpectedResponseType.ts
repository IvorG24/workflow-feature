import { InputTypes } from "@/components/CreateRequestFormPage/type/FormModel";

type ExpectedResponseType = {
  value: InputTypes;
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

export default EXPECTED_RESPONSE_TYPE_VALUE;
