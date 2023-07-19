import { getForm, getFormList } from "@/backend/api/get";
import { createFormslyPremadeForms } from "@/backend/api/post";
import Meta from "@/components/Meta/Meta";
import { ITEM_PURPOSE_CHOICES, ITEM_UNIT_CHOICES } from "@/utils/constant";
import { Database } from "@/utils/database";
import {
  FieldTableInsert,
  FormType,
  ItemDescriptionFieldTableInsert,
  ItemDescriptionTableRow,
  ItemDescriptionableInsert,
  ItemTableInsert,
} from "@/utils/types";
import {
  Box,
  Button,
  Center,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconCircleDashed, IconSquareCheckFilled } from "@tabler/icons-react";
import { random } from "lodash";
import moment from "moment";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const generateRandomCode = () => {
  let result = "";
  for (let i = 5; i > 0; --i)
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  return result;
};

const getRandomArrayElement = (array: string[]) => {
  return array[Math.floor(Math.random() * array.length)];
};

const itemData = [
  {
    generalName: "FIXED CLAMP",
    unit: "piece",
    description: ["SIZE"],
    descriptionField: [["1 1/2 inch", "2 inch"]],
    item_cost_code: generateRandomCode(),
    item_gl_account: generateRandomCode(),
  },
  {
    generalName: "WELDING ROD",
    unit: "piece",
    description: ["TYPE", "LENGTH"],
    descriptionField: [["6011", "7018"], ["1/8(3.2 mm)"]],
    item_cost_code: generateRandomCode(),
    item_gl_account: generateRandomCode(),
  },

  {
    generalName: "GREASE",
    unit: "liter",
    description: ["PRODUCT NAME", "BRAND"],
    descriptionField: [["SHELL GADUS S2 V220 0"], ["SHELL"]],
    item_cost_code: generateRandomCode(),
    item_gl_account: generateRandomCode(),
  },
  {
    generalName: "DEGREASER",
    unit: "liter",
    description: ["PRODUCT NAME", "BRAND"],
    descriptionField: [["GREASOLVE"], ["PETRON"]],
    item_cost_code: generateRandomCode(),
    item_gl_account: generateRandomCode(),
  },
  {
    generalName: "FUEL",
    unit: "liter",
    description: ["PRODUCT"],
    descriptionField: [["DIESEL", "GASOLINE"]],
    item_cost_code: generateRandomCode(),
    item_gl_account: generateRandomCode(),
  },
  {
    generalName: "ADMIXTURE",
    unit: "",
    description: ["BRAND"],
    descriptionField: [["CHRYSO OMEGA 98S"]],
    item_cost_code: generateRandomCode(),
    item_gl_account: generateRandomCode(),
  },
];

type ItemDescriptionField = {
  item_description: ItemDescriptionTableRow[];
  item_general_name: string;
};

const Page = () => {
  const ADMIN_LIST = [
    "3509e019-bfb5-4749-8793-6fa6fa122fad",
    "c03b4b38-83f6-4b9d-8c80-a0d4035307de",
    "ea687db8-1177-4f88-93db-9e9a370610b9",
  ];
  const GROUP_LIST = [
    "Warehouse Processor",
    "Accounting Processor",
    "Warehouse Receiver",
    "Treasury Processor",
    "Audit Processor",
  ];
  const PROJECT_LIST = [
    "Philip Morris",
    "Siguil Hydro",
    "Lake Mainit",
    "Meralco HDD",
  ];
  const STATUS_LIST = ["PENDING", "APPROVED", "REJECTED", "CANCELED"];

  const ITEM_SECTION_ID = "0672ef7d-849d-4bc7-81b1-7a5eefcc1451";

  const [isSeeding, setIsSeeding] = useState(false);
  const supabaseClient = createPagesBrowserClient<Database>();
  const [uploadedBatchSize, setUploadedBatchSize] = useState(0);
  const totalSeedRows = 2000000;

  const [dataCreationStatus, setDataCreationStatus] = useState({
    createTeam: false,
    createMembers: false,
    createForms: false,
    createItems: false,
    createRequests: false,
  });

  const getRandomDateWithinYear = () => {
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const millisecondsUntilToday =
      currentDate.getTime() - startOfYear.getTime();
    const randomMilliseconds = Math.random() * millisecondsUntilToday;
    const randomDate = new Date(startOfYear.getTime() + randomMilliseconds);

    return moment(randomDate).format();
  };

  const generateMainSectionResponse = (field: string) => {
    switch (field) {
      case "Project Name":
        return PROJECT_LIST[random(0, PROJECT_LIST.length - 1)];
      case "Type":
        return "Cash Purchase - Local Purchase";
      case "Date Needed":
        return moment("2023-12-25").format();
      default:
        return null;
    }
  };

  const generateItemSectionResponse = (
    field: string,
    randomItem: (typeof itemData)[0]
  ) => {
    switch (field) {
      case "General Name":
        return randomItem.generalName;
      case "Unit of Measurement":
        return randomItem.unit;
      case "Quantity":
        return random(0, 100);
      case "GL Account":
        return randomItem.item_gl_account;
      case "Cost Code":
        return randomItem.item_cost_code;
      default:
        return null;
    }
  };

  const fetchItemDescriptionFields = async () => {
    const itemDescriptionFields = await Promise.all(
      itemData.map(async (item) => {
        const { data: itemMatch } = await supabaseClient
          .from("item_table")
          .select("item_id")
          .eq("item_general_name", item.generalName)
          .single();

        if (!itemMatch) throw Error("Item not found");

        const { data } = await supabaseClient
          .from("item_description_table")
          .select("*")
          .eq("item_description_item_id", itemMatch.item_id);

        if (!data) throw Error("Item not found");
        return { item_description: data, item_general_name: item.generalName };
      })
    );
    return itemDescriptionFields;
  };

  const generateRequestData = async (
    batchSize: number,
    teamOwnerMemberId: string,
    formId: string,
    mainFields: FormType["form_section"][0]["section_field"],
    itemFields: FormType["form_section"][0]["section_field"],
    itemDescriptionList: ItemDescriptionField[],
    signerId: string
  ) => {
    const dataBatch = [];

    const randomItem = itemData[random(0, itemData.length - 1)];
    const itemDescriptionFields = itemDescriptionList.find(
      (item) => item.item_general_name === randomItem.generalName
    );
    if (!itemDescriptionFields) throw Error("Item description not found");

    for (let i = 0; i < batchSize; i++) {
      const otpRequestStatus = STATUS_LIST[random(0, STATUS_LIST.length - 1)];
      const otpRequestId = uuidv4();
      const otpRequestData = {
        request_id: otpRequestId,
        request_team_member_id: teamOwnerMemberId,
        request_form_id: formId,
        request_status: otpRequestStatus,
        request_date_created: getRandomDateWithinYear(),
      };

      const otpResponseData = [];
      const mainSectionResponseData = mainFields.map((field) => {
        const newResponse = {
          request_response_id: uuidv4(),
          request_response: JSON.stringify(
            generateMainSectionResponse(field.field_name)
          ),
          request_response_duplicatable_section_id: null,
          request_response_field_id: field.field_id,
          request_response_request_id: otpRequestId,
        };

        return newResponse;
      });

      otpResponseData.push(...mainSectionResponseData);
      const itemFieldsResponseData = itemFields.map((field) => {
        const newResponse = {
          request_response_id: uuidv4(),
          request_response:
            field.field_name === "Quantity"
              ? `${generateItemSectionResponse(field.field_name, randomItem)}`
              : JSON.stringify(
                  generateItemSectionResponse(field.field_name, randomItem)
                ),
          request_response_duplicatable_section_id: null,
          request_response_field_id: field.field_id,
          request_response_request_id: otpRequestId,
        };

        return newResponse;
      });
      otpResponseData.push(...itemFieldsResponseData);

      const itemDescriptionResponseData =
        itemDescriptionFields.item_description.map((item, index) => {
          const responseId = uuidv4();
          const newResponse = {
            request_response_id: responseId,
            request_response: JSON.stringify(
              randomItem.descriptionField[index][0]
            ),
            request_response_duplicatable_section_id: null,
            request_response_field_id: item.item_description_field_id,
            request_response_request_id: otpRequestId,
          };

          return newResponse;
        });

      otpResponseData.push(...itemDescriptionResponseData);

      const signer = {
        request_signer_id: uuidv4(),
        request_signer_status: otpRequestStatus,
        request_signer_request_id: otpRequestId,
        request_signer_signer_id: signerId,
      };

      dataBatch.push({
        request: otpRequestData,
        response: otpResponseData,
        signer: signer,
      });
    }
    return dataBatch;
  };

  const generateSeedData = async (
    teamOwnerMemberId: string,
    form: FormType,
    itemDescriptionList: ItemDescriptionField[],
    signerId: string
  ) => {
    const batchSize = 1000;
    const totalDataEntries = totalSeedRows;
    const batches = [];
    const sectionFields = form.form_section.flatMap(
      (section) => section.section_field
    );
    const mainFields = sectionFields.filter((field) =>
      ["Project Name", "Type", "Date Needed"].includes(field.field_name)
    );

    const itemFields = sectionFields.filter((field) =>
      [
        "General Name",
        "Unit of Measurement",
        "Quantity",
        "GL Account",
        "Cost Code",
      ].includes(field.field_name)
    );

    for (let i = 0; i < totalDataEntries / batchSize; i++) {
      const dataBatch = await generateRequestData(
        batchSize,
        teamOwnerMemberId,
        form.form_id,
        mainFields,
        itemFields,
        itemDescriptionList,
        signerId
      );
      batches.push(dataBatch);
    }

    for (const batch of batches) {
      const requestTableBatch = batch.map((b) => b.request);
      const { error: insertRequestDataError } = await supabaseClient
        .from("request_table")
        .insert(requestTableBatch);

      if (insertRequestDataError) throw insertRequestDataError;

      const signerTableBatch = batch.flatMap((b) => b.signer);
      const { error: insertSignerTableError } = await supabaseClient
        .from("request_signer_table")
        .insert(signerTableBatch);

      console.log("signer table error", insertSignerTableError);
      if (insertSignerTableError) throw insertSignerTableError;

      const responseTableBatch = batch.flatMap((b) => b.response);
      const { error: insertResponseDataError } = await supabaseClient
        .from("request_response_table")
        .insert(responseTableBatch);

      console.log("response table error", insertResponseDataError);

      if (insertResponseDataError) throw insertRequestDataError;

      setUploadedBatchSize((prev) => prev + batch.length);
    }
  };

  const handleRequestSeed = async () => {
    try {
      setIsSeeding(true);
      const formList = [];
      const OWNER_USER_ID = ADMIN_LIST[0];
      // 1. create XYZ Corp team
      const team = {
        team_name: "XYZ Corp",
        team_user_id: OWNER_USER_ID,
        team_group_list: GROUP_LIST,
        team_project_list: PROJECT_LIST,
      };
      const { data: newTeam } = await supabaseClient
        .from("team_table")
        .insert(team)
        .select("team_id")
        .maybeSingle();
      if (!newTeam) return;

      setDataCreationStatus((prev) => ({ ...prev, createTeam: true }));

      // 2. add members
      const team_members = ADMIN_LIST.map((admin, index) => ({
        team_member_user_id: admin,
        team_member_team_id: newTeam.team_id,
        team_member_role: index === 0 ? "OWNER" : "ADMIN",
        team_member_group_list: GROUP_LIST,
        team_member_project_list: PROJECT_LIST,
      }));

      const { data: members, error: insertTeamMemberError } =
        await supabaseClient
          .from("team_member_table")
          .insert(team_members)
          .select("*");

      if (insertTeamMemberError || !members) {
        console.log(insertTeamMemberError);
        return;
      }
      setDataCreationStatus((prev) => ({ ...prev, createMembers: true }));

      // 3. create forms
      const teamOwner = members.find(
        (member) => member.team_member_role === "OWNER"
      );
      if (!teamOwner) throw Error("Team owner not found");
      await createFormslyPremadeForms(supabaseClient, {
        teamMemberId: teamOwner.team_member_id,
      });
      setDataCreationStatus((prev) => ({ ...prev, createForms: true }));

      // get formList and add signers
      const formListData = await getFormList(supabaseClient, {
        teamId: newTeam.team_id,
        app: "REQUEST",
      });

      const adminMember = members.find(
        (member) => member.team_member_role === "ADMIN"
      );
      if (!formListData || !adminMember) return;
      formList.push(...formListData);
      const formIdList = formListData.map((form) => form.form_id);
      const signer = {
        signer_team_member_id: adminMember.team_member_id,
        signer_action: "APPROVED",
        signer_order: 1,
      };
      // add signer on each form
      const signerList = await Promise.all(
        formIdList.map(async (formId) => {
          const { data: newSigner } = await supabaseClient
            .from("signer_table")
            .insert({ ...signer, signer_form_id: formId })
            .select("*")
            .single();
          return newSigner;
        })
      );

      // 4. create items
      await handleItemSeed(newTeam.team_id);
      const itemDescriptionList = await fetchItemDescriptionFields();
      setDataCreationStatus((prev) => ({ ...prev, createItems: true }));

      // 5. create OTP request
      const otpFormId = formList.find(
        (form) => form.form_name === "Order to Purchase"
      )?.form_id;

      const otpForm = await getForm(supabaseClient, {
        formId: `${otpFormId}`,
      });

      const signerId = signerList.find(
        (signer) => signer?.signer_form_id === otpFormId
      )?.signer_id;
      // 6. insert OTP request to database
      if (!otpForm) throw Error("OTP Form not found");
      if (!signerId) throw Error("Signer Id not found");
      await generateSeedData(
        `${teamOwner?.team_member_id}`,
        otpForm,
        itemDescriptionList,
        signerId
      );

      notifications.show({
        message: "Seeded Successfully",
        color: "green",
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleItemSeed = async (teamId: string) => {
    try {
      const itemInput: ItemTableInsert[] = [];
      const fieldInput: FieldTableInsert[] = [];
      const itemDescriptionInput: ItemDescriptionableInsert[] = [];
      const itemDescriptionFieldInput: ItemDescriptionFieldTableInsert[] = [];

      itemData.forEach((item) => {
        const itemId = uuidv4();

        // insert item
        itemInput.push({
          item_id: itemId,
          item_general_name: item.generalName,
          item_unit: item.unit
            ? item.unit
            : getRandomArrayElement(ITEM_UNIT_CHOICES),
          item_purpose: getRandomArrayElement(ITEM_PURPOSE_CHOICES),
          item_cost_code: generateRandomCode(),
          item_gl_account: generateRandomCode(),
          item_team_id: teamId,
        });

        item.description.forEach((description, index) => {
          const fieldId = uuidv4();
          const itemDescriptionId = uuidv4();

          // insert field
          fieldInput.push({
            field_id: fieldId,
            field_name: description,
            field_is_required: true,
            field_type: "DROPDOWN",
            field_order: 9,
            field_section_id: ITEM_SECTION_ID,
          });

          // insert description
          itemDescriptionInput.push({
            item_description_id: itemDescriptionId,
            item_description_label: description,
            item_description_field_id: fieldId,
            item_description_item_id: itemId,
          });

          item.descriptionField[index].forEach((descriptionField) => {
            // insert description field
            itemDescriptionFieldInput.push({
              item_description_field_value: descriptionField,
              item_description_field_item_description_id: itemDescriptionId,
            });
          });
        });
      });

      const { error: itemError } = await supabaseClient
        .from("item_table")
        .insert(itemInput);
      if (itemError) throw itemError;
      const { error: fieldError } = await supabaseClient
        .from("field_table")
        .insert(fieldInput);
      if (fieldError) throw fieldError;
      const { error: itemDescriptionError } = await supabaseClient
        .from("item_description_table")
        .insert(itemDescriptionInput);
      if (itemDescriptionError) throw itemDescriptionError;
      const { error: itemDescriptionFieldError } = await supabaseClient
        .from("item_description_field_table")
        .insert(itemDescriptionFieldInput);
      if (itemDescriptionFieldError) throw itemDescriptionFieldError;
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Meta description="Request Seed" url="/request-seed" />
      <Container>
        <Center>
          <Stack>
            <Title>Request Seed</Title>
            <Button loading={isSeeding} onClick={handleRequestSeed}>
              Seed Requests
            </Button>
            <Stack>
              <Text>Seed status</Text>
              {dataCreationStatus.createTeam && (
                <Group spacing="xs" c="green" align="center">
                  <IconSquareCheckFilled />
                  <Text c="dark">Create Team</Text>
                </Group>
              )}
              {dataCreationStatus.createMembers && (
                <Group spacing="xs" c="green" align="center">
                  <IconSquareCheckFilled />
                  <Text c="dark">Create Members</Text>
                </Group>
              )}
              {dataCreationStatus.createForms && (
                <Group spacing="xs" c="green" align="center">
                  <IconSquareCheckFilled />
                  <Text c="dark">Create Forms</Text>
                </Group>
              )}
              {dataCreationStatus.createItems && (
                <Group spacing="xs" c="green" align="center">
                  <IconSquareCheckFilled />
                  <Text c="dark">Create Items</Text>
                </Group>
              )}
              <Group spacing="xs" c="green" align="center">
                <Box c={uploadedBatchSize === 2000000 ? "green" : "blue"}>
                  {uploadedBatchSize === 2000000 ? (
                    <IconSquareCheckFilled />
                  ) : (
                    <IconCircleDashed />
                  )}
                </Box>
                <Text c="dark">{`Create requests: ${uploadedBatchSize.toLocaleString()}/${totalSeedRows.toLocaleString()}`}</Text>
              </Group>
            </Stack>
          </Stack>
        </Center>
      </Container>
    </>
  );
};

export default Page;
Page.Layout = "HOME";
