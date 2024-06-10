import Meta from "@/components/Meta/Meta";
import { FETCH_OPTION_LIMIT } from "@/utils/constant";
import { Database } from "@/utils/database";
import { Button } from "@mantine/core";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

const data = [
  {
    propertyNumber: "AC-01 (NECO)",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "AC-26",
    acquisitionDate: 2002,
  },
  {
    propertyNumber: "AC-33",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "AC-35",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "AC-36",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "AC-39",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "AC-41",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "AC-42",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "AC-44",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "AC-45",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "AC-46",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "AC-47",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "AC-49",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "AC-52",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "AC-53",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "AC-54",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "AC-55",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "AC-56",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "AC-57",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "AC-58",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "AC-61",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "AC-62",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "AC-63",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "AC-64",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "AC-66",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "AC-67",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "AC-68",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "AC-69",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "AC-70",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "AC-71",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "AC-72",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "AC-73",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "AC-74",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "AC-75",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "AC-76",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "AC-77",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "AC-78",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "AC-79",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "AC-80",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "ADT-101",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "ADT-102",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "ADT-103",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "ADT-105",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "ADT-106",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "ADT-107",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "ADT-108",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "ADT-109",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "ADT-110",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "ADT-111",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "ADT-112",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "ADT-114",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "ADT-115",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "ADT-116",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "ADT-117",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "ADT-120",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "ADT-121",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "ADT-122",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "ADT-123",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "ADT-124",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "ADT-125",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "ADT-126",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "ADT-127",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "ADT-129",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "ADT-130",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "ADT-131",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "ADT-132",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "ADT-145",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "ADT-146",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "ADT-147",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "ADT-148",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "ADT-149",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "ADT-150",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "ADT-151",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "ADT-152",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "ADT-153",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "ADT-154",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "ADT-155",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "ADT-156",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "AMB-101",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "AMB-102",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "AMB-104",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "AMB-105",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "AMB-106",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "AMP-101",
    acquisitionDate: 2024,
  },
  {
    propertyNumber: "AU-101",
    acquisitionDate: 2024,
  },
  {
    propertyNumber: "AU-102",
    acquisitionDate: 2024,
  },
  {
    propertyNumber: "AP-01",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "AP-02",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "BCT-01",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-02",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-03",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "BKU-05",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-06",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "BKU-08",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-09",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-10",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-11",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-12",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "BKU-13",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "BKU-15",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "BKU-17",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "BKU-18",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "BKU-19",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "BKU-21",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "BKU-22",
    acquisitionDate: 2017,
  },
  {
    propertyNumber: "BKU-23",
    acquisitionDate: 2017,
  },
  {
    propertyNumber: "BKU-24",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-25",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-26",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-27",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-28",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-29",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-30",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-31",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-32",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-33",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-34",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-35",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-36",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-37",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-38",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-39",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-40",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-41",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-42",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-43",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-44",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-45",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-46",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BKU-47",
    acquisitionDate: 2001,
  },
  {
    propertyNumber: "BKU-48",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "BKU-49",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "BKU-50",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "BKU-51",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "BKU-52",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "BKU-53",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "BKU-54",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "BKU-55",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "BKU-56",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "BKU-57",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "BKU-58",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "BKU-60",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "BKU-61",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "BKU-62 (NECO)",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "BKU-63 (NECO)",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "BKU-64",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "BKU-65",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "BKU-66",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "BKU-67",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "BKU-68",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "BKU-69",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "BKU-70",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "BKU-71",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "BKU-72",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "BKU-73",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "BL-03",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BL-04",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "BL-05",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "BL-06",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "BLMG-101",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "BP-04",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BP-07",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BP-08",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "BP-09",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "BP-10",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "BP-11",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "BP-12",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "BP-13",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "BP-14",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "BP-15",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "BP-16",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "BP-17",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "BP-18",
    acquisitionDate: 2017,
  },
  {
    propertyNumber: "BP-19",
    acquisitionDate: 2018,
  },
  {
    propertyNumber: "BP-20",
    acquisitionDate: 2018,
  },
  {
    propertyNumber: "BP-21",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "BP-22",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "BP-23",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "BP-24",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "BP-25",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "BP-26",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "BP-27",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "BP-28",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "BP-29",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "BP-30",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "BP-31",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "CD-01",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CD-101",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "CHIL-101",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CHIL-102",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CHIL-103",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CHIL-104",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CP-05",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CP-07",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CP-08",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CP-10",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CP-11",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CP-12",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CP-13",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CP-14",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CP-15",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CP-16",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CP-17",
    acquisitionDate: 2017,
  },
  {
    propertyNumber: "CP-18",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "CP-19",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "CP-20",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "CP-21",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "CP-22",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "CP-23",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "CCP-101",
    acquisitionDate: 2024,
  },
  {
    propertyNumber: "CR-15",
    acquisitionDate: 2004,
  },
  {
    propertyNumber: "CR-17",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CR-18",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "CR-19",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "CR-20",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "CRC-101",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "CRC-102",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "CRC-104",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "CRC-105",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CRC-106",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CRC-107",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CRC-108",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CRC-109",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CRC-110",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CRC-111",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CRC-112",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CRC-113",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CRC-114",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CRC-115",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CRC-116",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CRC-117",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CRC-118",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CRC-119",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CRC-120",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "CRC-121",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "CRC-122",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "CRC-123",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "CRC-124",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "CRP-01",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CRP-02",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CRP-03",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "CSDR-101",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CSDR-102",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CT-52",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CT-60",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CT-61",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CT-63",
    acquisitionDate: 1996,
  },
  {
    propertyNumber: "CT-69",
    acquisitionDate: 1999,
  },
  {
    propertyNumber: "CT-72",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CT-73",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CT-74",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CT-76",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CT-82",
    acquisitionDate: 2017,
  },
  {
    propertyNumber: "CT-83",
    acquisitionDate: 2017,
  },
  {
    propertyNumber: "CT-84",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CT-85",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CT-86",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CT-87",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CT-88",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CT-90",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "CT-91",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "CT-92 (NECO)",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "CT-93 (NECO)",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "CT-94 (NECO)",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "CT-95 (NECO)",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "CT-96 (NECO)",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "CT-97",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "CT-98 (NECO)",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "CT-99 (NECO)",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "CT-100",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "CT-101",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "CT-102",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "CT-103",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "CT-104",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "CT-105",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "CT-106",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "CT-107 (NECO)",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "CTB-01",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CTB-02",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "CTC-10",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CTC-11",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CTC-12",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "CTC-13",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "CTC-14",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "CTC-15",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "CTC-16",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "CTC-17",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "CTC-18",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "CTC-19",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "CTC-20",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CTC-21",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CTC-22",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CTC-23",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CTC-24",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CTC-25",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "CTC-26",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "CTC-27",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "CTC-28",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "CTC-29 (NECO)",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "CTC-30",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "CTC-31",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "CTC-32",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "CTC-33",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "CTC-34",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "CTC-35",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "CTC-36",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "CTC-37",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "CTC-38",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "CTC-39",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "CTC-40",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "DLT-01",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "DLT-02",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "DR-101",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "DR-102",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "DR-103",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "DR-104",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "DR-105",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "DR-106",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "DR-107",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "DR-108MM",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "DR-109",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "DR-110",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "DR-111",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "DR-112",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "DRC-14",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "DRC-101",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "DRC-102",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "DRC-103",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "DT-02-(NECO)",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "DT-15-(NECO)",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "DT-17-(NECO)",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "DT-47",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "DT-50",
    acquisitionDate: 2006,
  },
  {
    propertyNumber: "DT-51",
    acquisitionDate: 2006,
  },
  {
    propertyNumber: "DT-53",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "DT-55",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "DT-56",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "DT-57",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "DT-59",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "DT-61",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "DT-62",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "DT-63",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "DT-64",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "DT-65",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "DT-66",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "DT-67",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "DT-68",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "DT-69",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "DT-70",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "DT-71",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "DT-72",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "DT-73",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "DT-74",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "DT-75",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "DT-76",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "DT-77",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "DT-78",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "DT-80",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "DT-81",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "DT-82",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "DT-83",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "DT-84",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "DT-85",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "DT-86",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "DT-87",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "DT-88",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "DT-89",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "DT-90",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "DT-91",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "DT-92",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "DT-93",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "DT-94",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "DT-95",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "DT-96",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "DT-97",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "DT-98",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "DT-99",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "DT-100",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "DT-101",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "DT-102",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "DT-103",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "DT-104",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "DT-105",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "DT-106",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "DT-107",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "DT-108",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "DT-109",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "DT-110",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "DT-111",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "DT-112",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "DT-113",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "DT-114",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "DTD-04",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "DTD-05",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "DTD-06",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "DTD-07",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "DTD-08",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "DTD-09",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "DTD-10",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "DTD-11",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "DTD-12",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "EDW-101",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EDW-102",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EDW-103",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EDW-104",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EDW-105",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EDW-106",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EDW-107",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EDW-108",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EDW-109",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EDW-110",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "ESL-101",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "ESL-102",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "ESL-103",
    acquisitionDate: 2024,
  },
  {
    propertyNumber: "ESL-104",
    acquisitionDate: 2024,
  },
  {
    propertyNumber: "ESL-105",
    acquisitionDate: 2024,
  },
  {
    propertyNumber: "ESL-106",
    acquisitionDate: 2024,
  },
  {
    propertyNumber: "EWM-22",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EWM-33",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "EWM-35",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EWM-37",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EWM-38",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EWM-39",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EWM-41",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EWM-42",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EWM-45",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EWM-46",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EWM-47",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EWM-48",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EWM-49",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EWM-50",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EWM-51",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EWM-52",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EWM-53",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EWM-54",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EWM-55",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EWM-56",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EWM-57",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EWM-58",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EWM-59",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "EWM-60",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "EWM-61",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "EWM-62",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "EWM-63",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "EWM-64",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "EWM-65",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "EWM-66",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "EWM-67",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "EWM-68",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "EWM-69",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "EWM-70",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "EWM-71",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "EWM-72",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "EWM-73",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "EWM-74",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "EWM-75",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "EWM-76",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "EWM-77",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "EWM-78",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "EWM-79",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "EWM-80",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "EWM-81",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "EWM-82",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "EWM-83",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "EWM-84",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "EWM-85",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "EWM-86",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "EWM-87",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "EWM-88",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "FL-03",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "FL-04",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "FL-05",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "FT-05",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "FT-06",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "FT-07",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "FT-08",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "FT-09",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "FT-10",
    acquisitionDate: 2002,
  },
  {
    propertyNumber: "FT-11",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "FT-12",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "FT-14",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "FT-15",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "FT-18",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "FT-19",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "FT-20",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "FT-21",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "FT-22",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "FT-23",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "FT-24",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "FT-25 (NECO)",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "FT-26 (NECO)",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "FT-27",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "FT-28",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "FT-29",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "FT-30",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "FT-31",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "FTT-101",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GHA-01",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "GM-03",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "GM-04",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "GM-06",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "GM-07",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "GM-08",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "GS-08",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "GS-17",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "GS-18",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "GS-22",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "GS-37",
    acquisitionDate: 2001,
  },
  {
    propertyNumber: "GS-55",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "GS-72",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "GS-75",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "GS-76",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "GS-79",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "GS-80",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "GS-81",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "GS-84",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "GS-85",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "GS-86",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "GS-87",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "GS-88",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "GS-90",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "GS-91",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "GS-92",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "GS-93",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "GS-94",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "GS-95",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "GS-96",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "GS-97",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "GS-98",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "GS-99",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "GS-100",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "GS-101",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "GS-102",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "GS-103",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "GS-104",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "GS-105",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "GS-106",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "GS-107",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "GS-110",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "GS-111",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "GS-112",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "GS-113",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "GS-114",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "GS-115",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "GS-116",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "GS-117",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "GS-118",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "GS-119",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "GS-120",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "GS-121",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "GS-122",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "GS-123",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "GS-124",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "GS-125",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "GS-126",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "GS-127",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "GS-128",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "GS-129",
    acquisitionDate: 2018,
  },
  {
    propertyNumber: "GS-130",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-131",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-132",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-133",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-134",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-135",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-136",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-137",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-138",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-139",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-140",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-141",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-142",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-143",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-144",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-146",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-147",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-148",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-149",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-150",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-151",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-152",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-153",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-154",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-155",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-156",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-157",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-158",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-159",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-160",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-161",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-162",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-163",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-164",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-165",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-166",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "GS-167",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "GS-168",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "GS-169",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "GS-170",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "GS-171",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "GS-172",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "GS-173",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "GS-174",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "GS-175",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "GS-176",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "GS-177",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "GS-178",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "GS-179",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "GS-180",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "GS-181",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "GS-182",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "GS-183",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "GS-184",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "GS-185",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "GS-186",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "GS-187",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "GS-188",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "GS-189",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "GS-190",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "GS-191",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "GS-192",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "GS-193",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "GS-194",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "GS-195",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "GS-196",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "GS-197",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "GS-198",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "GS-199",
    acquisitionDate: 2024,
  },
  {
    propertyNumber: "GS-200",
    acquisitionDate: 2024,
  },
  {
    propertyNumber: "GS-201",
    acquisitionDate: 2024,
  },
  {
    propertyNumber: "GS-202",
    acquisitionDate: 2024,
  },
  {
    propertyNumber: "GS-203",
    acquisitionDate: 2024,
  },
  {
    propertyNumber: "HB-01",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "HB-02",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "HB-03",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "HB-04",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "HB-05",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "HB-06",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HB-07",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HB-08",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HB-09",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-55",
    acquisitionDate: 1999,
  },
  {
    propertyNumber: "HE-76",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "HE-78",
    acquisitionDate: 2009,
  },
  {
    propertyNumber: "HE-109",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "HE-111",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "HE-116",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "HE-117",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "HE-118",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "HE-119",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "HE-120",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "HE-122",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "HE-123",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "HE-126",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "HE-127",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "HE-128",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "HE-129",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "HE-130",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "HE-131",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "HE-132",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "HE-133",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "HE-134",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "HE-135",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "HE-137",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "HE-138",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "HE-139",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "HE-140",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "HE-141",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "HE-142",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "HE-144",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "HE-145",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "HE-146",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "HE-147",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "HE-148",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "HE-151",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "HE-154",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "HE-157",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "HE-158",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "HE-159",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "HE-160",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "HE-161",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "HE-162",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "HE-163",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "HE-164",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "HE-167",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "HE-168",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "HE-174",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "HE-175",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "HE-176",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "HE-177",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "HE-178",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "HE-179",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "HE-180",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "HE-183",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "HE-184",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "HE-185",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "HE-186",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "HE-187",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "HE-188",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "HE-189",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "HE-190",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "HE-191",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "HE-194",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "HE-195",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "HE-196",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "HE-197",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "HE-198",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "HE-199NGH",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "HE-200NGH",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "HE-201NGH",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "HE-202NGH",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "HE-203",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "HE-204NGH",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "HE-205NGH",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "HE-206",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "HE-207",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "HE-208",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "HE-209",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "HE-210",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "HE-211",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "HE-212",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "HE-213",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "HE-214",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "HE-215",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "HE-216",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-217",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-218",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-219",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-220",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-221",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-222",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-223",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-224",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-225",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-226",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-227",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-228",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-229 (NECO)",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-230 (NECO)",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-231 (NECO)",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-232 (NECO)",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-233 (NECO)",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-234 (NECO)",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-235 (NECO)",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-236 (NECO)",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-237",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-238",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-239",
    acquisitionDate: 2018,
  },
  {
    propertyNumber: "HE-240",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-241",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-242",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-243",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-244",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-245",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-246 (NECO)",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-247 (NECO)",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "HE-248",
    acquisitionDate: 2018,
  },
  {
    propertyNumber: "HE-249",
    acquisitionDate: 2018,
  },
  {
    propertyNumber: "HE-250",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-251",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-252",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-253",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-254",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-255",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-256",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-257",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-258",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-259",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-260",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-261",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-262",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-263",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-264",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-265",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-266",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-267",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-268",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-269",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-270",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-271",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-272",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-273",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-274",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-275",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-276",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-277",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-278",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-279",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-280",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-281",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-282",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-283",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-284",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-285",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-286",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-287",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-288",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-289",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-293",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-294",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-295",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-296",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-297",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-298",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-299",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-300",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-301",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-302",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-303",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-304",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-305",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-307",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-308",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-309",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-310",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-311",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-312",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-313",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-314",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-315",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-316",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-317",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-318",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-319",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-320",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-321",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-324",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HE-325",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-326",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-327",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-328",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-329",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-330",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-331",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-332",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-333",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-334",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-335",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-336",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-337",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-338",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-339",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-340 (NECO)",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-341 (NECO)",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-342",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-343",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-344",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-345",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-346",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-347",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-348",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-349 (NECO)",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-350 (NECO)",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-351 (NECO)",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-352",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-353",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-354",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-355",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-356",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-357",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-358",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-359",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-360",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-361",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-362",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-363",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-364",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-365",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-366",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-367",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-368",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "HE-369",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "HE-370",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "HEWT-101",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "HEWT-102",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "HEWT-103",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "HEWT-104",
    acquisitionDate: 2017,
  },
  {
    propertyNumber: "HEWT-105",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "HEWT-106",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "HEWT-107",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "JD-104",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "JD-105",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "JD-106",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "JD-107",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "JD-108",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "JD-109",
    acquisitionDate: 2024,
  },
  {
    propertyNumber: "JD-110",
    acquisitionDate: 2024,
  },
  {
    propertyNumber: "LBT-01",
    acquisitionDate: 1993,
  },
  {
    propertyNumber: "LBT-04",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "LBT-05",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "LBT-06",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "LBT-07",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "LBT-08",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "LBT-09",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "LBT-10",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "LBT-11",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "LBT-12",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "LBT-13",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "LBT-14",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "LBT-15",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "LBT-16",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "LBT-18",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "LBT-19",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "LHD-101",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "LHD-102",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "LHD-103",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "LHD-104",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "LHD-105",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "LHD-106",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "LHD-107",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "LHD-108",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "LHD-109",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "LHD-110",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "LHD-111",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "LHD-112",
    acquisitionDate: 2024,
  },
  {
    propertyNumber: "LHD-113",
    acquisitionDate: 2024,
  },
  {
    propertyNumber: "LPT-101",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "LPT-102",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "LPT-103",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "LPT-104",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "LT-01 (NECO)",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "LT-02 (NECO)",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MB-17",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "MB-21",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "MB-25",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "MB-101",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "MB-102",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "MB-103",
    acquisitionDate: 2017,
  },
  {
    propertyNumber: "MB-104",
    acquisitionDate: 2017,
  },
  {
    propertyNumber: "MB-105",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MB-106",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MB-107",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MB-108",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MB-109",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MB-110",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MB-111",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MB-112",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MB-113",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MB-114",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MB-115",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MB-116",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MB-117",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MB-118",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MB-119",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MB-120",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MB-121",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MB-122",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MB-123",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MB-124",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "MB-125",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "MB-126",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "MB-127",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "MC-11",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "MC-16",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "MC-17",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "MC-18",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MC-19",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MC-20",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MC-21",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MC-22",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MC-23",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "MC-24",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "MC-25",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "MC-26",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "MDP-01",
    acquisitionDate: 20005,
  },
  {
    propertyNumber: "MDP-02",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "MDP-03",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "MDP-04",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "MDP-105",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MDP-106",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MDP-107",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MDP-108",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MDP-109",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MDP-110",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MDP-111",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MDP-112",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MDP-113",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MDP-114",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MDP-116",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MDP-117",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MDP-118",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MDP-119",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MDP-126",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MDP-127",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MDP-128",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MDP-129",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MDP-130",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MDP-131",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MDP-132",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MDP-133",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MDP-134",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MDP-135",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MDT-01",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "MDT-02",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "MDT-04",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "MDT-05",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "MDT-06",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "MDT-07",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "MDT-08",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "MDT-09",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "MDT-10",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "MDT-11",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "MDT-12",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "MDT-13",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "MDT-14",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "MDT-15",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "MDT-16",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "MDT-17",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "MDT-18",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "MDT-19",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "MDT-20",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "MDT-22",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "MDT-23",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "MDT-24",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "MDT-25",
    acquisitionDate: 2017,
  },
  {
    propertyNumber: "MDT-26",
    acquisitionDate: 2017,
  },
  {
    propertyNumber: "MDT-27",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "MDT-28",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MDT-29",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MDT-30",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MDT-31",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MDT-32",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MDT-33",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MDT-34",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MDT-35",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MDT-36",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MDT-37",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MDT-38",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MDT-39",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MDT-40",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MDT-41",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-42",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-43",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-44",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-45",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-46",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-47",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-48",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-49",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-50",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-51",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-52",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-53",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-54",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-55",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-56",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-57",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-58",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-59",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-60",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-61",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-62",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-63",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-64",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-65",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-66",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-67",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-68",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MDT-69",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MG-23",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "MG-25",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "MG-26",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "MG-27",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "MG-29",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "MG-30",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "MG-31",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "MG-32",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "MG-33",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "MG-34",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "MG-35",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MG-36",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MG-37",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MG-38",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MG-39",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MG-40",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MG-41",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "MG-42",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "MG-43",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "MG-44",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "MG-45 (NECO)",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "MLT-01",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "MLT-02",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "MLT-03",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "MLT-05",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "MLT-06",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "MLT-07",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "OSC-01",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "OSC-02",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "OSC-03",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "OSC-04",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "OSC-05",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "OSC-06",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "PHM-01",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "PHM-02",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "PJM-101",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "PRM-01",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "PTR-101",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "RSC-101",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "RSC-102",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "RSC-103",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "RTC-01",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "RTC-03",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "RTC-04",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "RTC-07",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "RTC-08",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "RTC-09",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "RTC-10",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "RTC-11",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "RTC-14",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "RTC-15",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "RTC-17",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "RTC-18",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "RTC-19",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "RTC-20",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "RTC-21",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "RTC-22",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "RTC-23",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "RTC-24",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "RTC-25",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "RTC-26",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "RTC-27",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "RTC-28",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "RTC-30",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "RTC-31",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "RTC-33",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "RTC-34",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "RTC-35",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "RTC-36",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "RTC-37",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "RTC-38",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "RTC-39",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SB-01",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "SB-02",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "SCM-05",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "SCM-06",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "SCM-07",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "SCM-08",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "SCM-09",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "SCM-10",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "SCM-11",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "SCM-12",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "SCM-13",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "SCM-14",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "SCM-15",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SCM-16",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SL-04",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "SL-05",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "SL-06",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "SL-07",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "SL-08",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "SL-09",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "SL-10",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "SL-11",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "SL-12",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "SL-13",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "SL-14",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "SL-15",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "SLMT-01",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SLT-01",
    acquisitionDate: 1997,
  },
  {
    propertyNumber: "SLT-04",
    acquisitionDate: 2004,
  },
  {
    propertyNumber: "SLT-06",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "SLT-07",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "SLT-08",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "SLT-09",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SLT-10",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SMG-101",
    acquisitionDate: 2018,
  },
  {
    propertyNumber: "SV-24",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "SV-87",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "SV-101",
    acquisitionDate: 2001,
  },
  {
    propertyNumber: "SV-109",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "SV-126",
    acquisitionDate: 2007,
  },
  {
    propertyNumber: "SV-127",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "SV-129",
    acquisitionDate: 2007,
  },
  {
    propertyNumber: "SV-130",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "SV-132",
    acquisitionDate: 2007,
  },
  {
    propertyNumber: "SV-139",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "SV-140",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "SV-143",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "SV-144",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "SV-145",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "SV-146",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "SV-147",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "SV-149",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "SV-151",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "SV-152",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "SV-153",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "SV-154",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "SV-155",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "SV-156",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "SV-158",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "SV-160",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "SV-161",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "SV-163",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "SV-164",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "SV-165",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "SV-167",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "SV-168",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "SV-169",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "SV-174",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "SV-175",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "SV-176",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "SV-177",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "SV-178",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "SV-179",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "SV-180",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "SV-181",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "SV-182",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "SV-183",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "SV-184",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "SV-186",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "SV-187",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "SV-188",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "SV-191",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "SV-192",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "SV-193",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "SV-194",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "SV-195",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "SV-196",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "SV-197",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "SV-198",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "SV-200",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "SV-201",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "SV-202",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "SV-204",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "SV-205",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "SV-206",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "SV-208",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "SV-209",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "SV-210",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "SV-212",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "SV-214",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "SV-218",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "SV-219",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "SV-220",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "SV-222",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "SV-223",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "SV-224",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "SV-225",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "SV-226",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "SV-227",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "SV-228",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "SV-229",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "SV-230",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "SV-231",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "SV-233",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "SV-235",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "SV-236",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "SV-237",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "SV-238",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "SV-239",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "SV-240",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "SV-241",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "SV-242",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "SV-243",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "SV-244",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "SV-245",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "SV-246",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "SV-247",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "SV-248",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "SV-249",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "SV-250",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "SV-251",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "SV-252",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "SV-254",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "SV-255",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "SV-256",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "SV-257",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "SV-258",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "SV-259",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "SV-260",
    acquisitionDate: 2017,
  },
  {
    propertyNumber: "SV-261",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "SV-262",
    acquisitionDate: 2017,
  },
  {
    propertyNumber: "SV-263",
    acquisitionDate: 2017,
  },
  {
    propertyNumber: "SV-264",
    acquisitionDate: 2017,
  },
  {
    propertyNumber: "SV-265",
    acquisitionDate: 2017,
  },
  {
    propertyNumber: "SV-266",
    acquisitionDate: 2018,
  },
  {
    propertyNumber: "SV-267",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-268 (NECO)",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-270",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-271",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-272 (NECO)",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-273 (NECO)",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-274 (NECO)",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-275",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-276 (NECO)",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-277 (NECO)",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-278",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-279",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-280",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-281",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-282",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-283 (X'WELL)",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-284",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-285",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-286",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-287",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-288",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-289",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-290",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-291 (NECO)",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-292",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-293",
    acquisitionDate: 2017,
  },
  {
    propertyNumber: "SV-294",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-295 (NECO)",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-296",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-297",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-298",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-299 (X'WELL)",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "SV-300",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "SV-301",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "SV-302",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "SV-303",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-304",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-305",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-306",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-307",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-308",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-309",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-310",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-311",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-312",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-313",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-314",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-315",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-316",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-317",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-318",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-319",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-320",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-321",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-322",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-323",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-324",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-325",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-326",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-327",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-328",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-330",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "SV-331",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-332",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-333",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-334",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-335",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-336",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-337",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-338",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-339",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-340",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-341",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-342",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-343",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-344",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-345",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-346",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-347",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-348",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-349",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-350",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-351",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-352",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-353",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-354",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-355",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-356",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-357",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-358",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-359",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-360",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-361",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-362",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-363",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-364",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-365",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-366",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-367",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-368",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-369",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-370",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-371",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-372",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-373",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-374",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-375",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-376",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-377",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-378",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-379",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-380",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-381",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-382",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-383",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-384",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "SV-385",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SV-386",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SV-387",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SV-388",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SV-389",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SV-390",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SV-391",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SV-392",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SV-393",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SV-394",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SV-395",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SV-396",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SV-397",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SV-398",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SV-399",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SV-400",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SV-401",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SV-402",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SV-403",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SV-404",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SV-405",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SV-406",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SV-407",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "SV-408",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "SV-409",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SV-410",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "SV-411",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "SV-412",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SV-413",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "SV-414",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "SV-415",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "SV-416",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "SV-417",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "SV-418",
    acquisitionDate: 2024,
  },
  {
    propertyNumber: "SV-419",
    acquisitionDate: 2024,
  },
  {
    propertyNumber: "SV-420",
    acquisitionDate: 2024,
  },
  {
    propertyNumber: "SV-421",
    acquisitionDate: 2024,
  },
  {
    propertyNumber: "SV-422",
    acquisitionDate: 2024,
  },
  {
    propertyNumber: "TL-02",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "TL-13",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "TL-14",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "TL-15",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "TL-25",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "TL-26",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "TL-27",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "TL-28",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "TL-29",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "TL-30",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "TL-31",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "TL-32",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "TL-35",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "TL-36",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "TL-37",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "TL-38",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "TL-39",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "TL-40",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "TL-41",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "TL-42",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "TL-43",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "TL-44",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "TL-45",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "TL-46",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "TL-47",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "TL-48",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "TL-49",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "TL-50",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "TL-51",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "TL-52",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "TL-53",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "TL-54",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "TL-55",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "TL-56",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "TL-58",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TL-59",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TL-60",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TL-61",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TL-62",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TL-63",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TL-65",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TL-66",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TL-67",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TL-68",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TL-69",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "TL-70",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "TL-71",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "TL-72",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TL-73",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TL-74",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TL-75",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TL-76",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TL-77",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TL-78",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TL-79",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TL-80",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TL-81",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TL-82",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TL-83",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TL-84",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "TL-85",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "TL-86",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "TL-87",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "TL-88",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "TL-89",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "TL-90",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "TL-91",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "TL-92",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "TL-93",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "TL-94",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "TL-95",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "TL-96",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "TL-97",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "TMC-101",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TMX-18",
    acquisitionDate: 1998,
  },
  {
    propertyNumber: "TMX-19",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "TMX-30",
    acquisitionDate: 2006,
  },
  {
    propertyNumber: "TMX-33",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "TMX-36",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "TMX-37",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "TMX-38",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "TMX-39",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "TMX-40",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "TMX-41",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "TMX-42",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "TMX-43",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "TMX-45",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "TMX-46",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "TMX-47",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "TMX-48",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "TMX-49",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "TMX-50",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "TMX-53",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "TMX-54",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "TMX-55",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "TMX-56",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "TMX-57",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "TMX-58",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "TMX-59",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "TMX-60",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "TMX-61",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "TMX-62",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "TMX-63",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "TMX-64",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "TMX-65",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "TMX-66",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "TMX-69",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "TMX-70",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TMX-71",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TMX-72",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TMX-73",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TMX-74",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TMX-75",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TMX-76",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TMX-77",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TMX-78",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TMX-79",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TMX-80",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TMX-81",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TMX-82",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TMX-83",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TMX-84",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TMX-85",
    acquisitionDate: 2017,
  },
  {
    propertyNumber: "TMX-86",
    acquisitionDate: 2017,
  },
  {
    propertyNumber: "TMX-87",
    acquisitionDate: 2017,
  },
  {
    propertyNumber: "TMX-88",
    acquisitionDate: 2017,
  },
  {
    propertyNumber: "TMX-89",
    acquisitionDate: 2017,
  },
  {
    propertyNumber: "TMX-90",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "TMX-91",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "TMX-92",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "TMX-93",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "TMX-94",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-95",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-96",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-97",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-98",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-99",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-100",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-101",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-102",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-103",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-104",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-105",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-106",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-107",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-108",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-109",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-110",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-111",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-112",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-113",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-114",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-115",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-116",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-117",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-118",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-119",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-120",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-121",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-122",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TMX-123",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "TMX-124",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "TMX-125",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "TMX-126",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "TMX-127",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "TMX-128",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "TMX-129",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "TMX-130",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "TMX-131",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "TMX-132",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "TMX-133",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "TMX-134",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "TT-06",
    acquisitionDate: 1999,
  },
  {
    propertyNumber: "TT-07",
    acquisitionDate: 2003,
  },
  {
    propertyNumber: "TT-08",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "TT-09",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "TT-10",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TT-11",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "TT-12",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "TT-13",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "TT-14",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "TT-15",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "TT-16",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "TT-17",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "TT-18",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "TT-19",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "TT-20",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "TT-21",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TT-22",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TT-23",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TT-24",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TT-25",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "TT-26",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "TWC-01",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "TWC-02",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "TWC-03",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "TWC-04",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "TWC-05",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "TWM-01",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "TWM-02",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "TWM-03",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "TWM-04",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "TWM-05",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "TWM-06",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "TWM-07",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "TWM-08",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "TWM-09",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "TWM-10",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "TWM-11",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "TWM-12",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TWM-13",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TWM-14",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TWM-15",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "TWM-16",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "UV-17",
    acquisitionDate: 1995,
  },
  {
    propertyNumber: "UV-24",
    acquisitionDate: 1998,
  },
  {
    propertyNumber: "UV-27",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "UV-36",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "UV-37",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "UV-38",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "UV-39",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "UV-40",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "UV-41",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "UV-43",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "UV-44",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "UV-45",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "UV-46",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "UV-47",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "UV-48",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "UV-56",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "UV-57",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "UV-58",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "UV-59",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "UV-60",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "UV-61",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "UV-62",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "UV-64",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "UV-65",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "UV-66",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "UV-68",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "UV-69",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "UV-70",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "UV-72",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "UV-73",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "UV-74",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "UV-75",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "UV-76",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "UV-77",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "UV-78",
    acquisitionDate: 2018,
  },
  {
    propertyNumber: "UV-79",
    acquisitionDate: 2018,
  },
  {
    propertyNumber: "UV-80",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "UV-81",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "UV-82",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "UV-83",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "UV-84",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "UV-85",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "UV-86",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "UV-87",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "UV-88",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "UV-89",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "UV-90",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "UV-91",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "UV-92",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "UV-93",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "UV-94",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "UV-95",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "UV-96",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "UV-97",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "UV-98",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "UV-99",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "UV-100",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "UV-101",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "UV-102",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "UV-103",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "UV-104",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "UV-105",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "UV-106",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "UV-107",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "UV-108",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "UV-109",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "UV-110",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "UV-111",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "UV-112",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "VHA-01",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "VHA-02",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "VHA-03",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "VHA-04",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "VHA-05",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "VHA-06",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "VHA-07",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "VHA-08",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "VHA-09",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "VHPP-104",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "VHPP-105",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "VHPP-106",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "VR-104",
    acquisitionDate: 2001,
  },
  {
    propertyNumber: "VR-106",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "VR-110",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "VR-111",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "VR-112",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "VR-113",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "VR-115",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "VR-117",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "VR-118",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "VR-119",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "VR-120",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "VR-125",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "VR-126",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "VR-127",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "VR-128",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "VR-129",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "VR-130",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "VR-131",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "VR-132",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "VR-133",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "VR-134",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "VR-135",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "VR-136",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "VR-137",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "VR-138",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "VR-139",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "VR-140",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "VR-141",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "VR-142",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "VR-143",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "VR-144",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "VR-145",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "VR-146",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "VR-147 (NECO)",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "VR-148",
    acquisitionDate: 2023,
  },
  {
    propertyNumber: "VRA-01",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "VRA-02",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "VRA-03",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "VRA-04",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "VRA-05",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "VRA-06",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "VRA-07",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "VT-02",
    acquisitionDate: 2001,
  },
  {
    propertyNumber: "VT-04",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "VT-05",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "VT-06",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "VT-07",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "VT-08",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "VT-09",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "VT-10",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "WF-101",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "WF-102",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "WF-103",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "WF-104",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "WF-105",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "WF-106",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "WL-13",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "WL-52",
    acquisitionDate: 2003,
  },
  {
    propertyNumber: "WL-53",
    acquisitionDate: 2010,
  },
  {
    propertyNumber: "WL-54",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "WL-56",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "WL-58",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "WL-59",
    acquisitionDate: 2013,
  },
  {
    propertyNumber: "WL-60",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "WL-61",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "WL-62",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "WL-63",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "WL-64",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "WL-65",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "WL-66",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "WL-67",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "WL-68",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "WL-69",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "WL-70",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "WL-71",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "WL-72",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "WL-73",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "WL-74",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "WL-75",
    acquisitionDate: 2018,
  },
  {
    propertyNumber: "WL-76",
    acquisitionDate: 2018,
  },
  {
    propertyNumber: "WL-77",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "WL-78",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "WL-79",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "WL-80",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "WL-81",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "WL-82",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "WL-83",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "WL-84",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "WL-85",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "WL-86",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "WL-87",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "WL-88 (NECO)",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "WT-03",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "WT-04",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "WT-05",
    acquisitionDate: 2005,
  },
  {
    propertyNumber: "WT-08",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "WT-09",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "WT-10",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "WT-11",
    acquisitionDate: 2014,
  },
  {
    propertyNumber: "WT-12",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "WT-13",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "WT-14",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "WT-15",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "WT-16",
    acquisitionDate: 2016,
  },
  {
    propertyNumber: "WT-17",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "WT-18",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "WT-19",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "WT-20",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "WT-21",
    acquisitionDate: 2019,
  },
  {
    propertyNumber: "WT-22",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "WT-23",
    acquisitionDate: 2020,
  },
  {
    propertyNumber: "WT-24",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "WT-25",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "WT-26",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "WT-27",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "WT-28",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "WT-29",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "WT-30",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "WT-31",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "WT-32",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "WT-33",
    acquisitionDate: 2021,
  },
  {
    propertyNumber: "WT-34",
    acquisitionDate: 2022,
  },
  {
    propertyNumber: "WVT-01",
    acquisitionDate: 2011,
  },
  {
    propertyNumber: "WVT-02",
    acquisitionDate: 2012,
  },
  {
    propertyNumber: "WVT-03",
    acquisitionDate: 2015,
  },
  {
    propertyNumber: "",
    acquisitionDate: "",
  },
  {
    propertyNumber: "",
    acquisitionDate: "",
  },
  {
    propertyNumber: "2-Mar-12",
    acquisitionDate: "",
  },
];

const Page = () => {
  const supabaseClient = createPagesBrowserClient<Database>();

  const handleTest = async () => {
    try {
      let index = 0;
      const equipmentList = [];
      while (1) {
        const { data: equipmentData, error } = await supabaseClient
          .from("equipment_description_view")
          .select(
            `
              equipment_description_property_number_with_prefix, 
              equipment_description_id,
              equipment_description_date_created,
              equipment_description_property_number,
              equipment_description_serial_number,
              equipment_description_is_disabled,
              equipment_description_is_available,
              equipment_description_brand_id,
              equipment_description_model_id,
              equipment_description_equipment_id,
              equipment_description_encoder_team_member_id
            `
          )
          .limit(FETCH_OPTION_LIMIT)
          .range(index, index + FETCH_OPTION_LIMIT - 1);
        if (error) throw error;
        if (!equipmentData.length) break;
        equipmentList.push(...equipmentData);
        if (equipmentData.length < FETCH_OPTION_LIMIT) break;
        index += FETCH_OPTION_LIMIT;
      }

      const newData = equipmentList
        .map((equipment) => {
          const matchedPropertyNumber = data.find(
            (thisEquipment) =>
              thisEquipment.propertyNumber ===
              equipment.equipment_description_property_number_with_prefix
          );

          const {
            equipment_description_property_number_with_prefix,
            ...withoutViewColumn
          } = equipment;

          return {
            ...withoutViewColumn,
            equipment_description_acquisition_date:
              matchedPropertyNumber?.acquisitionDate,
          };
        })
        .filter((data) => data.equipment_description_acquisition_date);

      const firstHalf = newData.slice(0, 800);
      const secondHalf = newData.slice(800);

      const { error: firstError } = await supabaseClient
        .from("equipment_description_table")
        .upsert(firstHalf);
      if (firstError) throw firstError;

      const { error: secondError } = await supabaseClient
        .from("equipment_description_table")
        .upsert(secondHalf);
      if (secondError) throw secondError;

      console.log("DONE");
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <>
      <Meta description="Home Page" url="/" />
      <Button onClick={handleTest}>TEST</Button>
    </>
  );
};

export default Page;
Page.Layout = "APP";
