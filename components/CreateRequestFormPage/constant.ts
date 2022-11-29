import { InputTypes } from "@/components/CreateRequestFormPage/type";

type ExpectedResponseType = {
  value: InputTypes;
};

const dummyDataPriorityIndex = [56, 55, 31, 30];

const dummyRequestData = {
  form_name: "Peer Review",
  questions: [
    {
      question_id: 30,
      question: "Documentation",
      expected_response_type: "text",
    },
    {
      question_id: 31,
      question: "Technical",
      expected_response_type: "text",
    },
    {
      question_id: 55,
      question: "Assist-Peer",
      expected_response_type: "text",
    },
    {
      question_id: 56,
      question: "Presentation",
      expected_response_type: "text",
    },
  ],
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

export {
  EXPECTED_RESPONSE_TYPE_VALUE,
  dummyDataPriorityIndex,
  dummyRequestData,
};
