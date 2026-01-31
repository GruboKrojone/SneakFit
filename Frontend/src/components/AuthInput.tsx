import { forwardRef } from "react";
import "./styles/AuthInput.css";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type: string;
  placeholder: string;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ type, placeholder, ...rest }, ref) => {
    return (
      <input
        ref={ref}
        className="auth-input"
        type={type}
        placeholder={placeholder}
        {...rest}
      />
    );
  }
);

AuthInput.displayName = "AuthInput";

export default AuthInput;
