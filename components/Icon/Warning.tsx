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
      d="M2 42L24 4L46 42H2ZM7.2 39H40.8L24 10L7.2 39ZM24.2 36.15C24.6333 36.15 24.9917 36.0083 25.275 35.725C25.5583 35.4417 25.7 35.0833 25.7 34.65C25.7 34.2167 25.5583 33.8583 25.275 33.575C24.9917 33.2917 24.6333 33.15 24.2 33.15C23.7667 33.15 23.4083 33.2917 23.125 33.575C22.8417 33.8583 22.7 34.2167 22.7 34.65C22.7 35.0833 22.8417 35.4417 23.125 35.725C23.4083 36.0083 23.7667 36.15 24.2 36.15ZM22.7 30.6H25.7V19.4H22.7V30.6Z"
      fill={color}
    />
  </svg>
);
export default SvgClose;
