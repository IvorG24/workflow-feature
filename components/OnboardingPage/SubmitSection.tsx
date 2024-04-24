import { Button, Group } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";
import { useFormContext } from "react-hook-form";
import { OnboardUserParams } from "./OnboardingPage";

type Props = {
  activeStep: number;
  setActiveStep: Dispatch<SetStateAction<number>>;
  inputList: string[];
};

const SubmitSection = ({ activeStep, setActiveStep, inputList }: Props) => {
  const {
    // trigger,
    // formState: { errors },
  } = useFormContext<OnboardUserParams>();
  console.log(inputList);
  return (
    <Group spacing="md" position="right">
      {activeStep > 1 && (
        <Button
          variant="outline"
          w={120}
          sx={{ fontSize: 16 }}
          onClick={() => setActiveStep((prev) => prev - 1)}
        >
          Go Back
        </Button>
      )}
      <Button
        w={120}
        sx={{ fontSize: 16 }}
        type="submit"
        onClick={() => setActiveStep((prev) => prev + 1)}
      >
        Next
      </Button>
    </Group>
  );
};

export default SubmitSection;
