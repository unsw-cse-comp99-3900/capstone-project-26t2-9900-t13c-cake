import { adminAccountRepository } from "@/server/repositories/adminAccountRepository";
import {
  generateBackupRecoveryCode,
  hashBackupRecoveryCode,
} from "@/server/utils/backupRecoveryCodeUtils";

/** Layer 3 — post-login backup recovery code setup and confirmation (CAKE-10). */
export const backupRecoveryService = {
  async getStatus() {
    return adminAccountRepository.getBackupRecoveryStatus();
  },

  async generate(now = new Date()) {
    const recoveryCode = generateBackupRecoveryCode();
    await adminAccountRepository.saveBackupRecoveryCode(
      hashBackupRecoveryCode(recoveryCode),
      now,
    );

    return {
      recoveryCode,
      createdAt: now.toISOString(),
    };
  },

  async confirm(createdAt: string) {
    const parsedCreatedAt = new Date(createdAt);
    if (Number.isNaN(parsedCreatedAt.getTime())) {
      return { ok: false as const, error: "RECOVERY_CODE_UNAVAILABLE" as const };
    }

    return adminAccountRepository.confirmBackupRecoveryCode(parsedCreatedAt);
  },
};
