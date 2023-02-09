import { Button, Group, Select, Text, TextInput } from "@mantine/core";
import React, { forwardRef, useEffect, useState } from "react";

import {
  getTeamFormTemplateNameList,
  GetTeamFormTemplateNameList,
  getTeamMemberList,
} from "@/utils/queries";
import { requestStatusList } from "@/utils/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { startCase } from "lodash";
import { useRouter } from "next/router";
import queryString from "query-string";

export type Filter = {
  form: string;
  mainStatus: string;
  approverList: string[];
  requester: string;
  keyword: string;
};

interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
  image: string;
  label: string;
  description: string;
  value: string;
}
const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ image, label, description, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <div>
          <Text size="sm">{label}</Text>
          <Text size="xs" opacity={0.65}>
            {description}
          </Text>
        </div>
      </Group>
    </div>
  )
);
// export type RequestListProps = { requestList: GetTeamRequestList };

function RequestListFilter() {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const [filter, setFilter] = useState<Partial<Filter>>({
    keyword: "",
    approverList: [],
    form: "",
    requester: "",
    mainStatus: "",
  });
  //   const [teamMemberList, setTeamMemberList] = useState<ItemProps[]>([]);
  const [teamMemberList, setTeamMemberList] = useState<string[]>([]);
  const [formTemplateNameList, setFormTemplateNameList] =
    useState<GetTeamFormTemplateNameList>([]);

  const handleFilterChange = (
    name: "keyword" | "approverList" | "form" | "requester" | "mainStatus",
    value?: string | string[]
  ) => {
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilterList = () => {
    setFilter({
      keyword: "",
      approverList: [],
      form: "",
      requester: "",
      mainStatus: "",
    });
    router.push(`/teams/${router.query.teamName}/requests`);
  };

  const handleApplyFilters = (filter: Partial<Filter>) => {
    const stringified = queryString.stringify(filter);
    router.push(`/teams/${router.query.teamName}/requests?${stringified}`);
  };

  useEffect(() => {
    (async () => {
      const data = await getTeamFormTemplateNameList(
        supabaseClient,
        router.query.teamName as string
      );

      setFormTemplateNameList(data);
    })();
  }, []);

  useEffect(() => {
    if (!router.isReady) return;

    setFilter({
      keyword: (router.query.keyword || "") as string,
      approverList: (router.query.approverList || []) as string[],
      form: (router.query.form || "") as string,
      requester: (router.query.requester || "") as string,
      mainStatus: (router.query.mainStatus || "") as string,
    });
  }, [router.query]);

  useEffect(() => {
    (async () => {
      const data = await getTeamMemberList(
        supabaseClient,
        router.query.teamName as string
      );

      // format to ItemProps
      //   const teamMemberList = data.map((member) => {
      //     return {
      //       image: `${toUpper(member?.username?.[0])} ${toUpper(
      //         member?.username?.[1]
      //       )}`,
      //       label: member.username || "No username",
      //       description: member.member_role_id || "No role",
      //       value: member.username || "",
      //     };
      //   });
      const teamMemberList = data.map((member) => {
        return member.username || "";
      });

      setTeamMemberList(teamMemberList);
    })();
  }, []);

  return (
    <>
      <Group noWrap grow>
        <TextInput
          placeholder="Search title or description by keyword"
          onChange={(e) => handleFilterChange("keyword", e.currentTarget.value)}
          value={filter.keyword}
        />
        <Select
          placeholder="Select form"
          data={formTemplateNameList.map((form) => {
            return {
              label: form.form_name || "",
              value: form.form_name || "",
            };
          })}
          searchable
          onChange={(value) => handleFilterChange("form", value || undefined)}
          value={filter.form as string}
        />
      </Group>

      {/* <Group my="xs" noWrap grow>
        <MultiSelect
          itemComponent={SelectItem}
          data={teamMemberList}
          searchable
          nothingFound="Team member not found"
          placeholder="Select approvers"
          onChange={(value) =>
            handleFilterChange(
              "approverList",
              value && value.length > 0 ? value : undefined
            )
          }
          value={filter.approverList as string[]}
        />
        <MultiSelect
          itemComponent={SelectItem}
          data={teamMemberList}
          searchable
          nothingFound="Team member not found"
          placeholder="Select requester"
          onChange={(value) =>
            handleFilterChange(
              "requester",
              value && value.length > 0 ? value : undefined
            )
          }
          value={filter.requester as string[]}
        />
      </Group> */}
      <Group my="xs" noWrap grow>
        {/* <Select
          data={teamMemberList}
          searchable
          nothingFound="Team member not found"
          placeholder="Select approvers"
          onChange={(value) =>
            handleFilterChange(
              "approverList",
              value && value.length > 0 ? value : undefined
            )
          }
          value={`${filter.approverList}`}
        /> */}
        <Select
          placeholder="Select main status"
          data={requestStatusList.map((status) => {
            return {
              label: startCase(status),
              value: status,
            };
          })}
          searchable
          onChange={(value) =>
            handleFilterChange("mainStatus", value || undefined)
          }
          value={filter.mainStatus as string}
        />
        <Select
          data={teamMemberList}
          searchable
          nothingFound="Team member not found"
          placeholder="Select requester"
          onChange={(value) =>
            handleFilterChange(
              "requester",
              value && value.length > 0 ? value : undefined
            )
          }
          value={`${filter.requester}`}
        />
      </Group>
      <Group noWrap>
        <Button onClick={() => handleApplyFilters(filter)}>
          Apply Filters
        </Button>
        <Button variant="outline" onClick={() => handleClearFilterList()}>
          Clear
        </Button>
      </Group>
    </>
  );
}

export default RequestListFilter;
