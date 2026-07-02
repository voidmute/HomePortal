import type { ComponentType } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Download,
  File,
  Folder,
  Home,
  Menu,
  Smartphone,
  Upload,
  X,
  type IconProps,
} from "react-feather";

export {
  ArrowRight,
  ArrowUpRight,
  Download,
  File,
  Folder,
  Home,
  Menu,
  Smartphone,
  Upload,
  X,
};

type FeatherIconProps = IconProps & {
  size?: number;
  className?: string;
};

export function Icon({
  icon: IconComponent,
  size = 18,
  className = "",
  strokeWidth = 1.75,
  ...props
}: FeatherIconProps & { icon: ComponentType<IconProps> }) {
  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={`inline-block shrink-0 ${className}`}
      aria-hidden
      {...props}
    />
  );
}
