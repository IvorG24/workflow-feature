type SVGRProps = {
  title?: string;
  titleId?: string;
};
const SvgSearch = ({ title, titleId }: SVGRProps) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="m8.595 7.74 3.228 3.227a.605.605 0 1 1-.856.856L7.739 8.595a4.8 4.8 0 1 1 .855-.856h.001ZM4.8 8.4a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z"
      fill="#202124"
    />
  </svg>
);
export default SvgSearch;
