import {
  RequestResponseTableInsert,
  RequestSignerTableInsert,
  RequestTableInsert,
} from "@/utils/types";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const Page = () => {
  const supabaseClient = createPagesBrowserClient();

  const [isLoading, setIsLoading] = useState(false);

  const positionOptions = [
    `"With Certificate and License"`,
    `"No Certificate and License"`,
    `"With Certificate but no License (STAFF)"`,
    `"With License but no Certificate (SKILLED)"`,
  ];
  const fileValue = `"https://www.rd.usda.gov/sites/default/files/pdf-sample_0.pdf"`;
  const sourceOptions = [
    `"Jobstreet"`,
    `"Indeed"`,
    `"LinkedIn"`,
    `"Facebook"`,
    `"Referral"`,
  ];
  const civilStatusOptions = [
    `"Single"`,
    `"Married"`,
    `"Widowed"`,
    `"Separated"`,
  ];
  const educationOptions = [
    `"High School"`,
    `"Vocational"`,
    `"Associate"`,
    `"Bachelor"`,
    `"Master"`,
    `"Doctorate"`,
  ];
  const employmentStatusOption = [`"Employed"`, `"Unemployed"`];
  const genderOption = [`"Male"`, `"Female"`];
  const statusOptions = [`PENDING`, `APPROVED`, `REJECTED`];
  const regionOptions = [`"Region I"`, `"Region II"`, `"Region III"`];
  const provinceOptions = [
    `"Metro Manila"`,
    `"Cebu"`,
    `"Davao"`,
    `"Baguio"`,
    `"Iloilo"`,
  ];
  const barangayOptions = [
    `"Barangay 1"`,
    `"Barangay 2"`,
    `"Barangay 3"`,
    `"Barangay 4"`,
    `"Barangay 5"`,
  ];
  const cityOptions = [
    `"Quezon City"`,
    `"Cebu City"`,
    `"Davao City"`,
    `"Baguio City"`,
    `"Iloilo City"`,
  ];
  const streetOptions = [
    `"Rizal Ave"`,
    `"Mabini St"`,
    `"Bonifacio St"`,
    `"Quezon Ave"`,
    `"P. Burgos St"`,
  ];
  const degreeOptions = [
    `"Bachelor of Arts (BA)"`,
    `"Bachelor of Science (BS)"`,
    `"Master of Arts (MA)"`,
    `"Master of Science (MS)"`,
    `"Doctor of Philosophy (PhD)"`,
    `"Associate Degree"`,
    `"Bachelor of Fine Arts (BFA)"`,
    `"Master of Business Administration (MBA)"`,
    `"Juris Doctor (JD)"`,
    `"Doctor of Medicine (MD)"`,
  ];

  const getRandomDate = (startDate: Date, endDate: Date) => {
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();

    const randomTimestamp =
      Math.random() * (endTimestamp - startTimestamp) + startTimestamp;

    return new Date(randomTimestamp);
  };

  const getRandomElement = (arr: string[]) => {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
  };

  const getRandomBoolean = () => {
    return Math.random() < 0.5;
  };

  const getRandomName = () => {
    const names = [
      "Alice",
      "Bob",
      "Charlie",
      "David",
      "Eve",
      "Frank",
      "Grace",
      "Heidi",
      "Ivan",
      "Judy",
    ];

    const randomIndex = Math.floor(Math.random() * names.length);
    return names[randomIndex];
  };

  const getRandomNumber = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const handleClick = async () => {
    try {
      setIsLoading(true);
      const { count, error } = await supabaseClient
        .schema("request_schema")
        .from("request_table")
        .select("*", { count: "exact", head: true })
        .eq("request_form_id", "151cc6d7-94d7-4c54-b5ae-44de9f59d170");
      if (error) throw error;

      const requestList: RequestTableInsert[] = [];
      const requestResponseList: RequestResponseTableInsert[] = [];
      const requestSignerList: RequestSignerTableInsert[] = [];
      for (let i = 0; i <= 1000; i++) {
        const requestId = uuidv4();
        const dateCreated = getRandomDate(new Date(2020, 0, 1), new Date());
        const status = getRandomElement(statusOptions);
        let dateUpdated: string | null = null;
        if (status !== "PENDING") {
          dateUpdated = getRandomDate(
            dateCreated,
            new Date()
          ).toLocaleDateString();
        }
        requestList.push({
          request_id: requestId,
          request_formsly_id_prefix: "AI",
          request_formsly_id_serial: `${(count ?? 0) + i + 1}`,
          request_date_created: dateCreated.toLocaleDateString(),
          request_status_date_updated: dateUpdated,
          request_status: status,
          request_form_id: "151cc6d7-94d7-4c54-b5ae-44de9f59d170",
        });
        requestSignerList.push({
          request_signer_request_id: requestId,
          request_signer_signer_id: "6bb9f492-581a-45ee-8653-1f045144e1de",
          request_signer_status: status,
          request_signer_status_date_updated: dateUpdated,
        });
        requestResponseList.push(
          {
            request_response_request_id: requestId,
            request_response_field_id: "0fd115df-c2fe-4375-b5cf-6f899b47ec56",
            request_response: getRandomElement(positionOptions),
          },
          ...(getRandomBoolean()
            ? [
                {
                  request_response_request_id: requestId,
                  request_response_field_id:
                    "60b588b2-3f1e-4e67-b9a6-c3fcb4c4bdc4",
                  request_response: fileValue,
                },
              ]
            : []),
          ...(getRandomBoolean()
            ? [
                {
                  request_response_request_id: requestId,
                  request_response_field_id:
                    "fb2314e5-6e02-4493-8af6-849a0c56521a",
                  request_response: fileValue,
                },
              ]
            : []),
          {
            request_response_request_id: requestId,
            request_response_field_id: "c6e15dd5-9548-4f43-8989-ee53842abde3",
            request_response: getRandomElement(sourceOptions),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "e48e7297-c250-4595-ba61-2945bf559a25",
            request_response: getRandomName(),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "7ebb72a0-9a97-4701-bf7c-5c45cd51fbce",
            request_response: getRandomName(),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "9322b870-a0a1-4788-93f0-2895be713f9c",
            request_response: getRandomName(),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "b684821b-9dec-4b2d-ad67-c46e58e1bb87",
            request_response: getRandomElement(genderOption),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "22229778-e532-4b39-b15d-ca9f80c397c0",
            request_response: `${getRandomNumber(1, 100)}`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "aaa09989-fe93-488d-b6e6-1891644c97ad",
            request_response: getRandomElement(civilStatusOptions),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "b2972102-99b0-4014-8560-caee2fdaf44e",
            request_response: `${getRandomNumber(9000000000, 9999999999)}`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "56438f2d-da70-4fa4-ade6-855f2f29823b",
            request_response: `${getRandomName()}@gmail.com`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "491806f6-970a-429b-ab83-0fdc5a23e916",
            request_response: getRandomElement(regionOptions),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "417938cc-16cf-4c1a-a99b-13451d0187e1",
            request_response: getRandomElement(provinceOptions),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "7a82f009-f97d-4343-a4fe-7354018b2fec",
            request_response: getRandomElement(cityOptions),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "ef0e847c-0932-4de9-bf5f-8ae30c4d18b5",
            request_response: getRandomElement(barangayOptions),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "47645789-5b6e-4f31-aed7-1f8a717428ab",
            request_response: getRandomElement(streetOptions),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "3fbdd3a9-ec45-46d8-bbb9-17148d0adef5",
            request_response: `${getRandomNumber(1000, 9999)}`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "ab7bf673-c22d-4290-b858-7cba2c4d2474",
            request_response: `${getRandomNumber(1000000000, 9999999999)}`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "781bd586-2a03-4284-9000-3d3eede91110",
            request_response: fileValue,
          },

          {
            request_response_request_id: requestId,
            request_response_field_id: "3cb0cf19-4fca-42d2-8267-6bf99750818b",
            request_response: `${getRandomNumber(1000000000, 9999999999)}`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "3b228009-09a9-425f-85f9-9dfb860a9f71",
            request_response: `${getRandomNumber(100000000000, 999999999999)}`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "3f483bf0-1117-434f-a737-6a3646726530",
            request_response: `${getRandomNumber(100000000, 999999999)}`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "b1b5edf3-be04-45cf-9fb7-d2d1a9ba57b0",
            request_response: getRandomElement(educationOptions),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "3a60d0e4-0485-4055-8a94-e51a9a4e0b72",
            request_response: getRandomElement(degreeOptions),
          },
          ...(getRandomBoolean()
            ? [
                {
                  request_response_request_id: requestId,
                  request_response_field_id:
                    "ca5d710e-29cd-4c33-9415-e70395d91fb3",
                  request_response: fileValue,
                },
              ]
            : []),
          {
            request_response_request_id: requestId,
            request_response_field_id: "c0dbf3f5-cbd4-4ab7-bd4d-1977dca2fcce",
            request_response: getRandomElement(degreeOptions),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "fd699cdb-0073-41d9-b81f-0178fad54746",
            request_response: JSON.stringify(
              getRandomDate(new Date("01-01-2000"), new Date())
            ),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "f264f914-dcb8-45d1-8f40-da44bab471cb",
            request_response: getRandomElement(employmentStatusOption),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "738ab073-d076-4087-b058-5951e89d03bf",
            request_response: `${getRandomBoolean()}`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "c72f8295-a8b1-478a-bb07-63ce6cb5641b",
            request_response: `${getRandomBoolean()}`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "1a901f84-4f55-47aa-bfa0-42f56d1eb6c5",
            request_response: `[${getRandomElement(regionOptions)}]`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "3e8ee62f-5483-462a-b91e-63ad04454215",
            request_response: JSON.stringify(
              getRandomDate(new Date(), new Date("12-12-2030"))
            ),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "f294ce1b-9d5d-4a6c-aea9-4c26e68165df",
            request_response: `${getRandomNumber(0, 50)}`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "bcfba5e2-b9cc-4c4b-a308-174993c4564d",
            request_response: `${getRandomNumber(15000, 100000)}`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "bf3088b9-2f12-4b79-89c0-1a64461fcbce",
            request_response: fileValue,
          }
        );
      }

      await supabaseClient
        .schema("request_schema")
        .from("request_table")
        .insert(requestList);
      await supabaseClient
        .schema("request_schema")
        .from("request_signer_table")
        .insert(requestSignerList);
      await supabaseClient
        .schema("request_schema")
        .from("request_response_table")
        .insert(requestResponseList);

      notifications.show({
        message: "Success.",
        color: "green",
      });
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <Button onClick={handleClick} loading={isLoading}>
        TEST
      </Button>
    </>
  );
};

export default Page;
