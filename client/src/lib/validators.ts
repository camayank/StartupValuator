/**
 * Indian regulatory validators for frontend forms
 */

export function validateCIN(cin: string): boolean {
  // CIN format: L99999MH2020PTC999999
  // [Type][Industry Code][State][Year][Entity Type][Registration Number]
  const cinRegex = /^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;
  return cinRegex.test(cin);
}

export function validateGST(gst: string): boolean {
  // GST format: 22AAAAA0000A1Z5
  // [State Code(2)][PAN(10)][Entity Number][Z][Check Digit]
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
}

export function validatePAN(pan: string): boolean {
  // PAN format: AAAAA9999A
  // [5 letters][4 numbers][1 letter]
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
}

export function validateIndianPhone(phone: string): boolean {
  // Indian mobile: starts with 6-9, followed by 9 digits
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

export function validatePincode(pincode: string): boolean {
  // Indian pincode: 6 digits, first digit cannot be 0
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validation error messages
export const VALIDATION_MESSAGES = {
  CIN: 'Invalid CIN format. Expected: L99999MH2020PTC999999 (21 characters)',
  GST: 'Invalid GST number. Expected: 22AAAAA0000A1Z5 (15 characters)',
  PAN: 'Invalid PAN format. Expected: AAAAA9999A (10 characters)',
  PHONE: 'Invalid mobile number. Must start with 6-9 and have 10 digits',
  PINCODE: 'Invalid pincode. Must be 6 digits',
  EMAIL: 'Invalid email address',
} as const;
