DROP FUNCTION IF EXISTS equipment_seed;
CREATE FUNCTION equipment_seed()
RETURNS VOID AS $$
  plv8.subtransaction(function(){
    const consumableItemData = plv8.execute(`SELECT * FROM item_table WHERE item_gl_account = 'Fuel, Oil, Lubricants'`);
    consumableItemData.forEach(item => {
      const descriptionData = plv8.execute(`SELECT * FROM item_description_table WHERE item_description_item_id = '${item.item_id}'`);
      descriptionData.forEach(description => {
        const fieldData = plv8.execute(
          `
            INSERT INTO field_table 
              (field_name, field_is_required, field_type, field_order, field_is_read_only, field_section_id) 
            VALUES 
              ('${description.item_description_label}', true, 'DROPDOWN', 12, false, 'b232d5a5-6212-405e-8d35-5f9127dca1aa')
            RETURNING *
          `
        )[0];

        plv8.execute(
          `
            INSERT INTO item_description_consumable_field_table
              (item_description_consumable_field_item_description_id, item_description_consumable_field_field_id) 
            VALUES 
              ('${description.item_description_id}', '${fieldData.field_id}')
            RETURNING *
          `
        );
      });
    });
  })
$$ LANGUAGE plv8;
SELECT equipment_seed();
DROP FUNCTION IF EXISTS equipment_seed;