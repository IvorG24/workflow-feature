DROP VIEW IF EXISTS request_list_table_view;

-- Start creating views

CREATE VIEW request_list_table_view AS
SELECT
  r.request_id,
  r.request_date_created,
  r.request_status,
  r.request_team_member_id,
  tm.team_member_team_id as request_team_id,
  json_build_object(
    'user_id', tm.team_member_user_id,
    'user_first_name', u.user_first_name,
    'user_last_name', u.user_last_name,
    'user_avatar', u.user_avatar,
    'team_id', tm.team_member_team_id
  ) AS request_requestor,
  f.form_id AS request_form_id,
  f.form_name,
  f.form_description,
  json_agg(
    json_build_object(
      'request_signer_id', rs.request_signer_id,
      'is_primary_signer', s.signer_is_primary_signer,
      'team_member_id', stm.team_member_user_id,
      'user_first_name', su.user_first_name,
      'user_last_name', su.user_last_name,
      'user_avatar', su.user_avatar
    )
  ) AS request_signers
FROM
  request_table AS r
  LEFT JOIN team_member_table AS tm ON r.request_team_member_id = tm.team_member_id
  LEFT JOIN user_table AS u ON tm.team_member_user_id = u.user_id
  LEFT JOIN form_table AS f ON r.request_form_id = f.form_id
  LEFT JOIN request_signer_table AS rs ON r.request_id = rs.request_signer_request_id
  LEFT JOIN signer_table AS s ON rs.request_signer_signer_id = s.signer_id
  LEFT JOIN team_member_table AS stm ON s.signer_team_member_id = stm.team_member_id
  LEFT JOIN user_table AS su ON stm.team_member_user_id = su.user_id
GROUP BY
  r.request_id,
  r.request_date_created,
  r.request_status,
  tm.team_member_user_id,
  u.user_first_name,
  u.user_last_name,
  u.user_avatar,
  tm.team_member_team_id,
  f.form_id,
  f.form_name,
  f.form_description;

-- End creating views

GRANT ALL ON ALL TABLES IN SCHEMA public TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA public TO POSTGRES;

GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;