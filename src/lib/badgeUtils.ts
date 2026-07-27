export const getBadgeProps = (plan: string = 'FREE') => {
  const upperPlan = (plan || 'FREE').toUpperCase();
  if (upperPlan === 'FREE') return { bg: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)', icon: null };
  if (upperPlan === 'PRO') return { bg: 'var(--accent-gold)', color: '#000', icon: '★' };
  if (upperPlan === 'VIP') return { bg: '#9333ea', color: '#fff', icon: '👑' };
  if (upperPlan === 'ELITE') return { bg: '#06b6d4', color: '#000', icon: '💎' };
  return { bg: 'var(--accent-blue)', color: '#fff', icon: '✓' };
};
