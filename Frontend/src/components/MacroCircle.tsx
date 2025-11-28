import "./styles/MacroCircle.css";
import { useEffect, useState } from "react";

interface MacroCircleProps {
  value: number;
  label: string;
  maxValue: number;
}

export default function MacroCircle({
  value,
  label,
  maxValue,
}: MacroCircleProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    setAnimatedValue(value);
  }, [value]);

  const percentage = Math.min((animatedValue / maxValue) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 500) * circumference;

  return (
    <div className="macro-item macro-circle-item">
      <div className="macro-circle-container">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="#444444"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="#d9d9d9"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="macro-circle-text">
          <div className="macro-circle-value">{Math.round(animatedValue)}</div>
          <div className="macro-circle-unit">g</div>
        </div>
      </div>
      <div className="macro-label">{label}</div>
    </div>
  );
}
