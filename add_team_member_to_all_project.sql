CREATE OR REPLACE FUNCTION add_team_member_to_all_project(
  input_data JSON
)
RETURNS VOID AS $$
  plv8.subtransaction(function(){
    const {
      teamMemberIdList
    } = input_data;
    
    const teamProjectData = plv8.execute(
      `
        SELECT team_project_id
        FROM team_schema.team_project_table
        WHERE
          team_project_is_disabled = false
      `
    );

    teamMemberIdList.forEach(teamMemberId => {
      teamProjectData.forEach(teamProject => {
        plv8.execute(
          `
            INSERT INTO team_schema.team_project_member_table (team_member_id, team_project_id)
            SELECT '${teamMemberId}', '${teamProject.team_project_id}'
            WHERE NOT EXISTS (
              SELECT team_project_member_id
              FROM team_schema.team_project_member_table
              WHERE 
                team_member_id = '${teamMemberId}'
                AND team_project_id = '${teamProject.team_project_id}'
            )
          `
        )
      })
    });
 });
$$ LANGUAGE plv8;