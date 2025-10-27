import "./styles/AuthButton.css";

interface AuthButtonProps {
  name?: string;
  disabled?: boolean;
  loading?: boolean;
}

export default function AuthButton({
  name,
  disabled = false,
  loading = false,
}: AuthButtonProps) {
  return (
    <button className="auth-button" type="submit" disabled={disabled || loading}>
      {loading ? "Signing in..." : name}
    </button>
  );
}
