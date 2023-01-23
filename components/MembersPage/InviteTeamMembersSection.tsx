import { Database } from "@/utils/database.types";
import {
  createNotification,
  createTeamInvitation,
  getTeam,
  getUserIdListFromEmailList,
} from "@/utils/queries-new";
import { NotificationTableInsert } from "@/utils/types-new";
import { Button, Flex, MultiSelect } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import validator from "validator";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string;
  bg_url: string;
};

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
    reset,
  } = useForm<{ emails: string[] }>();
  const router = useRouter();
  const supabaseClient = useSupabaseClient<Database>();
  const user = useUser();
  const [emails, setEmails] = useState<{ value: string; label: string }[]>([]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!user) throw new Error("User not found");
      if (!router.query.tid) throw new Error("Team ID not found in URL");

      // * Purpose: We create team invitation for all the user emails provided by user in the form.
      const teamInvitationList = await createTeamInvitation(
        supabaseClient,
        router.query.tid as string,
        user.id,
        data.emails
      );

      // * Purpose: We remove emails of users that aren't registered yet to the app so we don't create in-app notification for them.
      const userIdWithEmailList = await getUserIdListFromEmailList(
        supabaseClient,
        data.emails
      );

      if (!userIdWithEmailList) return;

      // Check if email is in userIdWithEmailList. e.g. userIdWithEmailList { userId: "123", userEmail: "dw@dwda.com" }
      const existingUserIdWithEmailList = userIdWithEmailList.filter(
        (userIdWithEmail) => {
          return data.emails.includes(userIdWithEmail.userEmail);
        }
      );

      // * Purpose: We create in-app notification for users that are registered in the app.
      // * Use createNotification() function to create notification for each user.
      // * Use Promise.all() to create notification for all users at the same time.

      // Get team name.
      const team = await getTeam(supabaseClient, router.query.tid as string);
      const teamName = team && team[0].team_name;

      const promises = existingUserIdWithEmailList.map(
        ({ userId, userEmail }) => {
          // Get the created invitation from teamInvitationList that matches the userEmail.
          const teamInvitation = teamInvitationList.find(
            (teamInvitation) =>
              teamInvitation.invitation_target_email === userEmail
          );
          const notificationInsertInput: NotificationTableInsert = {
            notification_content: `${user.email} has invited you to join their team ${teamName}.`,
            notification_redirect_url: `/team-invitations/${teamInvitation?.invitation_id}`,
          };

          return createNotification(
            supabaseClient,
            userId,
            notificationInsertInput
          );
        }
      );

      await Promise.all(promises);

      showNotification({
        title: "Success!",
        message: "Invitations sent successfully",
        color: "green",
      });
      reset();
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error",
        message: "Failed to send invites",
        color: "red",
      });
    }
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
          data-cy="team-select-members"
        />
        <Button
          type="submit"
          fullWidth
          maw={{ md: "150px", lg: "200px" }}
          size="md"
          data-cy="submit"
        >
          Send Invites
        </Button>
      </Flex>
    </form>
  );
};

export default InviteTeamMembersSection;
