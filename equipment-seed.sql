DROP FUNCTION IF EXISTS equipment_seed;
CREATE FUNCTION equipment_seed()
RETURNS VOID AS $$
  plv8.subtransaction(function(){

    const categoryList = [
      "AIR EQUIPMENT",
      "HAULING EQUIPMENT",
      "SPECIAL SUPPORT EQUIPMENT",
      "ASPHALTING EQUIPMENT",
      "EXCAVATING EQUIPMENT",
      "FOUNDATION EQUIPMENT",
      "PLANTS",
      "MISCELLANEOUS EQUIPMENT",
      "CONCRETING EQUIPMENT",
      "COMPACTION EQUIPMENT",
      "LIFTING EQUIPMENT",
      "EARTHMOVING EQUIPMENT",
      "DRILLING EQUIPMENT",
      "SHOP EQUIPMENT",
      "CRANE ATTACHMENT",
      "POWER GENERATING EQUIPMENT",
      "MINING EQUIPMENT",
      "SUPPORTING EQUIPMENT",
      "BREAKING EQUIPMENT",
      "TUNNELING EQUIPMENT",
      "SUSPENDED PLATFORM EQUIPMENT",
      "PUMPING EQUIPMENT"
    ];

    const equipmentNameList = [
      "AIR COMPRESSOR",
      "ARTICULATED DUMP TRUCK",
      "AMBULANCE",
      "ASPHALT PAVER",
      "BULK CARRIER/CEMENT  TRUCK",
      "BREAKER UNIT",
      "BACKHOE LOADER",
      "BORING MACHINE AXIS LASER GUIDED",
      "BATCHING PLANT",
      "COMMANDO DRILL",
      "CONTAINERIZED CHILLED WATER PLANT",
      "CONCRETE PUMP",
      "CONCRETE PUMP (STATIONARY)",
      "COMBINATION ROLLER",
      "CRAWLER CRANE",
      "CRUSHING/SCREENING PLANT",
      "CRANE SUSPENDED DRILL RIG",
      "CRAWLER TRACTOR",
      "CEMENT TREATED BASECOARSE PLANT",
      "CARGO TRUCK W/ CRANE (BOOM TRUCK)",
      "CARGO TRUCK WITH CRANE",
      "KNUCKLE TYPE",
      "DOLLY TRAILER",
      "DRILLING RIG",
      "DRILLING RIG FOR CORING MACHINE",
      "DUMP TRUCK",
      "DIRECTIONAL TRACK DRILL",
      "ELECTRIC  DRIVEN WELDING MACHINE",
      "ELECTRIC SCISSOR LIFT",
      "ENGINE DRIVEN WELDING MACHINE",
      "FORK LIFT",
      "FUEL TRUCK",
      "FUEL TANKER TRAILER",
      "GRAB HAMMER ATTACHMENT",
      "GROUTING MACHINE",
      "GENERATOR SET",
      "HIGH BED",
      "HYDRAULIC EXCAVATOR (MINI)",
      "HYDRAULIC EXCAVATOR",
      "HYDRAULIC EXCAVATOR (LONG ARM)",
      "HYDRAULIC EXCAVATOR WHEEL TYPE",
      "JUMBO DRILL",
      "LOW BED TRAILER",
      "SEMI FLAT BED TRAILER",
      "LOAD HAUL DUMPER",
      "LOW PROFILE TRUCK",
      "LUBE TRUCK",
      "MANWALK BEHIND",
      "MOTORCYCLE",
      "MECHANICAL DEWATERING PUMP",
      "MINI DUMPTRUCK",
      "MOTOR GRADER",
      "MANLIFT TRUCK",
      "CASING OSCILLATOR",
      "PILE HACKING MACHINE",
      "PIPE JACKING MACHINE",
      "PLATE ROLLING MACHINE",
      "ROBOTIC SHOTCRETE",
      "ROUGH TERRAIN CRANE",
      "SHOTCRETE MACHINE",
      "SKID LOADER",
      "SELF LOADER MIXER TRUCK",
      "SELF LOADING TRUCK",
      "SELF LOADING TRUCK W/ BOOM",
      "SUSPENDED MOTORIZED GONDOLA",
      "SERVICE VEHICLE",
      "TOWER LIGHT",
      "TRUCK MOUNTED CRANE",
      "TRANSIT MIXER",
      "TRUCK TRACTOR",
      "TOWER CRANE",
      "TIG WELDING MACHINE",
      "UTILITY VEHICLE",
      "VIBRO HAMMER ATTACHMENT",
      "VIBRO HAMMER POWER PACK",
      "VIBRATORY ROLLER",
      "VIBRO RIPPER ATTACHMENT",
      "VACUUM TRUCK",
      "WIRE FEEDER",
      "WHEEL LOADER",
      "WATER TRUCK",
      "WING VAN TRUCK",
    ];

    const equipmentCategoryList = [
      "AIR EQUIPMENT",
      "HAULING EQUIPMENT",
      "SPECIAL SUPPORT EQUIPMENT",
      "ASPHALTING EQUIPMENT",
      "HAULING EQUIPMENT",
      "EXCAVATING EQUIPMENT",
      "EXCAVATING EQUIPMENT",
      "FOUNDATION EQUIPMENT",
      "PLANTS",
      "FOUNDATION EQUIPMENT",
      "MISCELLANEOUS EQUIPMENT",
      "CONCRETING EQUIPMENT",
      "CONCRETING EQUIPMENT",
      "COMPACTION EQUIPMENT",
      "LIFTING EQUIPMENT",
      "PLANTS",
      "FOUNDATION EQUIPMENT",
      "EARTHMOVING EQUIPMENT",
      "PLANTS",
      "LIFTING EQUIPMENT",
      "LIFTING EQUIPMENT",
      "LIFTING EQUIPMENT",
      "HAULING EQUIPMENT",
      "FOUNDATION EQUIPMENT",
      "FOUNDATION EQUIPMENT",
      "HAULING EQUIPMENT",
      "DRILLING EQUIPMENT",
      "SHOP EQUIPMENT",
      "LIFTING EQUIPMENT",
      "SHOP EQUIPMENT",
      "LIFTING EQUIPMENT",
      "HAULING EQUIPMENT",
      "HAULING EQUIPMENT",
      "CRANE ATTACHMENT",
      "CONCRETING EQUIPMENT",
      "POWER GENERATING EQUIPMENT",
      "HAULING EQUIPMENT",
      "EXCAVATING EQUIPMENT",
      "EXCAVATING EQUIPMENT",
      "EXCAVATING EQUIPMENT",
      "EXCAVATING EQUIPMENT",
      "MINING EQUIPMENT",
      "HAULING EQUIPMENT",
      "HAULING EQUIPMENT",
      "MINING EQUIPMENT",
      "MINING EQUIPMENT",
      "HAULING EQUIPMENT",
      "COMPACTION EQUIPMENT",
      "SPECIAL SUPPORT EQUIPMENT",
      "PUMPING EQUIPMENT",
      "HAULING EQUIPMENT",
      "EARTHMOVING EQUIPMENT",
      "SUPPORTING EQUIPMENT",
      "FOUNDATION EQUIPMENT",
      "BREAKING EQUIPMENT",
      "TUNNELING EQUIPMENT",
      "SHOP EQUIPMENT",
      "CONCRETING EQUIPMENT",
      "LIFTING EQUIPMENT",
      "CONCRETING EQUIPMENT",
      "EARTHMOVING EQUIPMENT",
      "CONCRETING EQUIPMENT",
      "HAULING EQUIPMENT",
      "HAULING EQUIPMENT",
      "SUSPENDED PLATFORM EQUIPMENT",
      "SPECIAL SUPPORT EQUIPMENT",
      "MISCELLANEOUS EQUIPMENT",
      "LIFTING EQUIPMENT",
      "CONCRETING EQUIPMENT",
      "HAULING EQUIPMENT",
      "LIFTING EQUIPMENT",
      "SHOP EQUIPMENT",
      "HAULING EQUIPMENT",
      "FOUNDATION EQUIPMENT",
      "FOUNDATION EQUIPMENT",
      "COMPACTION EQUIPMENT",
      "EXCAVATING EQUIPMENT",
      "HAULING EQUIPMENT",
      "SHOP EQUIPMENT",
      "EARTHMOVING EQUIPMENT",
      "HAULING EQUIPMENT",
      "HAULING EQUIPMENT",
    ];

    const tempBrandList = [
      "AIRMAN",
      "ATLAS COPCO",
      "VOLVO",
      "CATERPILLAR",
      "MITSUBISHI",
      "KIA",
      "SUMITOMO",
      "OKADA",
      "EVERDIGM",
      "KOMATSU"
    ];

    const tempModelList = [
      "PDSG750S",
      "XAS97DD",
      "EP100",
      "BM A25C 6x6",
      "A25C",
      "HA60W",
      "ZJV94006FLLY",
      "TOP-190",
      "LWA 121 DB",
      "AKB V220"
    ];

    const componentCategoryList = [
      "ENGINE",
      "GUARD",
      "OPERATOR''S COMPARTMENT AND CONTROL SYSTEM",
      "MAIN/REVOLVING FRAME AND RELATED PARTS",
      "HYDRAULIC SYSTEM",
      "ELECTRICAL SYSTEM",
      "FUEL TANK AND RELATED PARTS",
      "COOLING SYSTEM",
      "ENGINE RELATED PARTS",
    ];

    const tempEquipmentPartName = [
      "ACCUMULATOR",
      "ADAPTER",
      "BAFFLE",
      "BALL",
      "BATTERY",
      "CAB",
      "CASE",
      "COLLAR",
      "CYLINDER KIT",
      "DAMPER",
      "DOOR",
      "DUCT",
      "EARTH STRIP",
      "ELBOW",
      "ELEMENT",
      "ENGINE",
      "FAN",
      "FILTER",
      "FLANGE",
      "FRAME",
      "FUSE",
      "GASSPRING",
      "GAUGE",
      "GEAR",
      "GLASS",
      "HYDRAULIC TANK",
      "ISOLATOR",
      "MANIFOLD",
      "NUT",
      "PANEL",
      "PLUG",
      "RADIO",
      "RAIL",
      "ROOF",
      "VALVE",
      "WIRE",
    ];

    const capacityUoMList = [
      "Kilogram",
      "Ton"
    ]

    const TEAM_ID = "a5a28977-6956-45c1-a624-b9e90911502e";

    // CATEGORY
    const category_input = categoryList.map((category) => `('${category}', '${TEAM_ID}')`).join(',');
    const categoryData = plv8.execute(`INSERT INTO equipment_category_table (equipment_category, equipment_category_team_id) VALUES ${category_input} RETURNING *`);

    // EQUIPMENT
    const equipment_input = equipmentNameList.map((equipmentName, index) => {
      const category = categoryData.find(value => value.equipment_category === `${equipmentCategoryList[index]}`);
      return `('${equipmentName}', '${category.equipment_category_id}', '${TEAM_ID}')`;
    }).join(',');
    const equipmentData = plv8.execute(`INSERT INTO equipment_table (equipment_name, equipment_equipment_category_id, equipment_team_id) VALUES ${equipment_input} RETURNING *`);
    const equipmentWithCategory = equipmentData.map(equipment => {
      return plv8.execute(`SELECT * FROM equipment_table INNER JOIN equipment_category_table ON equipment_equipment_category_id = equipment_category_id WHERE equipment_id = '${equipment.equipment_id}'`)[0];
    });

    // GENERAL NAME
    const general_name_input = tempEquipmentPartName.map((partName) => `('${partName}', '${TEAM_ID}')`).join(',');
    const generalNameData = plv8.execute(`INSERT INTO equipment_general_name_table (equipment_general_name, equipment_general_name_team_id) VALUES ${general_name_input} RETURNING *`);

    // BRAND
    const brand_input = tempBrandList.map((brand) => `('${brand}', '${TEAM_ID}')`).join(',');
    const brandData = plv8.execute(`INSERT INTO equipment_brand_table (equipment_brand, equipment_brand_team_id) VALUES ${brand_input} RETURNING *`);

    // MODEL
    const model_input = tempModelList.map((model) => `('${model}', '${TEAM_ID}')`).join(',');
    const modelData = plv8.execute(`INSERT INTO equipment_model_table (equipment_model, equipment_model_team_id) VALUES ${model_input} RETURNING *`);

    // Component Category
    const component_category_input = componentCategoryList.map((category) => `('${category}', '${TEAM_ID}')`).join(',');
    const componentCategoryData = plv8.execute(`INSERT INTO equipment_component_category_table (equipment_component_category, equipment_component_category_team_id) VALUES ${component_category_input} RETURNING *`);

    // Capacity UoM
    const capacity_uom_input = capacityUoMList.map((uom) => `('${uom}', '${TEAM_ID}')`).join(',');
    const capacityUoMData = plv8.execute(`INSERT INTO capacity_unit_of_measurement_table (capacity_unit_of_measurement, capacity_unit_of_measurement_team_id) VALUES ${capacity_uom_input} RETURNING *`);

    const getInitials = (str) => {
      const words = str.split(" ");
      const initials = words.map(word => word.charAt(0).toUpperCase());
      return initials.join("");
    }

    const generateRandomString = (length) => {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let result = '';
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
      }
      return result;
    }

    // EQUIPMENT DESCRIPTION
    const equipment_description_input = equipmentWithCategory.map((equipment, index) => {
      const propertyNumber = `${getInitials(equipment.equipment_category)}-${index+1}`
      const serialNumber = generateRandomString(10);
      const brandId = brandData[(Math.floor(Math.random() * brandData.length))].equipment_brand_id;
      const modelId = modelData[(Math.floor(Math.random() * modelData.length))].equipment_model_id;
      const equipmentId = equipment.equipment_id;

      return `('${propertyNumber}', '${serialNumber}', '${brandId}', '${modelId}', '${equipmentId}')`;
    }).join(',');
    const equipmentDescriptionData = plv8.execute(
      `INSERT INTO equipment_description_table 
      (
        equipment_description_property_number, 
        equipment_description_serial_number, 
        equipment_description_brand_id, 
        equipment_description_model_id, 
        equipment_description_equipment_id
      ) VALUES ${equipment_description_input} RETURNING *`
    );

    // EQUIPMENT PART UOM
    const equipmentUomData = plv8.execute(
      `
        INSERT INTO equipment_unit_of_measurement_table (equipment_unit_of_measurement, equipment_unit_of_measurement_team_id) VALUES
        ('Assembly', '${TEAM_ID}'),
        ('Piece', '${TEAM_ID}'),
        ('Set', '${TEAM_ID}')
        RETURNING *
      `
    ); 

    const generateRandomNumber = (length) => {
      const characters = "0123456789";
      let result = '';
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
      }
      return result;
    }

    // EQUIPMENT PART
    const equipment_part_input = Array.from({ length: 1000 }, (_, index) => {
      const partName = generalNameData[(Math.floor(Math.random() * generalNameData.length))].equipment_general_name_id;
      const num = generateRandomNumber(10);
      const partNumber = `${num.slice(0, 4)}-${num.slice(4, 8)}-${num.slice(8, 10)}`;
      const brandId = brandData[(Math.floor(Math.random() * brandData.length))].equipment_brand_id;
      const modelId = modelData[(Math.floor(Math.random() * modelData.length))].equipment_model_id;
      const uom = equipmentUomData[(Math.floor(Math.random() * equipmentUomData.length))].equipment_unit_of_measurement_id;
      const componentCategory = componentCategoryData[(Math.floor(Math.random() * componentCategoryData.length))].equipment_component_category_id;
      const equipmentId = equipmentData[(Math.floor(Math.random() * equipmentData.length))].equipment_id;

      return `('${partName}', '${partNumber}', '${brandId}', '${modelId}', '${uom}', '${componentCategory}', '${equipmentId}')`;
    });
    const equipmentPartData = plv8.execute(
      `INSERT INTO equipment_part_table 
      (
        equipment_part_general_name_id, 
        equipment_part_number, 
        equipment_part_brand_id, 
        equipment_part_model_id, 
        equipment_part_unit_of_measurement_id,
        equipment_part_component_category_id,
        equipment_part_equipment_id
      ) VALUES ${equipment_part_input} RETURNING *`
    );

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