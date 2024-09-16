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
            request_response_field_id: "d8490dac-21b2-4fec-9f49-09c24c4e1e66",
            request_response: getRandomElement(positionOptions),
          },
          ...(getRandomBoolean()
            ? [
                {
                  request_response_request_id: requestId,
                  request_response_field_id:
                    "b3ddc3c1-d93c-486d-9bdf-86a10d481df0",
                  request_response: fileValue,
                },
              ]
            : []),
          ...(getRandomBoolean()
            ? [
                {
                  request_response_request_id: requestId,
                  request_response_field_id:
                    "5a07dbc9-8a45-44da-8235-9d330957433d",
                  request_response: fileValue,
                },
              ]
            : []),
          {
            request_response_request_id: requestId,
            request_response_field_id: "f416b6c8-5374-4642-b608-f626269bde1b",
            request_response: getRandomElement(sourceOptions),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "7201c77e-b24a-4006-a4e5-8f38db887804",
            request_response: getRandomName(),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "859ac939-10c8-4094-aa7a-634f84b950b0",
            request_response: getRandomName(),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "0080798c-2359-4162-b8ae-441ac80512b6",
            request_response: getRandomName(),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "9f36b822-320a-4044-b292-ced5e2074949",
            request_response: getRandomElement(genderOption),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "222d4978-5216-4c81-a676-be9405a7323c",
            request_response: `${getRandomNumber(1, 100)}`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "2ba8f1e6-5ff9-4db8-b0c0-e9f6b62cc7a9",
            request_response: getRandomElement(civilStatusOptions),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "5b43279b-88d6-41ce-ac69-b396e5a7a48f",
            request_response: `${getRandomNumber(9000000000, 9999999999)}`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "ee6ec8af-0a9e-40a5-8353-7d851218fa87",
            request_response: `${getRandomName()}@gmail.com`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "1d6b36a6-b78f-4be7-a577-162664efb8c0",
            request_response: getRandomElement(regionOptions),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "a0b3e0cd-f2eb-45cb-87e1-a9ce59dff479",
            request_response: getRandomElement(provinceOptions),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "4902fd1f-5b23-42c0-88a4-e2b6425bc974",
            request_response: getRandomElement(cityOptions),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "f14eb00e-f927-4bf7-9e69-e7a4ff963f4a",
            request_response: getRandomElement(barangayOptions),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "a2987c8a-cf04-4c7a-99d1-47a1cfa82e2a",
            request_response: getRandomElement(streetOptions),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "27646e7b-882b-4117-90df-3a8d5dac8a78",
            request_response: `${getRandomNumber(1000, 9999)}`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "6d133972-e44a-4cca-a393-e779f7046112",
            request_response: `${getRandomNumber(1000000000, 9999999999)}`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "7294b176-76e9-4fbc-868d-61db1e7e1b6b",
            request_response: fileValue,
          },

          {
            request_response_request_id: requestId,
            request_response_field_id: "6a8d49ca-fb22-4ec5-a00c-986859d900ae",
            request_response: `${getRandomNumber(1000000000, 9999999999)}`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "0d7295a6-68c3-4646-99eb-421b44973d30",
            request_response: `${getRandomNumber(100000000000, 999999999999)}`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "d7db6653-2296-4515-b2b2-62ecba8e8999",
            request_response: `${getRandomNumber(100000000, 999999999)}`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "c8ff31cc-26c9-4544-8414-76741fe73b19",
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
                    "8ff6676c-5c82-4013-ab92-7c3df6b80d53",
                  request_response: fileValue,
                },
              ]
            : []),
          {
            request_response_request_id: requestId,
            request_response_field_id: "f6a645c6-d7b2-4a77-ae72-1d4e386ba9e1",
            request_response: getRandomElement(degreeOptions),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "9b63d408-c67b-419a-a8f2-7bf65d249ccf",
            request_response: JSON.stringify(
              getRandomDate(new Date("01-01-2000"), new Date())
            ),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "c3df937d-de59-413f-b6bb-22e5679fa4d1",
            request_response: getRandomElement(employmentStatusOption),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "57dc8bc7-3dff-437f-83de-67ea9052248a",
            request_response: `${getRandomBoolean()}`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "996ae92d-0155-4ad2-ada5-be129aef2d92",
            request_response: `${getRandomBoolean()}`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "aeb28a1f-8a5c-4e17-9ddd-a0377db12e97",
            request_response: `[${getRandomElement(regionOptions)}]`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "da35e324-185a-47c5-bf5b-bc0ebf318461",
            request_response: JSON.stringify(
              getRandomDate(new Date(), new Date("12-12-2030"))
            ),
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "0e1b4ee7-1eaa-4eb6-a142-d15c05d96fe0",
            request_response: `${getRandomNumber(0, 50)}`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "bd9af7fa-03c3-4fdc-a34f-99f46a666569",
            request_response: `${getRandomNumber(15000, 100000)}`,
          },
          {
            request_response_request_id: requestId,
            request_response_field_id: "f485ed1c-5c92-463e-b08c-79394935613a",
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
