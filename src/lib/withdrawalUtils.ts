export interface WithdrawalCheckParams {
  mode: string; // 'MANUAL' | 'AUTOMATIC'
  type: 'AFFILIATE' | 'TASK';
  manualMasterOpen: boolean;
  manualPlanOpen: boolean;
  scheduledOpenDate?: Date | string | null;
  scheduledCloseDate?: Date | string | null;
}

export interface WithdrawalCheckResult {
  isOpen: boolean;
  reason?: string;
}

/**
 * Strictly evaluates whether a withdrawal portal is OPEN or CLOSED
 * based on Manual toggles or exact Automatic start/end schedule timestamps.
 */
export function isWithdrawalOpen(params: WithdrawalCheckParams): WithdrawalCheckResult {
  const {
    mode,
    type,
    manualMasterOpen,
    manualPlanOpen,
    scheduledOpenDate,
    scheduledCloseDate,
  } = params;

  const label = type === 'AFFILIATE' ? 'Affiliate' : 'Task / Non-Affiliate';

  // ===== MANUAL MODE =====
  if (mode === 'MANUAL') {
    if (!manualMasterOpen) {
      return {
        isOpen: false,
        reason: `${label} withdrawal portal is currently closed by the Administrator.`
      };
    }
    if (!manualPlanOpen) {
      return {
        isOpen: false,
        reason: `${label} withdrawals for your membership plan are currently disabled.`
      };
    }
    return { isOpen: true };
  }

  // ===== AUTOMATIC MODE (Strict Date/Time Compliance) =====
  if (mode === 'AUTOMATIC') {
    if (!manualPlanOpen) {
      return {
        isOpen: false,
        reason: `${label} withdrawals for your membership plan are currently disabled.`
      };
    }

    if (!scheduledOpenDate || !scheduledCloseDate) {
      return {
        isOpen: false,
        reason: `No automatic withdrawal schedule has been configured for ${label} earnings.`
      };
    }

    const now = new Date();
    const openTime = new Date(scheduledOpenDate);
    const closeTime = new Date(scheduledCloseDate);

    if (isNaN(openTime.getTime()) || isNaN(closeTime.getTime())) {
      return {
        isOpen: false,
        reason: `Invalid automatic schedule dates configured.`
      };
    }

    // Strict compliance: Open time not reached yet
    if (now < openTime) {
      const formattedOpen = openTime.toLocaleString('en-NG', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      return {
        isOpen: false,
        reason: `${label} withdrawals are scheduled to open on ${formattedOpen}.`
      };
    }

    // Strict compliance: Closing time reached or elapsed -> IMMEDIATELY CLOSE
    if (now > closeTime) {
      const formattedClose = closeTime.toLocaleString('en-NG', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      return {
        isOpen: false,
        reason: `${label} withdrawal window closed on ${formattedClose}.`
      };
    }

    // Currently inside open schedule window
    return { isOpen: true };
  }

  return { isOpen: false, reason: 'Withdrawal portal mode is invalid.' };
}
