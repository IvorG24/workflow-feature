import { MemberRoleType, TeamWithTeamMemberType } from "@/utils/types";
import { ActionIcon, Menu } from "@mantine/core";
import {
  IconArrowsLeftRight,
  IconDotsVertical,
  IconTrash,
  IconUserDown,
  IconUserShare,
  IconUserUp,
} from "@tabler/icons-react";
import router from "next/router";

type Props = {
  member: TeamWithTeamMemberType["team_member"][0];
  authUser: TeamWithTeamMemberType["team_member"][0];
  onUpdateMemberRole: (memberId: string, role: MemberRoleType) => void;
  onRemoveFromTeam: (memberId: string) => void;
  onTransferOwnership: (ownerId: string, memberId: string) => void;
};

const rolesOrder = { OWNER: 1, ADMIN: 2, MEMBER: 3 };

const TeamMemberMenu = ({
  member,
  authUser,
  onRemoveFromTeam,
  onUpdateMemberRole,
  onTransferOwnership,
}: Props) => {
  const defaultMenuIconProps = { size: 20 };

  const canUserUpdateMember =
    authUser &&
    authUser.team_member_role !== "MEMBER" &&
    authUser.team_member_user.user_id !== member.team_member_user.user_id &&
    rolesOrder[authUser.team_member_role] < rolesOrder[member.team_member_role];

  const canUserAccessDangerZone =
    authUser &&
    (authUser.team_member_role === "OWNER" ||
      authUser.team_member_role === "ADMIN");

  return (
    <Menu position="left-start" width={200} withArrow>
      <Menu.Target>
        <ActionIcon>
          <IconDotsVertical />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          c="indigo"
          icon={<IconUserShare {...defaultMenuIconProps} />}
          onClick={() =>
            router.push(
              `/team-reviews/users/${member.team_member_user.user_id}`
            )
          }
        >
          View Profile
        </Menu.Item>
        {canUserUpdateMember && (
          <>
            {member.team_member_role !== "OWNER" && (
              <>
                <Menu.Divider />
                <Menu.Label>Team Role</Menu.Label>
                {member.team_member_role !== "ADMIN" ? (
                  <Menu.Item
                    icon={<IconUserUp {...defaultMenuIconProps} />}
                    onClick={() =>
                      onUpdateMemberRole(member.team_member_id, "ADMIN")
                    }
                  >
                    Promote to Admin
                  </Menu.Item>
                ) : (
                  <Menu.Item
                    icon={<IconUserDown {...defaultMenuIconProps} />}
                    onClick={() =>
                      onUpdateMemberRole(member.team_member_id, "MEMBER")
                    }
                  >
                    Demote to Member
                  </Menu.Item>
                )}
              </>
            )}

            {canUserAccessDangerZone && (
              <>
                <Menu.Divider />
                <Menu.Label>Danger zone</Menu.Label>

                {authUser.team_member_role === "OWNER" && (
                  <Menu.Item
                    icon={<IconArrowsLeftRight {...defaultMenuIconProps} />}
                    onClick={() =>
                      onTransferOwnership(
                        authUser.team_member_id,
                        member.team_member_id
                      )
                    }
                  >
                    Transfer Team Ownership
                  </Menu.Item>
                )}

                <Menu.Item
                  color="red"
                  icon={<IconTrash {...defaultMenuIconProps} />}
                  onClick={() => onRemoveFromTeam(member.team_member_id)}
                >
                  Remove From Team
                </Menu.Item>
              </>
            )}
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};

export default TeamMemberMenu;
