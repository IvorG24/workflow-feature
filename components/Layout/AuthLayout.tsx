import { ReactNode } from "react";
import Auth from "../Auth/Auth";

type Props = {
  children: ReactNode;
};

const AuthLayout = ({ children }: Props) => {
  return <Auth>{children}</Auth>;
};

export default AuthLayout;
