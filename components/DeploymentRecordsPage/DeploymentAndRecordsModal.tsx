import { fetchAssigneeinformation } from "@/backend/api/get";
import {
  checkHRISNumber,
  handleUpdateEmployeeHrisId,
} from "@/backend/api/post";
import { useActiveTeam } from "@/stores/useTeamStore";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { AssigneeInformation } from "@/utils/types";
import {
  Anchor,
  Button,
  Flex,
  Loader,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

type Props = {
  handleFetch: () => void;
  requestId: string;
};

type ModalFormType = {
  hrisId: string;
  position: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  contactNumber: string;
};

const DeploymentAndRecordsModal = ({ requestId, handleFetch }: Props) => {
  const [assigneeInformation, setAssigneeInformation] =
    useState<AssigneeInformation | null>(null);
  const supabaseClient = useSupabaseClient();
  const activeTeam = useActiveTeam();
  const {
    register,
    handleSubmit,
    reset,
    control,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<ModalFormType>({
    mode: "onChange",
    defaultValues: {
      hrisId: "",
      position: assigneeInformation?.position,
      firstName: assigneeInformation?.firstName,
      middleName: assigneeInformation?.middleName,
      lastName: assigneeInformation?.lastName,
      email: assigneeInformation?.email,
      contactNumber: assigneeInformation?.contactNumber,
    },
  });

  const handleUpdateHrisId = async (data: ModalFormType) => {
    try {
      await handleUpdateEmployeeHrisId(supabaseClient, {
        employeeData: data,
        requestId: requestId,
      });
      notifications.show({
        message: "Updated Sucessfully",
        color: "green",
      });
      handleFetch();
      modals.close("updateModal");
    } catch (e) {
      notifications.show({
        message: "Something went wrong",
        color: "red",
      });
    }
  };

  const openModal = () => {
    modals.open({
      modalId: "updateModal",
      title: (
        <Text>
          Please provide the HRIS ID for the applicant&apos;s laptop request.
        </Text>
      ),
      children: (
        <form onSubmit={handleSubmit(handleUpdateHrisId)}>
          <Stack>
            <Controller
              name="hrisId"
              control={control}
              rules={{
                required: "HRIS ID is required.",
                validate: async (value) => {
                  const isHRISUnique = await checkHRISNumber(supabaseClient, {
                    hrisNumber: value || "",
                  });

                  return isHRISUnique ? true : "HRIS ID Does Not Exist";
                },
              }}
              render={({ field, fieldState }) => (
                <TextInput
                  label="HRIS ID"
                  type="number"
                  placeholder="Enter the HRIS ID"
                  withAsterisk
                  error={
                    fieldState.error?.message === "HRIS ID Does Not Exist" ? (
                      <Text>
                        HRIS ID Does Not Exist. Please{" "}
                        <Anchor
                          href={`/${formatTeamNameToUrlKey(activeTeam.team_name)}/settings`}
                          target="_blank"
                        >
                          Go To Manage Team
                        </Anchor>{" "}
                        To Create An Employee.
                      </Text>
                    ) : (
                      errors.hrisId?.message
                    )
                  }
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    trigger("hrisId");
                  }}
                />
              )}
            />
            <TextInput
              label="Position"
              readOnly
              {...register("position", {
                required: "Position is required",
              })}
              error={errors.firstName?.message}
            />

            <TextInput
              label="First Name"
              readOnly
              {...register("firstName", {
                required: "First name is required.",
              })}
              error={errors.firstName?.message}
            />

            <TextInput
              label="Middle Name"
              readOnly
              {...register("middleName")}
              error={errors.middleName?.message}
            />

            <TextInput
              label="Last Name"
              readOnly
              {...register("lastName", { required: "Last name is required." })}
              error={errors.lastName?.message}
            />

            <TextInput
              label="Email"
              readOnly
              {...register("email", { required: "Email is required." })}
              error={errors.email?.message}
            />

            <TextInput
              label="Contact Number"
              readOnly
              icon="+63 "
              {...register("contactNumber", {
                required: "Contact number is required.",
              })}
              error={errors.contactNumber?.message}
            />

            <Flex mt="md" align="center" justify="flex-end" gap="sm">
              <Button
                variant="default"
                color="dimmed"
                onClick={() => {
                  modals.close("updateModal");
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isSubmitting ? <Loader /> : "Save"}
              </Button>
            </Flex>
          </Stack>
        </form>
      ),
      centered: true,
    });
  };

  const handleFetchApplicantInfo = async (requestId: string) => {
    try {
      const data = await fetchAssigneeinformation(supabaseClient, {
        requestId,
      });
      setAssigneeInformation(data);
      openModal();
    } catch (e) {
    } finally {
    }
  };

  const handleModelOpen = (requestId: string) => {
    try {
      handleFetchApplicantInfo(requestId);
    } catch (e) {}
  };

  useEffect(() => {
    if (assigneeInformation) {
      reset({
        hrisId: "",
        position: assigneeInformation.position,
        firstName: assigneeInformation.firstName,
        middleName: assigneeInformation.middleName,
        lastName: assigneeInformation.lastName,
        email: assigneeInformation.email,
        contactNumber: assigneeInformation.contactNumber,
      });
    }
  }, [assigneeInformation, reset]);

  return (
    <Button
      variant="light"
      maw={120}
      onClick={() => handleModelOpen(requestId)}
      color="blue"
    >
      Edit HRIS ID
    </Button>
  );
};

export default DeploymentAndRecordsModal;
