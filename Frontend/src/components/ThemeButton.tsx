import { BedtimeOutlined, WbSunnyOutlined } from "@mui/icons-material";
import { useTheme } from "../hooks/useTheme";

export default function ThemeButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      className="theme-toggle-btn" 
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <BedtimeOutlined /> : <WbSunnyOutlined />}
    </button>
  );
}
