import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/history', icon: History, label: 'History' },
];

export default function MobileNav() {
  // Bottom nav — safe area aware for Android/iOS notch/gesture bar
  const location = useLocation();

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-[60px] px-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground">ThreatSight</span>
        </div>
        <div className="flex gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-1.5 px-4 rounded-lg text-xs font-medium transition-all min-h-[44px]",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
