import * as React from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgNotifications = ({ title, titleId }: SVGRProps) => (
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
      d="M8 38v-3h4.2V19.7c0-2.8.825-5.292 2.475-7.475C16.325 10.042 18.5 8.667 21.2 8.1V6.65c0-.767.275-1.4.825-1.9.55-.5 1.208-.75 1.975-.75.767 0 1.425.25 1.975.75s.825 1.133.825 1.9V8.1c2.7.567 4.883 1.942 6.55 4.125 1.667 2.183 2.5 4.675 2.5 7.475V35H40v3H8Zm16 6c-1.067 0-2-.392-2.8-1.175C20.4 42.042 20 41.1 20 40h8c0 1.1-.392 2.042-1.175 2.825C26.042 43.608 25.1 44 24 44Zm-8.8-9h17.65V19.7c0-2.467-.85-4.567-2.55-6.3-1.7-1.733-3.783-2.6-6.25-2.6s-4.558.867-6.275 2.6c-1.717 1.733-2.575 3.833-2.575 6.3V35Z"
      fill="currentColor"
    />
  </svg>
);
export default SvgNotifications;
