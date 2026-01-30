import "./styles/MacroCircle.css";
import { useEffect, useState } from "react";

interface MacroCircleProps {
  readonly value: number;
  readonly label: string;
  readonly maxValue: number;
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
          <circle className="background-circle" cx="60" cy="60" r="45" />
          <circle
            className="progress-circle macro-circle-animated"
            cx="60"
            cy="60"
            r="45"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
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
