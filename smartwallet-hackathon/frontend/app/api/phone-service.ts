'use client'

/**
 * Phone Verification Service
 * Handles phone number verification for user registration
 */

export interface PhoneVerificationResult {
  success: boolean;
  verificationId?: string;
  error?: string;
  mockCode?: string;
}

export interface VerifyCodeResult {
  success: boolean;
  isValid: boolean;
  error?: string;
}

export class PhoneVerificationService {
  private static instance: PhoneVerificationService;

  private constructor() {}

  public static getInstance(): PhoneVerificationService {
    if (!PhoneVerificationService.instance) {
      PhoneVerificationService.instance = new PhoneVerificationService();
    }
    return PhoneVerificationService.instance;
  }

  /**
   * Send verification code to phone number
   * In a real implementation, this would integrate with SMS providers like Twilio
   */
  async sendVerificationCode(phoneNumber: string): Promise<PhoneVerificationResult> {
    try {
      // Import locally to avoid SSR bundling issues
      const { normalizePhoneE164, isValidPhoneNumber } = await import('../lib/utils')
      const normalized = normalizePhoneE164(phoneNumber)
      if (!normalized || !isValidPhoneNumber(normalized)) {
        return { success: false, error: 'Enter phone in E.164 format, e.g. +15551234567' }
      }

      const res = await fetch('/api/phone/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalized }),
      })
      const data = await res.json()
      if (!res.ok || !data?.success) {
        return { success: false, error: data?.error || 'Failed to send verification code' }
      }
      return { success: true, verificationId: data.sid, mockCode: data.mockCode }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Failed to send verification code' }
    }
  }

  /**
   * Verify the code entered by user
   */
  async verifyCode(phoneNumber: string, code: string): Promise<VerifyCodeResult> {
    try {
      const { normalizePhoneE164, isValidPhoneNumber } = await import('../lib/utils')
      const normalized = normalizePhoneE164(phoneNumber)
      if (!normalized || !isValidPhoneNumber(normalized)) {
        return { success: false, isValid: false, error: 'Invalid phone format' }
      }

      const res = await fetch('/api/phone/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalized, code }),
      })
      const data = await res.json()
      if (!res.ok || !data?.success) {
        return { success: false, isValid: false, error: data?.error || 'Failed to verify code' }
      }
      return { success: true, isValid: Boolean(data.isValid) }
    } catch (error: any) {
      return { success: false, isValid: false, error: error?.message || 'Failed to verify code' }
    }
  }

  /**
   * Resend verification code
   */
  async resendVerificationCode(phoneNumber: string): Promise<PhoneVerificationResult> {
    return this.sendVerificationCode(phoneNumber)
  }

  /**
   * Clean up expired verification codes
   */
  private cleanupExpiredCodes(): void {}

  /**
   * Validate phone number format
   */
  private isValidPhoneNumber(phone: string): boolean {
    // Match UI validation in RegisterIdentifierModal
    const phoneRegex = /^(\+?\d{1,4}[-.\s]?)?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    return phoneRegex.test(phone.trim());
  }

  /**
   * Generate 6-digit verification code
   */
  private generateVerificationCode(): string { return '000000' }

  /**
   * Generate unique verification ID
   */
  private generateVerificationId(): string { return 'twilio' }
}

// Export singleton instance
export const phoneVerificationService = PhoneVerificationService.getInstance();
