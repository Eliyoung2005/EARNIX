import { prisma } from './prisma';

export function isReferrerEligible(referrerPlanName: string, referredPlanName: string): boolean {
  const refUpper = referrerPlanName.toUpperCase();
  const targetUpper = referredPlanName.toUpperCase();
  
  if (refUpper === 'FREE') return false;
  if (targetUpper === 'FREE') return false;
  
  if (refUpper === 'ELITE') {
    // ELITE is eligible for all plans (PRO, VIP, ELITE) except FREE
    return true;
  }
  if (refUpper === 'VIP') {
    // VIP can get referral bonus of those below it (PRO) and VIP itself
    return targetUpper === 'PRO' || targetUpper === 'VIP';
  }
  if (refUpper === 'PRO') {
    // PRO can only receive rewards from PRO plan
    return targetUpper === 'PRO';
  }
  return false;
}

/**
 * 1. Called when a referred user (referredId) upgrades their plan to a new plan.
 * If their referrer is currently eligible for the new plan's referral commission,
 * pay the referrer immediately and mark the plan as paid in Referral record.
 * Also pays any lower level plans they might have missed and are now eligible for.
 */
export async function handleReferredUserUpgrade(referredId: string, newPlanId: string, tx?: any) {
  const db = tx || prisma;
  
  // Find referral record
  const referral = await db.referral.findUnique({
    where: { referredId },
    include: {
      referrer: { include: { membership: true } },
      referred: true
    }
  });

  if (!referral) return;

  const referrer = referral.referrer;
  const newPlan = await db.membershipPlan.findUnique({ where: { id: newPlanId } });
  if (!newPlan || newPlan.name === 'FREE') return;

  const referrerPlanName = referrer.membership?.name || 'FREE';

  // Fetch all active plans with level <= newPlan.level
  const eligiblePlans = await db.membershipPlan.findMany({
    where: {
      isActive: true,
      price: { gt: 0 },
      level: { lte: newPlan.level }
    },
    orderBy: { level: 'asc' }
  });

  const updatedPaidPlans = [...referral.paidPlanNames];

  for (const plan of eligiblePlans) {
    const isEligible = isReferrerEligible(referrerPlanName, plan.name);
    const alreadyPaid = updatedPaidPlans.includes(plan.name);

    if (isEligible && !alreadyPaid && plan.referralCommission > 0) {
      const commission = plan.referralCommission;
      
      // Credit referrer
      await db.user.update({
        where: { id: referrer.id },
        data: {
          affiliateBalance: { increment: commission }
        }
      });

      // Track locally
      updatedPaidPlans.push(plan.name);

      // Log activity
      await db.activityLog.create({
        data: {
          action: 'REFERRAL_BONUS',
          description: `Received ₦${commission.toLocaleString()} referral commission for ${referral.referred.username}'s upgrade to ${plan.name}`,
          userId: referrer.id
        }
      });
    }
  }

  // Save updated paid plan list if changed
  if (updatedPaidPlans.length !== referral.paidPlanNames.length) {
    await db.referral.update({
      where: { id: referral.id },
      data: {
        paidPlanNames: updatedPaidPlans
      }
    });
  }
}

/**
 * 2. Called when a user (referrerId) upgrades their own plan.
 * Scan all their referred users, check if there are plan commissions (for their current or lower plans)
 * that they are now eligible for, but haven't been paid yet.
 * Pay them and update Referral records.
 */
export async function handleReferrerUpgrade(referrerId: string, tx?: any) {
  const db = tx || prisma;

  // Get referrer details
  const referrer = await db.user.findUnique({
    where: { id: referrerId },
    include: { membership: true }
  });

  if (!referrer || !referrer.membership) return;
  const referrerPlanName = referrer.membership.name;
  if (referrerPlanName === 'FREE') return;

  // Find all referrals sent by this user
  const referrals = await db.referral.findMany({
    where: { referrerId },
    include: {
      referred: { include: { membership: true } }
    }
  });

  for (const referral of referrals) {
    const referredUser = referral.referred;
    if (!referredUser.membership || referredUser.membership.name === 'FREE') continue;

    const referredPlan = referredUser.membership;

    // Fetch all active plans with level <= referredPlan.level
    const eligiblePlans = await db.membershipPlan.findMany({
      where: {
        isActive: true,
        price: { gt: 0 },
        level: { lte: referredPlan.level }
      },
      orderBy: { level: 'asc' }
    });

    const updatedPaidPlans = [...referral.paidPlanNames];

    for (const plan of eligiblePlans) {
      const isEligible = isReferrerEligible(referrerPlanName, plan.name);
      const alreadyPaid = updatedPaidPlans.includes(plan.name);

      if (isEligible && !alreadyPaid && plan.referralCommission > 0) {
        const commission = plan.referralCommission;

        // Credit referrer
        await db.user.update({
          where: { id: referrerId },
          data: {
            affiliateBalance: { increment: commission }
          }
        });

        // Track locally
        updatedPaidPlans.push(plan.name);

        // Log activity
        await db.activityLog.create({
          data: {
            action: 'REFERRAL_BONUS',
            description: `Received ₦${commission.toLocaleString()} pending referral commission for ${referredUser.username} (${plan.name}) after upgrading your plan`,
            userId: referrerId
          }
        });
      }
    }

    // Save updated paid plan list if changed
    if (updatedPaidPlans.length !== referral.paidPlanNames.length) {
      await db.referral.update({
        where: { id: referral.id },
        data: {
          paidPlanNames: updatedPaidPlans
        }
      });
    }
  }
}
