CREATE OR REPLACE FUNCTION seed_uom()
RETURNS JSON AS $$
  plv8.subtransaction(function(){
    
    const ITEM_UNIT_CHOICES = [
      "Meter",
      "Inch",
      "Second",
      "Kilogram",
      "Ampere",
      "Kelvin",
      "Mole",
      "Candela",
      "Foot/Feet",
      "Kilometer",
      "Centimeter",
      "Millimetre",
      "Micrometer",
      "Nanometer",
      "Bank Cubic Meter",
      "Square Foot/Feet",
      "Square Kilometer",
      "Square Meter",
      "Square Centimeter",
      "Hectare",
      "Are",
      "Cubic Centimeter",
      "Cubic Meter",
      "Cubic Foot/feet",
      "Board Foot/Feet",
      "Gallon",
      "Quart",
      "Teraliter",
      "Kiloliter",
      "Liter",
      "Centiliter",
      "Milliliter",
      "Microliter",
      "Milliampere hours",
      "Ton",
      "Gram",
      "Centigram",
      "Milligram",
      "Microgram",
      "Pounds",
      "Ounce",
      "Hertz",
      "Kilo Hertz",
      "Mega Hertz",
      "Newton",
      "Joule",
      "MegaPascal",
      "Pascal",
      "Watt",
      "Coulomb",
      "Volt",
      "Farad",
      "Ohm",
      "Siemens",
      "Weber",
      "Tesla",
      "Henry",
      "Lumen",
      "Lux",
      "Horsepower",
      "kiloNewton",
      "Bit",
      "Byte",
      "Kilobyte",
      "Megabyte",
      "Gigabyte",
      "Terabyte",
      "Petabyte",
      "Exabyte",
      "Zettabyte",
      "Yottabyte",
      "Rotation Per Minute",
      "Mega Pixel",
      "Assembly",
      "Bag",
      "Batch",
      "Box",
      "Bottle",
      "Bucket",
      "Bundle",
      "Can",
      "Cart",
      "Carton",
      "Cartridge",
      "Case",
      "Cycle",
      "Hour",
      "Day",
      "Dozen",
      "Drum",
      "Each",
      "Elf",
      "Kit",
      "Linear Foot/feet",
      "LM/S",
      "Month",
      "Week",
      "Year",
      "Pack",
      "Pad",
      "Pail",
      "Pair",
      "Panel",
      "Piece",
      "Pint",
      "Ream",
      "Roll",
      "Sack",
      "Set",
      "Sheet",
      "Trip",
      "Tube",
      "Unipack",
      "Unit",
      "Yard",
      "Diameter Nominal",
      "Mega Bit Per Second",
      "Pound Per Square Inch",
      "Square Millimeter",
      "Cylinder",
      "Mil/Thou",
      "Pixel",
      "Kilovolt",
      "Degree",
      "Centipoise",
      "Kilovolt Ampere",
      "Kilowatt",
      "Decibel",
      "Cubic Feet Per Minute",
      "Blows Per Minute",
      "Gram Per Hour",
      "Kilocalorie",
      "British Thermal Unit",
      "Celsius",
      "Percent",
      "Parts Per Million",
      "Meter Per Second",
      "Cubic Meter Per Second",
      "Microfarad",
      "Nanofarad",
      "Picofarad",
      "Frames Per Second",
      "Millimeter Of Mercury",
      "Grams Per Square Meter",
      "Cubic Meter Per Hour",
      "Kiloampere",
      "Beats Per Minute",
      "Micron",
      "Millimetre Per Minute",
    ];

    ITEM_UNIT_CHOICES.forEach(uom => {
      plv8.execute(`INSERT INTO general_unit_of_measurement_table (general_unit_of_measurement, general_unit_of_measurement_team_id) VALUES ('${uom}', 'a5a28977-6956-45c1-a624-b9e90911502e')`);
    });
    
 });
$$ LANGUAGE plv8;
SELECT seed_uom();
DROP FUNCTION IF EXISTS seed_uom;

CREATE OR REPLACE FUNCTION seed_service_category()
RETURNS JSON AS $$
  plv8.subtransaction(function(){
    
    const CATEGORY_LIST = [
      "HAULING WORKS", 
      "SURVEY WORKS", 
      "CALIBRATION SERVICES", 
      "TESTING SERVICES", 
      "DESIGN FEE", 
      "REPAIR SERVICES FOR EQUIPMENT", 
      "REPAIR SERVICES FOR IT EQUIPMENT",
    ]

    CATEGORY_LIST.forEach(category => {
      plv8.execute(`INSERT INTO service_category_table (service_category, service_category_team_id) VALUES ('${category}', 'a5a28977-6956-45c1-a624-b9e90911502e')`);
    });
    
 });
$$ LANGUAGE plv8;
SELECT seed_service_category();
DROP FUNCTION IF EXISTS seed_service_category;