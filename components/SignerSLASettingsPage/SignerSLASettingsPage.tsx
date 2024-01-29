import { FormSLAWithFormName } from "@/utils/types";

type Props = {
  slaFormList: FormSLAWithFormName[];
};

const SignerSLASettingsPage = ({ slaFormList }: Props) => {
  console.log(slaFormList.map((sla) => sla.form.form_name));
  return <div>SignerSLASettingsPage</div>;
};

export default SignerSLASettingsPage;
