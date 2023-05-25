// todo: Create deleteQuestion query
// import deleteQuestion from "@/services/question/deleteQuestion";

import {
  QuestionWithFieldArrayId,
  SectionWithFieldArrayId,
} from "@/utils/react-hook-form";
import { Question as QuestionType } from "@/utils/types";
import {
  Box,
  Button,
  Container,
  ContainerProps,
  Divider,
  TextInput,
  createStyles,
} from "@mantine/core";
import { IconCirclePlus } from "@tabler/icons-react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import useDeepCompareEffect from "use-deep-compare-effect";
import { v4 as uuidv4 } from "uuid";
import Question from "./Question";

export type Mode = "answer" | "edit" | "view";

type Props = {
  formType: AppId;
  section: SectionWithFieldArrayId;
  sectionIndex: number;
  onDelete?: (sectionId: string) => void;
  questions: QuestionType[];
  formId?: string;
  mode?: Mode;
} & ContainerProps;

type UseStylesProps = {
  mode: Mode;
};

const useStyles = createStyles((theme, { mode }: UseStylesProps) => ({
  container: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? mode === "edit"
          ? theme.colors.dark[6]
          : theme.colors.dark[7]
        : mode === "edit"
        ? theme.colors.gray[0]
        : "#fff",
    borderRadius: 4,
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[2]
    }
    `,
    paddingInline: "32px",
    paddingTop: "16px",
    paddingBottom: mode === "edit" ? "16px" : "32px",
  },
  sectionName: {
    "& input": {
      fontSize: 18,
      fontWeight: 500,
    },
  },
}));

const Section = ({
  formType,
  section,
  sectionIndex,
  onDelete,
  formId,
  mode = "edit",
  ...props
}: Props) => {
  const { classes } = useStyles({ mode });
  const methods = useFormContext();

  const {
    fields: questions,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control: methods.control,
    name: `sections.${sectionIndex}.question_table`,
  });

  const watchedData = useWatch({
    control: methods.control,
    defaultValue: section,
  });

  // this is to update the question order when a question is removed
  useDeepCompareEffect(() => {
    questions.forEach((question, index) => {
      methods.setValue(
        `sections.${sectionIndex}.question_table.${index}.question_order`,
        index + 1
      );
    });
  }, [watchedData]);

  return (
    <Container
      maw={768}
      className={classes.container}
      key={section.id}
      {...props}
    >
      <Box maw={522}>
        {!(mode === "answer" && !section.section_name) && (
          <Box>
            <TextInput
              variant="unstyled"
              size="lg"
              className={classes.sectionName}
              {...methods.register(`sections.${sectionIndex}.section_name`)}
              aria-label={`sections.${sectionIndex}.name`}
              placeholder="Section Name"
              readOnly={mode !== "edit"}
            />
            {mode === "edit" && <Divider mt={-4} />}
          </Box>
        )}
        {questions.map((question, questionIndex) => (
          <Box key={question.id} mt={questionIndex === 0 ? 24 : 16}>
            <Question
              formType={formType}
              questionIndex={questionIndex}
              question={question as QuestionWithFieldArrayId}
              sectionIndex={sectionIndex}
              onDelete={() => removeQuestion(questionIndex)}
              mode={mode}
            />
          </Box>
        ))}
      </Box>

      {mode === "edit" && (
        <>
          <Button
            onClick={() =>
              appendQuestion({
                question_id: uuidv4(),
                question_prompt: "Question",
                question_type: formType === "REQUEST" ? "TEXT" : "SLIDER",
                section_id: section.section_id,
                form_id: formId,
                question_is_required: false,
                question_min: 1,
                question_max: 5,
                question_is_positive: true,
                question_order: questions.length + 1,
              })
            }
            size="xs"
            mt={questions.length > 0 ? 32 : 64}
            leftIcon={<IconCirclePlus height={16} />}
          >
            Add a Question
          </Button>

          <Divider mt={24} />
          <Button
            size="xs"
            color="red"
            variant="subtle"
            mt={16}
            onClick={() => {
              onDelete && onDelete(section.section_id);
            }}
          >
            Remove Section
          </Button>
        </>
      )}
    </Container>
  );
};

export default Section;
