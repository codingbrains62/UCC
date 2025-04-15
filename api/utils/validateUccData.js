function validateUccData(data) {
    const errors = [];
  
    // Filer validations
    if (!data.filer.orgName) errors.push('Filer Organization Name is required.');
    if (!data.filer.mailAddress) errors.push('Filer MailAddress is required.');
    if (!data.filer.city) errors.push('Filer City is required.');
    if (!data.filer.state || data.filer.state.length !== 2 || /[^A-Z]/.test(data.filer.state)) {
      errors.push('Filer State must be exactly 2 uppercase letters.');
    }
    if (!data.filer.postalCode || data.filer.postalCode.length > 9) {
      errors.push('Filer PostalCode must be 9 characters or less.');
    }
    if (!data.filer.country || data.filer.country.length !== 3) {
      errors.push('Filer Country must be a 3-letter ISO code.');
    }
    if (!/^\d{7}$/.test(data.filer.clientAccountNum)) {
      errors.push('ClientAccountNum must be a 7-digit number.');
    }
  
    if (!data.filer.contactName) errors.push('Filer ContactName is required.');
    if (!data.filer.contactPhone) errors.push('Filer ContactPhone is required.');
    if (!data.filer.contactEmail || !data.filer.contactEmail.includes('@')) {
      errors.push('Filer ContactEmail is invalid.');
    }
  
    // Debtor validations
    const debtor = data.record?.debtor || {};
    if (!debtor.orgName) errors.push('Debtor Organization Name is required.');
    if (!debtor.mailAddress) errors.push('Debtor MailAddress is required.');
    if (!debtor.city) errors.push('Debtor City is required.');
    if (!debtor.state || debtor.state.length !== 2 || /[^A-Z]/.test(debtor.state)) {
      errors.push('Debtor State must be exactly 2 uppercase letters.');
    }
    if (!debtor.postalCode || debtor.postalCode.length > 9) {
      errors.push('Debtor PostalCode must be 9 characters or less.');
    }
    if (!debtor.country || debtor.country.length !== 3) {
      errors.push('Debtor Country must be a 3-letter ISO code.');
    }
  
    // Secured party validations
    const secured = data.record?.secured || {};
    if (!secured.orgName) errors.push('Secured Organization Name is required.');
    if (!secured.mailAddress) errors.push('Secured MailAddress is required.');
    if (!secured.city) errors.push('Secured City is required.');
    if (!secured.state || secured.state.length !== 2 || /[^A-Z]/.test(secured.state)) {
      errors.push('Secured State must be exactly 2 uppercase letters.');
    }
    if (!secured.postalCode || secured.postalCode.length > 9) {
      errors.push('Secured PostalCode must be 9 characters or less.');
    }
    if (!secured.country || secured.country.length !== 3) {
      errors.push('Secured Country must be a 3-letter ISO code.');
    }
  
    return errors;
  }
  
  module.exports = validateUccData;
  