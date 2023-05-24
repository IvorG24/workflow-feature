import { Container, Title } from "@mantine/core";

// const guideFunction = async () => {
//   const teamId = uuidv4();

//   let imageUrl = "";
//   if (image) {
//     imageUrl = await uploadImage(supabaseClient, {
//       id: teamId,
//       image: image,
//       bucket: "TEAM_LOGOS",
//     });
//   }

//   const teamData = await createTeam(supabaseClient, {
//     team_id: teamId,
//     team_name: "Test Team",
//     team_user_id: TEMP_USER_ID,
//     team_logo: imageUrl,
//   });

//   const ownerData = (
//     await createTeamMember(supabaseClient, {
//       team_member_team_id: teamData.team_id,
//       team_member_user_id: TEMP_USER_ID,
//       team_member_member_role: "OWNER",
//     })
//   )[0];

// const invitationData = await createTeamInvitation(supabaseClient, [
//   {
//     invitation_from_team_member_id: ownerData.team_member_id,
//     invitation_to_email: "testemail@gmail.com",
//   },
// ]);

//   setTeam(teamData);
//   setMember(ownerData);
//   setInvitation(invitationData);
//   setUrl(imageUrl);
// };

const CreateTeamPage = () => {
  return (
    <Container>
      <Title>Create Team Page</Title>
    </Container>
  );
};

export default CreateTeamPage;
