import { forwardRef } from "react";
import { motion } from "framer-motion";

const variants = {
  primary: {
    bg: "var(--admin-primary)",
    color: "var(--admin-text-inverse)",
    hoverBg: "var(--admin-primary-hover)",
    border: "transparent",
  },
  secondary: {
    bg: "var(--admin-surface)",
    color: "var(--admin-text)",
    hoverBg: "var(--admin-surface-secondary)",
    border: "var(--admin-border)",
  },
  accent: {
    bg: "var(--admin-accent)",
    color: "#1A1A1A",
    hoverBg: "var(--admin-accent-hover)",
    border: "transparent",
  },
  ghost: {
    bg: "transparent",
    color: "var(--admin-text-secondary)",
    hoverBg: "var(--admin-surface-secondary)",
    border: "transparent",
  },
  danger: {
    bg: "var(--admin-danger)",
    color: "white",
    hoverBg: "#b91c1c",
    border: "transparent",
  },
  "danger-outline": {
    bg: "transparent",
    color: "var(--admin-danger)",
    hoverBg: "var(--admin-danger-light)",
    border: "var(--admin-danger)",
  },
};

const sizes = {
  xs: { padding: "6px 12px", fontSize: "12px", height: "30px", iconSize: 14 },
  sm: { padding: "8px 16px", fontSize: "13px", height: "36px", iconSize: 16 },
  md: { padding: "10px 20px", fontSize: "14px", height: "40px", iconSize: 18 },
  lg: { padding: "12px 28px", fontSize: "15px", height: "48px", iconSize: 20 },
};

const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    icon: Icon,
    iconRight: IconRight,
    loading = false,
    disabled = false,
    fullWidth = false,
    onClick,
    type = "button",
    className = "",
    ...props
  },
  ref,
) {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  // Extract style so it doesn't get overwritten by ...props
  const { style, ...restProps } = props;

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: 600,
        fontFamily: "var(--admin-font-sans)",
        height: s.height,
        borderRadius: "var(--admin-radius-lg)",
        border: `1px solid ${v.border}`,
        background: disabled ? "var(--admin-border-light)" : v.bg,
        color: disabled ? "var(--admin-text-muted)" : v.color,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all var(--admin-transition-base)",
        width: fullWidth ? "100%" : "auto",
        opacity: loading ? 0.7 : 1,
        whiteSpace: "nowrap",
        letterSpacing: "-0.01em",
        lineHeight: 1,
        textDecoration: "none",
        ...style,
      }}
      {...restProps}
    >
      {loading ? (
        <span
          style={{
            width: s.iconSize,
            height: s.iconSize,
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.6s linear infinite",
          }}
        />
      ) : Icon ? (
        <Icon size={s.iconSize} />
      ) : null}
      {children}
      {IconRight && !loading && <IconRight size={s.iconSize} />}
    </motion.button>
  );
});

export default Button;
