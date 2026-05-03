import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Search, Trash2 } from 'lucide-react';
import PullToRefresh from '../components/PullToRefresh';
import { Button } from '@/components/ui/button';
import ScanHistory from '../components/ScanHistory';
import ScanResultModal from '../components/ScanResultModal';

export default function HistoryPage() {
  const [scans, setScans] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedScan, setSelectedScan] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadScans();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(scans);
    } else {
      const q = search.toLowerCase();
      setFiltered(scans.filter(s =>
        s.url?.toLowerCase().includes(q) ||
        s.domain?.toLowerCase().includes(q) ||
        s.risk_level?.toLowerCase().includes(q)
      ));
    }
  }, [search, scans]);

  const loadScans = async () => {
    const results = await base44.entities.ScanResult.list('-created_date', 200);
    setScans(results);
    setLoading(false);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Scan History</h1>
          <p className="text-sm text-muted-foreground mt-1">{scans.length} total scans recorded</p>
        </div>
        {scans.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={async () => {
              await Promise.all(scans.map(s => base44.entities.ScanResult.delete(s.id)));
              loadScans();
            }}
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by URL, domain, or risk level..."
          className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <ScanHistory
        scans={filtered}
        onSelectScan={handleSelectScan}
        onDelete={async (id) => { await base44.entities.ScanResult.delete(id); loadScans(); }}
      />

      <ScanResultModal
        scan={selectedScan}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
    </PullToRefresh>
  );
}
