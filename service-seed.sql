DROP FUNCTION IF EXISTS service_seed;
CREATE FUNCTION service_seed()
RETURNS VOID AS $$
  plv8.subtransaction(function(){

    const serviceData = [
        {
            serviceName: "Earthworks",
            field: [
                {
                    scopeName: "Inclusion",
                    scopeType: "MULTISELECT",
                    isWithOther: false,
                    scopeChoices: [
                        "Package 1 - Supply of labor, materials, consumables, tools & equipment, supervision", 
                        "Package 2 - Rental of equipment including Operator & Fuel", 
                        "Package 3 - Rental of equipment only", 
                        "Package 4 - Supply of labor and services"
                    ]
                },
                {
                    scopeName: "Scope of Work",
                    scopeType: "DROPDOWN",
                    isWithOther: false,
                    scopeChoices: [
                        "Excavation", 
                        "Geotechnical Investigation", 
                        "Soil Poisoning", 
                        "Sodding", 
                        "Field Density Test", 
                        "Clearing and Grubbing"
                    ]
                }
            ]
        },
        {
            serviceName: "Civil",
            field: [
                {
                    scopeName: "Inclusion",
                    scopeType: "MULTISELECT",
                    isWithOther: false,
                    scopeChoices: [
                        "Package 1 - Supply of labor, materials, consumables, tools & equipment, supervision", 
                        "Package 2 - Supply of labor and consumable", 
                        "Package 3 - Supply of labor and services", 
                        "Package 4 - Testing & Commissioning"
                    ]
                },
                {
                    scopeName: "Scope of Work",
                    scopeType: "MULTISELECT",
                    isWithOther: false,
                    scopeChoices: [
                        "Rebar", 
                        "Formworks", 
                        "Concreting", 
                        "Concrete Piles", 
                        "Foundation Works", 
                        "Pile Driving", 
                        "Precast", 
                        "Pile Driving", 
                        "Precast", 
                        "Mold for Column"
                    ]
                }
            ]
        },
        {
            serviceName: "Structural",
            field: [
                {
                    scopeName: "Inclusion",
                    scopeType: "MULTISELECT",
                    isWithOther: false,
                    scopeChoices: [
                        "Package 1 - Fabrication, Delivery, & Installation", 
                        "Package 2 - Installation only", 
                        "Package 3 - Fabrication & Delivery only", 
                        "Package 4 - Testing & Commissioning"
                    ]
                },
                {
                    scopeName: "Scope of Work",
                    scopeType: "MULTISELECT",
                    isWithOther: true,
                    scopeChoices: [
                        "Rebar", 
                        "Formworks", 
                        "Concreting", 
                        "Concrete Piles", 
                        "Foundation Works", 
                        "Pile Driving", 
                        "Precast", 
                        "Pile Driving", 
                        "Precast", 
                        "Mold for Column"
                    ]
                }
            ]
        },
        {
            serviceName: "Architectural",
            field: [
                {
                    scopeName: "Inclusion",
                    scopeType: "MULTISELECT",
                    isWithOther: false,
                    scopeChoices: [
                        "Package 1 - Supply of labor, materials, consumables, tools & equipment, supervision", 
                        "Package 2 - Supply of labor and consumable", 
                        "Package 3 - Supply of labor and services", 
                        "Package 4 - Testing & Commissioning"
                    ]
                },
                {
                    scopeName: "Waterproofing",
                    scopeType: "MULTISELECT",
                    isWithOther: false,
                    scopeChoices: [
                        "Torch Membrane", 
                        "Capillary Membrane", 
                        "Polyurethane", 
                        "Cementitious Coating", 
                        "EPDM Rubber", 
                        "Thermoplastic", 
                        "Bituminous Membrane"
                    ]
                },
                {
                    scopeName: "Paints",
                    scopeType: "MULTISELECT",
                    isWithOther: false,
                    scopeChoices: [
                        "Painting", 
                    ]
                },
                {
                    scopeName: "Masonry",
                    scopeType: "MULTISELECT",
                    isWithOther: false,
                    scopeChoices: [
                        "CHB Laying", 
                        "AAC Block Installation", 
                        "Plastering", 
                        "Zoccalo", 
                        "Drywalls", 
                        "Concrete Topping"
                    ]
                },
                {
                    scopeName: "Ceiling",
                    scopeType: "MULTISELECT",
                    isWithOther: false,
                    scopeChoices: [
                        "Flat Ceiling", 
                        "Cove Ceiling", 
                        "Shadow-lined Ceiling", 
                        "High Ceiling"
                    ]
                },
                {
                    scopeName: "Doors",
                    scopeType: "MULTISELECT",
                    isWithOther: false,
                    scopeChoices: [
                        "Wooden", 
                        "Glass", 
                        "Aluminum", 
                        "Steel"
                    ]
                },
                {
                    scopeName: "Windows",
                    scopeType: "TEXT",
                    isWithOther: false,
                    scopeChoices: []
                },
                {
                    scopeName: "Finishing",
                    scopeType: "DROPDOWN",
                    isWithOther: false,
                    scopeChoices: [
                        "Partition"
                    ]
                },
                {
                    scopeName: "Facade",
                    scopeType: "TEXT",
                    isWithOther: false,
                    scopeChoices: []
                },
                {
                    scopeName: "Misc. Steel",
                    scopeType: "MULTISELECT",
                    isWithOther: false,
                    scopeChoices: [
                        "Railings",
                        "Grills"
                    ]
                },
                {
                    scopeName: "Roofing",
                    scopeType: "TEXT",
                    isWithOther: false,
                    scopeChoices: []
                },
            ]
        },
        {
            serviceName: "Mechanical",
            field: [
                {
                    scopeName: "Inclusion",
                    scopeType: "MULTISELECT",
                    isWithOther: true,
                    scopeChoices: [
                        "Supply", 
                        "Installation", 
                        "Materials & Delivery", 
                        "Fabrication", 
                        "Consumable", 
                        "Tools & Equipment", 
                        "Supervision", 
                        "Testing & Commissioning", 
                        "Cleaning"
                    ]
                },
                {
                    scopeName: "Scope of Work",
                    scopeType: "DROPDOWN",
                    isWithOther: true,
                    scopeChoices: [
                        "Penstock", 
                        "Surge Tank", 
                        "Generator", 
                        "Mechanical Ventilation & Air Conditioning (MVAC) System", 
                        "Air Conditioning Unit", 
                        "General Mechanical"
                    ]
                }
            ]
        },
        {
            serviceName: "Electrical",
            field: [
                {
                    scopeName: "Inclusion",
                    scopeType: "MULTISELECT",
                    isWithOther: true,
                    scopeChoices: [
                        "Supply", 
                        "Installation", 
                        "Materials & Delivery", 
                        "Fabrication", 
                        "Consumable", 
                        "Tools & Equipment", 
                        "Supervision", 
                        "Testing & Commissioning", 
                        "Erection"
                    ]
                },
                {
                    scopeName: "Scope of Work",
                    scopeType: "DROPDOWN",
                    isWithOther: true,
                    scopeChoices: [
                        "Transmission Line", 
                        "Telephone System", 
                        "Fire Alarm Detection System", 
                        "Gen. Electrical"
                    ]
                },
            ]
        },
        {
            serviceName: "Fire Protection",
            field: [
                {
                    scopeName: "Inclusion",
                    scopeType: "MULTISELECT",
                    isWithOther: true,
                    scopeChoices: [
                        "Supply", 
                        "Installation", 
                        "Materials & Delivery", 
                        "Fabrication", 
                        "Consumable", 
                        "Tools & Equipment", 
                        "Supervision", 
                        "Testing & Commissioning"
                    ]
                },
                {
                    scopeName: "Scope of Work",
                    scopeType: "DROPDOWN",
                    isWithOther: false,
                    scopeChoices: [
                        "Fire Protection System",
                    ]
                },
                {
                    scopeName: "Pump",
                    scopeType: "MULTISELECT",
                    isWithOther: true,
                    scopeChoices: [
                        "Fire Pump",
                        "Jockey Pump"
                    ]
                },
            ]
        },
        {
            serviceName: "Plumbing",
            field: [
                {
                    scopeName: "Inclusion",
                    scopeType: "MULTISELECT",
                    isWithOther: true,
                    scopeChoices: [
                        "Supply", 
                        "Installation", 
                        "Materials & Delivery", 
                        "Fabrication", 
                        "Consumable", 
                        "Tools & Equipment", 
                        "Supervision", 
                        "Testing & Commissioning"
                    ]
                },
                {
                    scopeName: "Scope of Work",
                    scopeType: "DROPDOWN",
                    isWithOther: true,
                    scopeChoices: [
                        "Gen. Plumbing & Sanitary", 
                    ]
                },
            ]
        },
        {
            serviceName: "Electro-Mechanical",
            field: [
                {
                    scopeName: "Inclusion",
                    scopeType: "MULTISELECT",
                    isWithOther: true,
                    scopeChoices: [
                        "Supply", 
                        "Installation", 
                        "Materials & Delivery", 
                        "Fabrication", 
                        "Consumable", 
                        "Tools & Equipment", 
                        "Supervision", 
                        "Testing & Commissioning"
                    ]
                },
                {
                    scopeName: "Scope of Work",
                    scopeType: "DROPDOWN",
                    isWithOther: true,
                    scopeChoices: [
                        "Electro-Mechanical System", 
                    ]
                },
            ]
        },
        {
            serviceName: "Infrastructure",
            field: [
                {
                    scopeName: "Inclusion",
                    scopeType: "MULTISELECT",
                    isWithOther: true,
                    scopeChoices: [
                        "Supply", 
                        "Installation", 
                        "Materials & Delivery", 
                        "Fabrication", 
                        "Consumable", 
                        "Tools & Equipment", 
                        "Supervision", 
                        "Testing & Commissioning", 
                        "Erection", 
                        "Drilling and Blasting"
                    ]
                },
                {
                    scopeName: "Bridges",
                    scopeType: "MULTISELECT",
                    isWithOther: false,
                    scopeChoices: [
                        "Beam Bridges", 
                        "Cable Bridges", 
                        "Arch Bridges", 
                        "Pipe Bridges"
                    ]
                },
                {
                    scopeName: "Roadways",
                    scopeType: "MULTISELECT",
                    isWithOther: false,
                    scopeChoices: [
                        "Lighting Post", 
                        "Steel Tower", 
                        "Access Road"
                    ]
                },
                {
                    scopeName: "Power and Energy",
                    scopeType: "MULTISELECT",
                    isWithOther: false,
                    scopeChoices: [
                        "Electric Power Plant", 
                        "Nuclear Power Plant", 
                        "Hydro-Electric Power Plant", 
                        "Wind Power Plant", 
                        "Solar Power Plant"
                    ]
                },
                {
                    scopeName: "Railways",
                    scopeType: "MULTISELECT",
                    isWithOther: false,
                    scopeChoices: [
                        "Railway lines", 
                        "Trains", 
                        "Tunnels"
                    ]
                },
                {
                    scopeName: "Water",
                    scopeType: "MULTISELECT",
                    isWithOther: false,
                    scopeChoices: [
                        "Dam", 
                        "Wells", 
                        "Main Water Line", 
                        "Pumping Station", 
                        "Treatment Plants", 
                        "Septic tanks", 
                        "Storm Water Drain"
                    ]
                },
                {
                    scopeName: "Riprap",
                    scopeType: "TEXT",
                    isWithOther: false,
                    scopeChoices: []
                },
                {
                    scopeName: "Slope Protection",
                    scopeType: "TEXT",
                    isWithOther: false,
                    scopeChoices: []
                },
                {
                    scopeName: "Tree Cutting",
                    scopeType: "TEXT",
                    isWithOther: false,
                    scopeChoices: []
                },
            ]
        },
    ]
    const TEAM_ID = "a5a28977-6956-45c1-a624-b9e90911502e";
    const SECTION_ID = "afd6fecd-e619-41ca-b9d2-cc1e96d4dce2";

    let serviceInput = [];
    let fieldInput = [];
    let serviceScopeInput = [];
    let serviceScopeChoiceInput = [];

    serviceData.forEach((service) => {
        const serviceId = plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4;

        serviceInput.push({
            service_id: serviceId,
            service_name: service.serviceName,
            service_team_id: TEAM_ID
        });

        service.field.forEach(field => {
            const serviceScopeId = plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4;
            const fieldId = plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4;

            fieldInput.push({
                field_id: fieldId,
                field_name: field.scopeName,
                field_type: field.scopeType,
                field_order: 8,
                field_section_id: SECTION_ID,
            })

            serviceScopeInput.push({
                service_scope_id: serviceScopeId,
                service_scope_name: field.scopeName,
                service_scope_type: field.scopeType,
                service_scope_is_with_other: field.isWithOther,
                service_scope_service_id: serviceId,
                service_scope_field_id: fieldId
            });

            if(field.scopeChoices.length !== 0){
                field.scopeChoices.forEach(choice => {
                    serviceScopeChoiceInput.push({
                        service_scope_choice_name: choice,
                        service_scope_choice_service_scope_id: serviceScopeId
                    })
                });
            }
        });
    });

    const service_input = serviceInput.map((service) => `('${service.service_id}', '${service.service_name}', '${service.service_team_id}')`).join(',');
    const field_input = fieldInput.map((field) => `('${field.field_id}', '${field.field_name}', '${field.field_type}', '${field.field_order}', '${field.field_section_id}')`).join(',');
    const service_scope_input = serviceScopeInput.map((serviceScope) => `('${serviceScope.service_scope_id}', '${serviceScope.service_scope_name}', '${serviceScope.service_scope_type}', '${serviceScope.service_scope_is_with_other}', '${serviceScope.service_scope_service_id}', '${serviceScope.service_scope_field_id}')`).join(',');
    const service_scope_choice_input = serviceScopeChoiceInput.map((choice) => `('${choice.service_scope_choice_name}', '${choice.service_scope_choice_service_scope_id}')`).join(',');

    plv8.execute(`INSERT INTO service_table (service_id, service_name, service_team_id) VALUES ${service_input}`);
    plv8.execute(`INSERT INTO field_table (field_id, field_name, field_type, field_order, field_section_id) VALUES ${field_input}`);
    plv8.execute(`INSERT INTO service_scope_table (service_scope_id, service_scope_name, service_scope_type, service_scope_is_with_other, service_scope_service_id, service_scope_field_id) VALUES ${service_scope_input}`);
    plv8.execute(`INSERT INTO service_scope_choice_table (service_scope_choice_name, service_scope_choice_service_scope_id) VALUES ${service_scope_choice_input}`);
  })
$$ LANGUAGE plv8;
SELECT service_seed();
DROP FUNCTION IF EXISTS service_seed;