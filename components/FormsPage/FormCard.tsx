import { GetTeamFormTemplateList } from "@/utils/queries-new";
import { Badge, Checkbox } from "@mantine/core";
import { useRouter } from "next/router";

type Props = {
  form: NonNullable<GetTeamFormTemplateList>[0];
};

const FormCard = ({ form }: Props) => {
  const router = useRouter();
  return (
    <tr
      key={form.form_id}
      onClick={() =>
        router.push(`/t/${router.query.tid}/forms/${form.form_id}/edit`)
      }
      style={{ cursor: "pointer" }}
    >
      <td>
        <Checkbox size="xs" label={form.form_id} />
      </td>
      <td>{form.form_name}</td>
      <td>
        <Badge
          radius="xs"
          // TODO: Archived form status.
          // color={form.form_status?.toLowerCase() === "active" ? "blue" : "gray"}
          color={"blue"}
        >
          {/* {form.form_status} */}
          Active
        </Badge>
      </td>
      <td>{new Date(`${form.form_created_at}`).toLocaleDateString()}</td>
    </tr>
  );
};

export default FormCard;
