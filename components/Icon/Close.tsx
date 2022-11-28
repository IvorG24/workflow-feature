interface SVGRProps {
  title?: string;
  titleId?: string;
  color?: string;
}
const SvgClose = ({ title, titleId, color = "#444746" }: SVGRProps) => (
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
      d="M12.45 37.6496L10.35 35.5496L21.9 23.9996L10.35 12.4496L12.45 10.3496L24 21.8996L35.55 10.3496L37.65 12.4496L26.1 23.9996L37.65 35.5496L35.55 37.6496L24 26.0996L12.45 37.6496Z"
      fill={color}
    />
  </svg>
);
export default SvgClose;
