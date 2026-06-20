import ROIDashboard from '../../../../components/dashboard/ROIDashboard';

export const metadata = {
  title: 'Token Efficiency & ROI — Tokna',
};

export default function TokenEfficiency() {
  // Server component: pass null for userEmail — the client component
  // will use 'nroan28@gmail.com' as fallback during this verification phase.
  return <ROIDashboard userEmail="nroan28@gmail.com" />;
}
