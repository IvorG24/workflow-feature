import * as React from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgMail = ({ title, titleId }: SVGRProps) => (
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
      d="M7 40c-.8 0-1.5-.3-2.1-.9-.6-.6-.9-1.3-.9-2.1V11c0-.8.3-1.5.9-2.1C5.5 8.3 6.2 8 7 8h34c.8 0 1.5.3 2.1.9.6.6.9 1.3.9 2.1v26c0 .8-.3 1.5-.9 2.1-.6.6-1.3.9-2.1.9H7Zm17-15.1L7 13.75V37h34V13.75L24 24.9Zm0-3L40.8 11H7.25L24 21.9ZM7 13.75V11v26-23.25Z"
      fill="#444746"
    />
  </svg>
);
export default SvgMail;
