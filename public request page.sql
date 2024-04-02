CREATE OR REPLACE FUNCTION fetch_request_page_section(
  input_data JSON
)
RETURNS JSON AS $$
let returnData = [];
plv8.subtransaction(function(){
  const {
    index,
    requestId,
    sectionId,
    fieldData,
    duplicatableSectionIdCondition,
    isPedItemAndSingle
  } = input_data;

  const specialSection = ['0672ef7d-849d-4bc7-81b1-7a5eefcc1451', 'b232d5a5-6212-405e-8d35-5f9127dca1aa'];

  if (!fieldData) {
    const fieldList = plv8.execute(
      `
        SELECT DISTINCT field_table.*
        FROM field_table
        INNER JOIN request_response_table ON request_response_field_id = field_id
        WHERE 
          ${
            specialSection.includes(sectionId) ?
            `field_section_id IN ('0672ef7d-849d-4bc7-81b1-7a5eefcc1451', 'b232d5a5-6212-405e-8d35-5f9127dca1aa')` :
            `field_section_id = '${sectionId}'`
          }
          AND request_response_request_id = '${requestId}'
          AND (
            request_response_duplicatable_section_id IN (${duplicatableSectionIdCondition})
            ${index === 0 ? "OR request_response_duplicatable_section_id IS NULL" : ""}
          )
        ORDER BY field_order ASC
      `
    );
    let fieldWithResponse = []
    
    fieldWithResponse = fieldList.map(field => {
      const requestResponseData = plv8.execute(
        `
          SELECT *
          FROM request_response_table
          WHERE request_response_request_id = '${requestId}'
          AND request_response_field_id = '${field.field_id}'
          AND (
            request_response_duplicatable_section_id IN (${duplicatableSectionIdCondition})
            ${index === 0 ? "OR request_response_duplicatable_section_id IS NULL" : ""}
          )
        `
      );

      return {
        ...field,
        field_response: requestResponseData
      };
    });

    if (isPedItemAndSingle && fieldWithResponse.length !== 0) {
      fieldWithResponse[0].field_response = fieldWithResponse[0].field_response.map(fieldResponse => {
        const categoryData = plv8.execute(
          `
            SELECT equipment_description_property_number_with_prefix FROM equipment_description_view 
            WHERE equipment_description_property_number = '${JSON.parse(fieldResponse.request_response)}' 
          `
        )[0].equipment_description_property_number_with_prefix;

        return {
          ...fieldResponse,
          request_response: `"${categoryData}"`
        }
      });
    }

    returnData = fieldWithResponse;
  } else {
    let fieldWithResponse = []
    
    fieldWithResponse = fieldData.map(field => {
      const requestResponseData = plv8.execute(
        `
          SELECT *
          FROM request_response_table
          WHERE request_response_request_id = '${requestId}'
          AND request_response_field_id = '${field.field_id}'
          AND (
            request_response_duplicatable_section_id IN (${duplicatableSectionIdCondition})
            ${index === 0 ? "OR request_response_duplicatable_section_id IS NULL" : ""}
          )
        `
      );

      return {
        ...field,
        field_response: requestResponseData
      };
    });

    returnData = fieldWithResponse;
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION public_request_page_on_load(
  input_data JSON
)
RETURNS JSON as $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      requestId
    } = input_data;

    const idCondition = plv8.execute(`SELECT generate_request_id_condition('${requestId}')`)[0].generate_request_id_condition;

    const request = plv8.execute(
      `
        SELECT 
          form_is_formsly_form, 
          form_name
        FROM request_view
        INNER JOIN form_table ON form_id = request_form_id
        WHERE 
          ${idCondition}
          AND request_is_disabled = false
      `
    )[0];

    if (!request.form_is_formsly_form || (request.form_is_formsly_form && request.form_name === "Subcon") || request.form_is_formsly_form && request.form_name === "Request For Payment") {
      const requestData = plv8.execute(`SELECT get_request('${requestId}')`)[0].get_request;
      if(!request) throw new Error('404');
      returnData = {
        request: requestData
      };
      return;
    } else {
      const requestData = plv8.execute(`SELECT get_request_without_duplicatable_section('${requestId}')`)[0].get_request_without_duplicatable_section;
      if(!request) throw new Error('404');

      const duplicatableSectionIdList = plv8.execute(
        `
          SELECT DISTINCT(request_response_duplicatable_section_id)
          FROM request_response_table
          WHERE 
            request_response_request_id = '${requestData.request_id}'
            AND request_response_duplicatable_section_id IS NOT NULL
        `
      ).map(response => response.request_response_duplicatable_section_id);

      returnData =  {
        request: requestData,
        duplicatableSectionIdList
      };
    }
 });
 return returnData;
$$ LANGUAGE plv8;