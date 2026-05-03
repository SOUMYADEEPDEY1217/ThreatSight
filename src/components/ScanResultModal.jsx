import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import ThreatGauge from './ThreatGauge';
import moment from 'moment';

export default function ScanResultModal({ scan, open, onClose }) {
  if (!scan) return null;

  const isThreat = scan.is_threat;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            {isThreat ? (
              <AlertTriangle className="w-5 h-5 text-destructive" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            Scan Results
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-2">
          {/* URL */}
          <div className="bg-secondary rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-medium">Scanned URL</p>
            <p className="text-sm font-mono text-foreground break-all flex items-center gap-2">
              {scan.url}
              <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
            </p>
          </div>

          {/* Gauge */}
          <div className="flex justify-center">
            <ThreatGauge score={scan.threat_score} size={200} />
          </div>

          {/* Reasoning */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium flex items-center gap-1.5">
              <Info className="w-3 h-3" /> Analysis
            </p>
            <p className="text-sm text-secondary-foreground leading-relaxed">
              {scan.reasoning}
            </p>
          </div>

          {/* Indicators */}
          {scan.indicators && scan.indicators.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">
                Threat Indicators
              </p>
              <div className="flex flex-wrap gap-2">
                {scan.indicators.map((ind, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="font-mono text-xs bg-secondary border border-border text-secondary-foreground"
                  >
                    {ind}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {moment(scan.created_date).format('MMM D, YYYY h:mm A')}
            </span>
            {scan.scan_duration_ms && (
              <span className="font-mono">{scan.scan_duration_ms}ms</span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
