import React from 'react';
import { Star, Crown, Gem, Check } from 'lucide-react';

export const getBadgeProps = (plan: string = 'FREE') => {
  const upperPlan = (plan || 'FREE').toUpperCase();
  if (upperPlan === 'FREE') return { bg: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)', icon: null };
  if (upperPlan === 'PRO') return { bg: 'var(--accent-gold)', color: '#000', icon: React.createElement(Star, { size: 10, fill: 'currentColor' }) };
  if (upperPlan === 'VIP') return { bg: '#9333ea', color: '#fff', icon: React.createElement(Crown, { size: 10, fill: 'currentColor' }) };
  if (upperPlan === 'ELITE') return { bg: '#06b6d4', color: '#000', icon: React.createElement(Gem, { size: 10, fill: 'currentColor' }) };
  return { bg: 'var(--accent-blue)', color: '#fff', icon: React.createElement(Check, { size: 10 }) };
};
