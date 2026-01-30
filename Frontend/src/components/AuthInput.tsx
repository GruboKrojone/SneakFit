import "./styles/AuthInput.css";

interface AuthInputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AuthInput({
  type,
  placeholder,
  value,
  onChange,
}: AuthInputProps) {
  return (
    <input
      className="auth-input"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}
