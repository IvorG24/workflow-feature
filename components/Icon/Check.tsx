import * as React from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgCheck = ({ title, titleId }: SVGRProps) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d="M18.9 35.7 7.7 24.5l2.15-2.15 9.05 9.05 19.2-19.2 2.15 2.15L18.9 35.7Z"
      fill="#444746"
    />
  </svg>
);
export default SvgCheck;
