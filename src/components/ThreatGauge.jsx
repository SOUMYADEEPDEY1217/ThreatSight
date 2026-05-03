import { motion } from 'framer-motion';

const getRiskColor = (score) => {
  if (score <= 20) return { color: '#22c55e', label: 'Safe' };
  if (score <= 40) return { color: '#3b82f6', label: 'Low' };
  if (score <= 60) return { color: '#f59e0b', label: 'Medium' };
  if (score <= 80) return { color: '#f97316', label: 'High' };
  return { color: '#ef4444', label: 'Critical' };
};

export default function ThreatGauge({ score = 0, size = 180 }) {
  const { color, label } = getRiskColor(score);
  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius;
  const progress = (score / 100) * circumference;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Background arc */}
        <path
          d={`M 10 ${center} A ${radius} ${radius} 0 0 1 ${size - 10} ${center}`}
          fill="none"
          stroke="hsl(222 30% 14%)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <motion.path
          d={`M 10 ${center} A ${radius} ${radius} 0 0 1 ${size - 10} ${center}`}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          filter="url(#glow)"
        />
        {/* Score text */}
        <text
          x={center}
          y={center - 10}
          textAnchor="middle"
          fill={color}
          fontSize="36"
          fontWeight="700"
          fontFamily="var(--font-mono)"
        >
          {score}
        </text>
        <text
          x={center}
          y={center + 14}
          textAnchor="middle"
          fill="hsl(215 20% 55%)"
          fontSize="12"
          fontFamily="var(--font-sans)"
        >
          / 100
        </text>
      </svg>
      <span
        className="text-xs font-mono font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
        style={{ color, backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
      >
        {label}
      </span>
    </div>
  );
}
