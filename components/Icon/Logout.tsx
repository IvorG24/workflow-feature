import * as React from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgLogout = ({ title, titleId }: SVGRProps) => (
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
      d="M9 42c-.8 0-1.5-.3-2.1-.9-.6-.6-.9-1.3-.9-2.1V9c0-.8.3-1.5.9-2.1C7.5 6.3 8.2 6 9 6h14.55v3H9v30h14.55v3H9Zm24.3-9.25-2.15-2.15 5.1-5.1h-17.5v-3h17.4l-5.1-5.1 2.15-2.15 8.8 8.8-8.7 8.7Z"
      fill="currentColor"
    />
  </svg>
);
export default SvgLogout;
