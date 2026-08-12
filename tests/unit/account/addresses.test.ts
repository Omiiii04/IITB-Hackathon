import { describe, it, expect } from 'vitest';
import { addressInputSchema } from '@/modules/account/schemas';

describe('Address API Input Schema Validation', () => {
  it('validates a complete valid address input payload', () => {
    const payload = {
      recipientName: 'Somnath Bhatia',
      line1: 'Flat 302, Green View Apartments',
      line2: 'Near City Mall',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
      phone: '9876543210',
      isDefault: true,
    };

    const result = addressInputSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.recipientName).toBe('Somnath Bhatia');
      expect(result.data.postalCode).toBe('400001');
      expect(result.data.isDefault).toBe(true);
    }
  });

  it('accepts valid input without optional line2 and defaults country to India', () => {
    const payload = {
      recipientName: 'Anita Sharma',
      line1: '12-A Industrial Area',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411001',
      phone: '9822012345',
    };

    const result = addressInputSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.country).toBe('India');
      expect(result.data.isDefault).toBe(false);
      expect(result.data.line2).toBeUndefined();
    }
  });

  it('rejects empty recipientName or line1', () => {
    const invalidName = {
      recipientName: '   ',
      line1: 'Valid Line 1',
      city: 'Delhi',
      state: 'Delhi',
      postalCode: '110001',
      phone: '9876543210',
    };
    expect(addressInputSchema.safeParse(invalidName).success).toBe(false);

    const invalidLine1 = {
      recipientName: 'Valid Name',
      line1: '',
      city: 'Delhi',
      state: 'Delhi',
      postalCode: '110001',
      phone: '9876543210',
    };
    expect(addressInputSchema.safeParse(invalidLine1).success).toBe(false);
  });

  it('rejects missing city or state', () => {
    const invalidCity = {
      recipientName: 'Valid Name',
      line1: 'Valid Line 1',
      city: '',
      state: 'Maharashtra',
      postalCode: '400001',
      phone: '9876543210',
    };
    expect(addressInputSchema.safeParse(invalidCity).success).toBe(false);

    const invalidState = {
      recipientName: 'Valid Name',
      line1: 'Valid Line 1',
      city: 'Mumbai',
      state: '   ',
      postalCode: '400001',
      phone: '9876543210',
    };
    expect(addressInputSchema.safeParse(invalidState).success).toBe(false);
  });

  it('trims leading and trailing whitespace from string fields', () => {
    const payload = {
      recipientName: '  John Doe  ',
      line1: '  123 Main St  ',
      city: '  Bangalore  ',
      state: '  Karnataka  ',
      postalCode: '  560001  ',
      phone: '  9876543210  ',
    };

    const result = addressInputSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.recipientName).toBe('John Doe');
      expect(result.data.city).toBe('Bangalore');
      expect(result.data.postalCode).toBe('560001');
    }
  });
});
