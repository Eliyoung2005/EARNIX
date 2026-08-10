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
 * 
 * If Level 2 and Level 3 referrers are ELITE plan, they will also earn indirect commissions.
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
  console.log('handleReferredUserUpgrade - newPlan:', newPlan);
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
  console.log('handleReferredUserUpgrade - eligiblePlans:', eligiblePlans.map((p: any) => ({ name: p.name, level: p.level })));

  const updatedPaidPlans = [...(referral.paidPlanNames || [])];
  const updatedPaidPlansL2 = [...(referral.paidPlanNamesL2 || [])];
  const updatedPaidPlansL3 = [...(referral.paidPlanNamesL3 || [])];

  // 1. Direct Referrer (Level 1)
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

  // Find Level 2 and Level 3 referrers
  const referralL2 = await db.referral.findUnique({
    where: { referredId: referrer.id },
    include: {
      referrer: { include: { membership: true } }
    }
  });
  const refL2 = referralL2?.referrer || null;

  let refL3 = null;
  if (refL2) {
    const referralL3 = await db.referral.findUnique({
      where: { referredId: refL2.id },
      include: {
        referrer: { include: { membership: true } }
      }
    });
    refL3 = referralL3?.referrer || null;
  }

  // Get settings for L2/L3 percentages
  const settings = await db.platformSettings.findFirst();
  const l2Percent = settings?.eliteTier2CommissionPercent || 5.0;
  const l3Percent = settings?.eliteTier3CommissionPercent || 2.0;

  // 2. Level 2 Referrer (must be ELITE)
  if (refL2 && refL2.membership?.name === 'ELITE') {
    for (const plan of eligiblePlans) {
      const alreadyPaid = updatedPaidPlansL2.includes(plan.name);
      if (!alreadyPaid && plan.price > 0) {
        const commission = plan.price * (l2Percent / 100);
        if (commission > 0) {
          await db.user.update({
            where: { id: refL2.id },
            data: { affiliateBalance: { increment: commission } }
          });
          updatedPaidPlansL2.push(plan.name);
          await db.activityLog.create({
            data: {
              action: 'REFERRAL_BONUS',
              description: `Received ₦${commission.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} Level 2 commission for ${referral.referred.username}'s upgrade to ${plan.name}`,
              userId: refL2.id
            }
          });
        }
      }
    }
  }

  // 3. Level 3 Referrer (must be ELITE)
  if (refL3 && refL3.membership?.name === 'ELITE') {
    for (const plan of eligiblePlans) {
      const alreadyPaid = updatedPaidPlansL3.includes(plan.name);
      if (!alreadyPaid && plan.price > 0) {
        const commission = plan.price * (l3Percent / 100);
        if (commission > 0) {
          await db.user.update({
            where: { id: refL3.id },
            data: { affiliateBalance: { increment: commission } }
          });
          updatedPaidPlansL3.push(plan.name);
          await db.activityLog.create({
            data: {
              action: 'REFERRAL_BONUS',
              description: `Received ₦${commission.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} Level 3 commission for ${referral.referred.username}'s upgrade to ${plan.name}`,
              userId: refL3.id
            }
          });
        }
      }
    }
  }

  // Save updated paid plan list if changed
  await db.referral.update({
    where: { id: referral.id },
    data: {
      paidPlanNames: updatedPaidPlans,
      paidPlanNamesL2: updatedPaidPlansL2,
      paidPlanNamesL3: updatedPaidPlansL3
    }
  });
}

/**
 * 2. Called when a user (referrerId) upgrades their own plan.
 * Scan all their referred users, check if there are plan commissions (for their current or lower plans)
 * that they are now eligible for, but haven't been paid yet.
 * Pay them and update Referral records.
 * 
 * Also handles retro-payouts for Level 2 and Level 3 if they upgraded to ELITE.
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

  const isElite = referrerPlanName === 'ELITE';

  // 1. Direct referrals (Level 1)
  const referralsL1 = await db.referral.findMany({
    where: { referrerId },
    include: {
      referred: { include: { membership: true } }
    }
  });

  for (const referral of referralsL1) {
    const referredUser = referral.referred;
    if (!referredUser.membership || referredUser.membership.name === 'FREE') continue;

    const referredPlan = referredUser.membership;

    const eligiblePlans = await db.membershipPlan.findMany({
      where: {
        isActive: true,
        price: { gt: 0 },
        level: { lte: referredPlan.level }
      },
      orderBy: { level: 'asc' }
    });

    const updatedPaidPlans = [...(referral.paidPlanNames || [])];

    for (const plan of eligiblePlans) {
      const isEligible = isReferrerEligible(referrerPlanName, plan.name);
      const alreadyPaid = updatedPaidPlans.includes(plan.name);

      if (isEligible && !alreadyPaid && plan.referralCommission > 0) {
        const commission = plan.referralCommission;
        await db.user.update({
          where: { id: referrerId },
          data: { affiliateBalance: { increment: commission } }
        });
        updatedPaidPlans.push(plan.name);
        await db.activityLog.create({
          data: {
            action: 'REFERRAL_BONUS',
            description: `Received ₦${commission.toLocaleString()} pending referral commission for ${referredUser.username} (${plan.name}) after upgrading your plan`,
            userId: referrerId
          }
        });
      }
    }

    await db.referral.update({
      where: { id: referral.id },
      data: { paidPlanNames: updatedPaidPlans }
    });
  }

  // 2. Downstream Level 2 and Level 3 referrals (Only if newly upgraded to ELITE)
  if (isElite) {
    const settings = await db.platformSettings.findFirst();
    const l2Percent = settings?.eliteTier2CommissionPercent || 5.0;
    const l3Percent = settings?.eliteTier3CommissionPercent || 2.0;

    // A: For Level 2 (B -> C -> D, where referrer is B, C's referrals D)
    // Find C (Level 1 referred by B)
    for (const refL1 of referralsL1) {
      const referralsL2 = await db.referral.findMany({
        where: { referrerId: refL1.referredId },
        include: {
          referred: { include: { membership: true } }
        }
      });

      // D is referred by C
      for (const referralD of referralsL2) {
        const userD = referralD.referred;
        if (!userD.membership || userD.membership.name === 'FREE') continue;

        const eligiblePlans = await db.membershipPlan.findMany({
          where: { isActive: true, price: { gt: 0 }, level: { lte: userD.membership.level } },
          orderBy: { level: 'asc' }
        });

        const updatedPaidPlansL2 = [...(referralD.paidPlanNamesL2 || [])];

        for (const plan of eligiblePlans) {
          const alreadyPaid = updatedPaidPlansL2.includes(plan.name);
          if (!alreadyPaid && plan.price > 0) {
            const commission = plan.price * (l2Percent / 100);
            if (commission > 0) {
              await db.user.update({
                where: { id: referrerId },
                data: { affiliateBalance: { increment: commission } }
              });
              updatedPaidPlansL2.push(plan.name);
              await db.activityLog.create({
                data: {
                  action: 'REFERRAL_BONUS',
                  description: `Received ₦${commission.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} Level 2 commission for ${userD.username} (${plan.name}) after upgrading to ELITE`,
                  userId: referrerId
                }
              });
            }
          }
        }

        await db.referral.update({
          where: { id: referralD.id },
          data: { paidPlanNamesL2: updatedPaidPlansL2 }
        });
      }

      // B: For Level 3 (B -> C -> D -> E, where referrer is B, D's referrals E)
      for (const refL2 of referralsL2) {
        const referralsL3 = await db.referral.findMany({
          where: { referrerId: refL2.referredId },
          include: {
            referred: { include: { membership: true } }
          }
        });

        // E is referred by D
        for (const referralE of referralsL3) {
          const userE = referralE.referred;
          if (!userE.membership || userE.membership.name === 'FREE') continue;

          const eligiblePlans = await db.membershipPlan.findMany({
            where: { isActive: true, price: { gt: 0 }, level: { lte: userE.membership.level } },
            orderBy: { level: 'asc' }
          });

          const updatedPaidPlansL3 = [...(referralE.paidPlanNamesL3 || [])];

          for (const plan of eligiblePlans) {
            const alreadyPaid = updatedPaidPlansL3.includes(plan.name);
            if (!alreadyPaid && plan.price > 0) {
              const commission = plan.price * (l3Percent / 100);
              if (commission > 0) {
                await db.user.update({
                  where: { id: referrerId },
                  data: { affiliateBalance: { increment: commission } }
                });
                updatedPaidPlansL3.push(plan.name);
                await db.activityLog.create({
                  data: {
                    action: 'REFERRAL_BONUS',
                    description: `Received ₦${commission.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} Level 3 commission for ${userE.username} (${plan.name}) after upgrading to ELITE`,
                    userId: referrerId
                  }
                });
              }
            }
          }

          await db.referral.update({
            where: { id: referralE.id },
            data: { paidPlanNamesL3: updatedPaidPlansL3 }
          });
        }
      }
    }
  }
}
