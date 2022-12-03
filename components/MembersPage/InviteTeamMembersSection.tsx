import { Button, Flex, MultiSelect } from "@mantine/core";
import { useState } from "react";
import { useForm } from "react-hook-form";
import validator from "validator";
import { Member } from "./MembersPage";

type Props = {
  members: Member[];
};

const InviteTeamMembersSection = ({ members }: Props) => {
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<{ emails: string[] }>();
  const [emails, setEmails] = useState<{ value: string; label: string }[]>([]);

  const onSubmit = handleSubmit(async (data) => {
    console.log(data.emails);
  });

  const emailExists = (newEmail: string) => {
    const memberEmails = members.map((m) => m.email);
    return memberEmails.includes(newEmail);
  };

  const handleCreateQuery = (query: string) => {
    if (!validator.isEmail(query)) {
      setError("emails", { message: "Email is invalid" });
      return null;
    }
    if (emailExists(query)) {
      setError("emails", { message: "Email already exist" });
      return null;
    }
    setError("emails", { message: "" });
    const item = { value: query, label: query };
    setEmails((current) => [...current, item]);
    return item;
  };
  return (
    <form
      data-testid="team__sendInvitesForm"
      autoComplete="off"
      onSubmit={onSubmit}
    >
      <Flex gap="sm" align="center" direction={{ base: "column", md: "row" }}>
        <MultiSelect
          data={emails}
          placeholder="Add users"
          size="md"
          searchable
          creatable
          getCreateLabel={(query) => `+ Create ${query}`}
          onCreate={(query) => handleCreateQuery(query)}
          w="100%"
          {...register("emails", { required: "Email is required" })}
          onChange={(e) => setValue("emails", e)}
          error={errors.emails?.message}
        />
        <Button
          type="submit"
          fullWidth
          maw={{ md: "150px", lg: "200px" }}
          size="md"
        >
          Send Invites
        </Button>
      </Flex>
    </form>
  );
};

export default InviteTeamMembersSection;
