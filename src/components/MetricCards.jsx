import { Shield, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const metrics = [
  { key: 'total', label: 'Total Scans', icon: Activity, color: 'hsl(199 89% 48%)' },
  { key: 'threats', label: 'Threats Detected', icon: AlertTriangle, color: 'hsl(0 84% 60%)' },
  { key: 'safe', label: 'Safe URLs', icon: CheckCircle, color: 'hsl(142 71% 45%)' },
  { key: 'avgScore', label: 'Avg Threat Score', icon: Shield, color: 'hsl(38 92% 50%)' },
];

export default function MetricCards({ scans = [] }) {
  const total = scans.length;
  const threats = scans.filter(s => s.is_threat).length;
  const safe = total - threats;
  const avgScore = total > 0 ? Math.round(scans.reduce((sum, s) => sum + (s.threat_score || 0), 0) / total) : 0;

  const values = { total, threats, safe, avgScore };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, i) => {
        const Icon = m.icon;
        return (
          <motion.div
            key={m.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="relative overflow-hidden bg-card border border-border rounded-xl p-5 group hover:border-primary/30 transition-colors duration-300"
          >
            {/* Subtle gradient overlay */}
            <div
              className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10"
              style={{ backgroundColor: m.color }}
            />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {m.label}
                </span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${m.color}15` }}
                >
                  <Icon className="w-4 h-4" style={{ color: m.color }} />
                </div>
              </div>
              <p className="text-3xl font-bold font-mono text-foreground">
                {values[m.key]}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
