type SVGRProps = {
  title?: string;
  titleId?: string;
};
const SvgEditDocument = ({ title, titleId }: SVGRProps) => (
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
      d="M11 44c-.8 0-1.5-.3-2.1-.9-.6-.6-.9-1.3-.9-2.1V7c0-.8.3-1.5.9-2.1.6-.6 1.3-.9 2.1-.9h17l12 12v7.8h-3V18H26V7H11v34h15v3H11Zm0-3V7v34Zm26.8-11.15 1.4 1.4-8.2 8.2V42h2.55l8.2-8.2 1.4 1.4-8.8 8.8H29v-5.35l8.8-8.8Zm5.35 5.35-5.35-5.35 3.05-3.05c.3-.3.65-.45 1.05-.45s.75.15 1.05.45l3.25 3.25c.3.3.45.65.45 1.05s-.15.75-.45 1.05l-3.05 3.05Z"
      fill="currentColor"
    />
  </svg>
);
export default SvgEditDocument;
