import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import ScannerInput from '../components/ScannerInput';
import MetricCards from '../components/MetricCards';
import ScanHistory from '../components/ScanHistory';
import ScanResultModal from '../components/ScanResultModal';
import ThreatGauge from '../components/ThreatGauge';
import ThreatGlobe from '../components/ThreatGlobe';
import { Loader2 } from 'lucide-react';
import PullToRefresh from '../components/PullToRefresh';

export default function Dashboard() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [latestResult, setLatestResult] = useState(null);
  const [selectedScan, setSelectedScan] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    const results = await base44.entities.ScanResult.list('-created_date', 50);
    setScans(results);
    setLoading(false);
  };

  const handleScan = async (url) => {
    setIsScanning(true);
    setLatestResult(null);
    const startTime = Date.now();

    let domain = '';
    try {
      domain = new URL(url).hostname;
    } catch { /* ignore */ }

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a cybersecurity expert analyzing URLs for phishing and malicious content.

Analyze this URL: ${url}

Evaluate the following:
1. Domain reputation and structure (suspicious TLDs, misspellings of known brands, excessive subdomains)
2. URL path patterns (encoded characters, suspicious keywords like "login", "verify", "secure", "account")
3. Known phishing patterns and social engineering indicators
4. SSL/HTTPS usage
5. URL length and complexity

Provide a realistic threat assessment. Be thorough but fair - not every unknown URL is dangerous.`,
      response_json_schema: {
        type: "object",
        properties: {
          threat_score: {
            type: "number",
            description: "Threat score from 0-100. 0=completely safe, 100=confirmed malicious"
          },
          risk_level: {
            type: "string",
            enum: ["safe", "low", "medium", "high", "critical"],
            description: "Overall risk classification"
          },
          reasoning: {
            type: "string",
            description: "2-3 sentence explanation of the analysis findings"
          },
          indicators: {
            type: "array",
            items: { type: "string" },
            description: "List of specific threat indicators found (e.g. 'Suspicious TLD', 'Brand impersonation', 'Encoded redirect')"
          },
          is_threat: {
            type: "boolean",
            description: "Whether this URL should be classified as a threat (score > 50)"
          }
        }
      }
    });

    const scanDuration = Date.now() - startTime;

    const scanData = {
      url,
      domain,
      threat_score: analysis.threat_score,
      risk_level: analysis.risk_level,
      reasoning: analysis.reasoning,
      indicators: analysis.indicators || [],
      is_threat: analysis.is_threat,
      scan_duration_ms: scanDuration,
    };

    const created = await base44.entities.ScanResult.create(scanData);
    setLatestResult(created);
    setIsScanning(false);
    loadScans();
  };

  const handleSelectScan = (scan) => {
    setSelectedScan(scan);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={loadScans}>
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">{"AI-powered phishing & malicious URL analysis"}</p>
      </div>

      {/* Scanner */}
      <ScannerInput onScan={handleScan} isScanning={isScanning} />

      {/* Scanning animation */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card border border-primary/20 rounded-xl p-8 text-center"
          >
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-primary/40 animate-ping" style={{ animationDelay: '0.2s' }} />
              <div className="absolute inset-4 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            </div>
            <p className="text-sm text-foreground font-medium">Analyzing URL...</p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">{"Running heuristic & AI analysis engine"}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Latest result inline */}
      <AnimatePresence>
        {latestResult && !isScanning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-40 shrink-0">
                <ThreatGlobe score={latestResult.threat_score} />
              </div>
              <div className="flex-1 space-y-3 text-center md:text-left">
                <p className="text-xs text-muted-foreground font-mono break-all">{latestResult.url}</p>
                <p className="text-sm text-secondary-foreground leading-relaxed">{latestResult.reasoning}</p>
                {latestResult.indicators?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                    {latestResult.indicators.map((ind, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics */}
      <MetricCards scans={scans} />

      {/* History */}
      <ScanHistory scans={scans.slice(0, 20)} onSelectScan={handleSelectScan} onDelete={async (id) => { await base44.entities.ScanResult.delete(id); loadScans(); }} />

      {/* Detail Modal */}
      <ScanResultModal
        scan={selectedScan}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
    </PullToRefresh>
  );
}
