type SVGRProps = {
  title?: string;
  titleId?: string;
};
const SvgDescription = ({ title, titleId }: SVGRProps) => (
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
      d="M15.95 35.5h16.1v-3h-16.1v3Zm0-8.5h16.1v-3h-16.1v3ZM11 44c-.8 0-1.5-.3-2.1-.9-.6-.6-.9-1.3-.9-2.1V7c0-.8.3-1.5.9-2.1.6-.6 1.3-.9 2.1-.9h18.05L40 14.95V41c0 .8-.3 1.5-.9 2.1-.6.6-1.3.9-2.1.9H11Zm16.55-27.7V7H11v34h26V16.3h-9.45ZM11 7v9.3V7v34V7Z"
      fill="currentColor"
    />
  </svg>
);
export default SvgDescription;
