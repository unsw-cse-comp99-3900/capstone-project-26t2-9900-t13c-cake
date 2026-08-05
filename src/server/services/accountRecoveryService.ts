import { adminAccountRepository } from "@/server/repositories/adminAccountRepository";
import { recoveryDeliveryService } from "@/server/services/recoveryDeliveryService";
import {
  generateOneTimeRecoveryCode,
  hashOneTimeRecoveryCode,
  isValidOneTimeRecoveryCode,
  RECOVERY_CODE_RESEND_SECONDS,
  RECOVERY_CODE_TTL_MINUTES,
} from "@/server/utils/recoveryCodeUtils";
import { normalizeBackupRecoveryCode } from "@/server/utils/backupRecoveryCodeUtils";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(2, local.length - visible.length))}@${domain}`;
}

/** Layer 3 — public password recovery via email OTP or backup code (CAKE-10). */
export const accountRecoveryService = {
  async getPublicOptions() {
    const [contacts, backupStatus] = await Promise.all([
      adminAccountRepository.getRecoveryContacts(),
      adminAccountRepository.getBackupRecoveryStatus(),
    ]);

    return {
      email:
        contacts?.email && recoveryDeliveryService.isConfigured()
          ? { available: true, masked: maskEmail(contacts.email) }
          : { available: false, masked: null },
      backupRecoveryCode: Boolean(backupStatus && !backupStatus.setupRequired),
    };
  },

  async requestCode(now = new Date()) {
    const state = await adminAccountRepository.getRecoveryRequestState();
    if (!state) {
      return { ok: false as const, error: "NOT_CONFIGURED" as const };
    }

    if (!recoveryDeliveryService.isConfigured()) {
      return { ok: false as const, error: "DELIVERY_NOT_CONFIGURED" as const };
    }

    const destination = state.contacts.email;
    if (!destination) {
      return { ok: false as const, error: "CONTACT_NOT_CONFIGURED" as const };
    }

    if (
      state.codeSentAt &&
      now.getTime() - state.codeSentAt.getTime() < RECOVERY_CODE_RESEND_SECONDS * 1000
    ) {
      const retryAfter = Math.ceil(
        RECOVERY_CODE_RESEND_SECONDS -
          (now.getTime() - state.codeSentAt.getTime()) / 1000,
      );
      return { ok: false as const, error: "RATE_LIMITED" as const, retryAfter };
    }

    const code = generateOneTimeRecoveryCode();
    try {
      await recoveryDeliveryService.sendEmail(destination, code);
    } catch (error) {
      console.error("[accountRecoveryService] email delivery failed:", error);
      return { ok: false as const, error: "DELIVERY_FAILED" as const };
    }

    const expiresAt = new Date(now.getTime() + RECOVERY_CODE_TTL_MINUTES * 60 * 1000);
    await adminAccountRepository.saveRecoveryCode(
      hashOneTimeRecoveryCode(code),
      expiresAt,
      now,
    );

    return {
      ok: true as const,
      maskedDestination: maskEmail(destination),
      expiresInMinutes: RECOVERY_CODE_TTL_MINUTES,
    };
  },

  async resetPassword(code: string, newUsername: string, newPassword: string) {
    if (!isValidOneTimeRecoveryCode(code)) {
      return { ok: false as const, error: "INVALID_RECOVERY_CODE" as const };
    }

    return adminAccountRepository.resetPasswordWithCode(
      hashOneTimeRecoveryCode(code),
      newUsername,
      newPassword,
    );
  },

  async verifyCode(code: string) {
    if (!isValidOneTimeRecoveryCode(code)) {
      return { ok: false as const, error: "INVALID_RECOVERY_CODE" as const };
    }

    return adminAccountRepository.verifyRecoveryCode(hashOneTimeRecoveryCode(code));
  },

  async resetPasswordWithBackupCode(
    code: string,
    newUsername: string,
    newPassword: string,
  ) {
    if (!normalizeBackupRecoveryCode(code)) {
      return { ok: false as const, error: "INVALID_RECOVERY_CODE" as const };
    }

    return adminAccountRepository.resetPasswordWithBackupRecoveryCode(
      code,
      newUsername,
      newPassword,
    );
  },
};
