import ROIDashboard from '../../../../components/dashboard/ROIDashboard';

export const metadata = {
  title: 'Token Efficiency & ROI — Tokna',
};

export default function TokenEfficiency() {
  // Client component authenticates with the user's personal Tokna API key
  // (kept in the browser's localStorage); no server-side identity needed.
  return <ROIDashboard />;
}
