import "./styles/AuthButton.css";

interface AuthButtonProps {
  id?: string;
  name?: string;
  type: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function AuthButton({
  id,
  name,
  type,
  onClick,
  disabled = false,
  loading = false,
}: AuthButtonProps) {
  return (
    <button
      id={id}
      className="auth-button"
      type={type || "button"}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? "Signing in..." : name}
    </button>
  );
}
