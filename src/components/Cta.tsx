import clsx from "clsx";

const variantStyles = {
  primary:
    "rounded-full bg-sky-400 py-2 px-4 text-sm font-semibold text-slate-900 hover:bg-sky-300 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300/50 active:bg-sky-500",
  secondary:
    "rounded-full bg-slate-800 py-2 px-4 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 active:text-slate-400",
};

type CtaProps = {
  variant?: keyof typeof variantStyles;
  target?: string;
} & (
  | React.ComponentPropsWithoutRef<"a">
  | (React.ComponentPropsWithoutRef<"button"> & { href: string })
);

export default function Cta({
  variant = "primary",
  className,
  target,
  children,
  ...props
}: CtaProps) {
  className = clsx("my-4 cursor-pointer", variantStyles[variant], className);

  return (
    <a href={props.href} target={target}>
      <button className={className}>{children}</button>
    </a>
  );
}
