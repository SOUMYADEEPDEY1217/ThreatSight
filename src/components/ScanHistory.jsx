import { ExternalLink, Clock, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import moment from 'moment';

const riskConfig = {
  safe: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
  low: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  high: { color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.2)' },
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
};

export default function ScanHistory({ scans = [], onSelectScan, onDelete }) {
  if (scans.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary mx-auto mb-4 flex items-center justify-center">
          <Clock className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">No scans yet. Enter a URL above to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Recent Scans</h3>
      </div>
      
      <div className="divide-y divide-border">
        {scans.map((scan, i) => {
          const risk = riskConfig[scan.risk_level] || riskConfig.safe;
          return (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelectScan(scan)}
              className="px-5 py-4 flex items-center gap-4 hover:bg-secondary/50 cursor-pointer transition-colors duration-200"
            >
              {/* Score badge */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-sm shrink-0"
                style={{ backgroundColor: risk.bg, color: risk.color, border: `1px solid ${risk.border}` }}
              >
                {scan.threat_score}
              </div>
              
              {/* URL and meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono text-foreground truncate">
                    {scan.url}
                  </p>
                  <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span
                    className="text-[10px] font-mono font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full"
                    style={{ color: risk.color, backgroundColor: risk.bg, border: `1px solid ${risk.border}` }}
                  >
                    {scan.risk_level}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {moment(scan.created_date).fromNow()}
                  </span>
                  {scan.domain && (
                    <span className="text-xs text-muted-foreground font-mono">
                      {scan.domain}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Delete button */}
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(scan.id); }}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
