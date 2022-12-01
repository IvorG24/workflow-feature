import { Button, Flex, MultiSelect } from "@mantine/core";
import { FormEvent, useState } from "react";
import validator from "validator";
import { Member } from "./MembersPage";

type Props = {
  members: Member[];
};

const InviteTeamMembersSection = ({ members }: Props) => {
  const [emails, setEmails] = useState<{ value: string; label: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (emails.length === 0) {
      setError("No email provided.");
      return;
    }

    //  don't invite if email is already in workspace
    const memberEmails = members.map((m) => m.email);
    const isAlreadyAMember = emails.some((email) =>
      memberEmails.includes(email.value)
    );

    if (isAlreadyAMember) {
      setError("Cannot invite existing members.");
      return;
    }
  };

  return (
    <form
      data-testid="team__sendInvitesForm"
      autoComplete="off"
      onSubmit={handleFormSubmit}
    >
      <Flex gap="sm" align="center" direction={{ base: "column", md: "row" }}>
        <MultiSelect
          data={emails}
          placeholder="Add users"
          size="md"
          searchable
          creatable
          getCreateLabel={(query) => `+ Create ${query}`}
          onCreate={(query) => {
            if (validator.isEmail(query)) {
              setError(null);
              const item = { value: query, label: query };
              setEmails((current) => [...current, item]);
              return item;
            } else {
              setError("Email is invalid");
              return null;
            }
          }}
          w="100%"
          error={error}
        />
        <Button fullWidth maw={{ md: "150px", lg: "200px" }} size="md">
          Send Invites
        </Button>
      </Flex>
    </form>
  );
};

export default InviteTeamMembersSection;
