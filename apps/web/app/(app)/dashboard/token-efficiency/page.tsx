import ROIDashboard from '../../../../components/dashboard/ROIDashboard';

export const metadata = {
  title: 'Token Efficiency & ROI — Tokna',
};

export default function TokenEfficiency() {
  // Server component: pass null for userEmail — the client component
  // will use 'demo@tokna.ai' as fallback (Firebase Auth not yet integrated server-side).
  // When Firebase client auth is wired up, pass user.email here.
  return <ROIDashboard userEmail={null} />;
}
