import { useState } from 'react';
import { Search, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScannerInput({ onScan, isScanning }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const validateUrl = (input) => {
    if (!input.trim()) return 'Please enter a URL to scan';
    try {
      const urlObj = new URL(input.startsWith('http') ? input : `https://${input}`);
      if (!urlObj.hostname.includes('.')) return 'Invalid URL format';
      return null;
    } catch {
      return 'Invalid URL format';
    }
  };

  const handleScan = () => {
    const validationError = validateUrl(url);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    onScan(normalizedUrl);
  };

  return (
    <div className="w-full">
      <div className="relative group">
        {/* Glow effect behind input */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        
        <div className="relative flex items-center gap-2 bg-card border border-border rounded-2xl p-2 focus-within:border-primary/50 transition-colors duration-300">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && !isScanning && handleScan()}
            placeholder="Enter suspicious URL to analyze..."
            className="flex-1 bg-transparent text-foreground font-mono text-sm placeholder:text-muted-foreground focus:outline-none px-2"
            disabled={isScanning}
          />
          
          <Button
            onClick={handleScan}
            disabled={isScanning || !url.trim()}
            className="h-10 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm transition-all duration-300"
          >
            {isScanning ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            {isScanning ? 'Scanning...' : 'Analyze'}
          </Button>
        </div>
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-destructive text-xs mt-2 ml-4 font-mono"
          >
            ⚠ {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
