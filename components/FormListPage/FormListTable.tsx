import {
  ActionIcon,
  Avatar,
  Button,
  createStyles,
  Group,
  ScrollArea,
  Table,
  Text,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconInfoCircle } from "@tabler/icons";
import { startCase } from "lodash";
import { useRouter } from "next/router";
import { useState } from "react";

const useStyles = createStyles((theme) => ({
  row: {
    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.fn.rgba(theme.colors[theme.primaryColor][7], 0.1)
          : theme.colors[theme.primaryColor][0],
    },
    cursor: "pointer",
  },
  rowSelected: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.fn.rgba(theme.colors[theme.primaryColor][7], 0.2)
        : theme.colors[theme.primaryColor][0],
  },
}));

export type FormListTableProps = {
  data: {
    avatar: string;
    username: string;
    formName: string;
    isHidden: boolean;
    id: string;
  }[];
};

export default function FormListTable({ data }: FormListTableProps) {
  const router = useRouter();
  const { classes, cx } = useStyles();
  const [selection, setSelection] = useState("-1");
  const toggleRow = (id: string) => setSelection(id);
  const [isEditingForm, setIsEditingForm] = useState("");

  const rows = data.map((item, index) => {
    const selected = selection === item.id;

    return (
      <tr key={item.id} className={cx({ [classes.rowSelected]: selected })}>
        <td>
          <Group spacing="sm">
            <Avatar size={26} radius={26}>
              {startCase(item.username[0])}
              {startCase(item.username[1])}
            </Avatar>
            <Text size="sm" weight={500}>
              {item.username}
            </Text>
          </Group>
        </td>
        <td>{item.formName}</td>
        <td>Member</td>
        <td>{item.isHidden ? "Hidden" : "Visible"}</td>
        <td>
          <Button
            onClick={(event) => {
              event.stopPropagation();
              toggleRow(item.id);
              setIsEditingForm(item.formName);
            }}
            size="xs"
            variant="outline"
          >
            Update
          </Button>
        </td>
      </tr>
    );
  });

  return (
    <>
      <Text size="xl" mb="xl" weight="bolder">
        Forms
      </Text>
      {isEditingForm && (
        <Group mb="xs" spacing="sm">
          <Button
            onClick={() => {
              router.push(
                `/teams/${router.query.teamName}/forms/${isEditingForm}/edit`
              );
            }}
          >
            Edit {isEditingForm}
          </Button>
          <Button variant="outline" color="dark">
            Hide
          </Button>
          <Button color="red">Delete</Button>
        </Group>
      )}
      <ScrollArea>
        <Table sx={{ minWidth: 800 }} verticalSpacing="sm">
          <thead>
            <tr>
              <th>Created By</th>
              <th>Form Name</th>
              <th>Role</th>
              <th>
                <Group noWrap>
                  <Text>Visibility</Text>
                  <ActionIcon
                    size="xs"
                    onClick={() =>
                      showNotification({
                        title: "Info",
                        message:
                          "Hide this form from everyone except team admins",
                        color: "info",
                      })
                    }
                  >
                    <IconInfoCircle size={18} stroke={1.5} />
                  </ActionIcon>
                </Group>
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </ScrollArea>
    </>
  );
}
