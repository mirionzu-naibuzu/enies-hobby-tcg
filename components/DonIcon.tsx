import React from "react";

interface DonIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
}

export default function DonIcon({
  size = 20,
  color = "currentColor",
  style,
  className,
  ...props
}: DonIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block align-middle shrink-0 ${className || ""}`}
      style={style}
      aria-hidden="true"
      {...props}
    >
      {/* Main "ド" Stem */}
      <polygon points="5,22 17,14 41,84 27,84" />
      
      {/* "ド" Right Arm */}
      <polygon points="26,58 49,46 54,54 34,68" />
      
      {/* "ド" Dakuten 1 (Left) */}
      <polygon points="23,24 33,22 37,45 29,48" />
      
      {/* "ド" Dakuten 2 (Middle) */}
      <polygon points="38,24 46,25 45,41 39,42" />
      
      {/* Horizontal Wedge Connector */}
      <polygon points="50,33 66,35 64,43 50,44" />
      
      {/* Exclamation Stroke 1 */}
      <polygon points="50,67 56,72 81,43 75,37" />
      
      {/* Exclamation Stroke 2 */}
      <polygon points="69,61 74,65 94,42 89,38" />
      
      {/* Exclamation Stroke 3 */}
      <polygon points="83,62 86,65 98,51 95,47" />
      
      {/* Diamond Dot 1 */}
      <polygon points="63,72 67,67 72,71 68,76" />
      
      {/* Diamond Dot 2 */}
      <polygon points="74,74 78,70 82,73 78,78" />
    </svg>
  );
}
