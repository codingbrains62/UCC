    function validateUccData(data) {
        const errors = [];
          function validateNameSection(entity, label) {
              if (!entity.orgName && !entity.individualName) {
              errors.push(`${label}: Either OrganizationName or IndividualName is required.`);
            }
            if (entity.orgName && entity.individualName) {
              errors.push(`${label}: If OrganizationName is provided, IndividualName must be blank.`);
            }
            if (entity.orgName && entity.orgName.length > 300) {
              errors.push(`${label} OrganizationName cannot exceed 300 characters.`);
            }
            if (entity.individualName) {
              const { surname, firstPersonalName, additionalNamesInitials, suffix } = entity.individualName;
              if (!surname) errors.push(`${label} IndividualName Surname is required.`);
              if (surname?.length > 100) errors.push(`${label} IndividualName Surname max 100 chars.`);
              if (firstPersonalName?.length > 100) errors.push(`${label} FirstPersonalName max 100 chars.`);
              if (additionalNamesInitials?.length > 60) errors.push(`${label} AdditionalNamesInitials max 60 chars.`);
              if (suffix?.length > 40) errors.push(`${label} Suffix max 40 chars.`);
              }
          }

          function validateAddressSection(entity, label) {
            if (!entity.mailAddress || entity.mailAddress.length > 150)
              errors.push(`${label} MailAddress is required and must not exceed 150 characters.`);
            if (entity.mailAddress2 && entity.mailAddress2.length > 150)
              errors.push(`${label} MailAddress2 must not exceed 150 characters.`);
            if (!entity.city || entity.city.length > 100)
              errors.push(`${label} City is required and must not exceed 100 characters.`);
            if (!entity.state || !/^[A-Z]{2}$/.test(entity.state))
              errors.push(`${label} State must be exactly 2 uppercase letters.`);
            if (!entity.postalCode || entity.postalCode.length > 9)
              errors.push(`${label} PostalCode is required and must not exceed 9 characters.`);
            if (!entity.country || entity.country.length !== 3)
              errors.push(`${label} Country must be a 3-letter ISO code.`);
            if (entity.country !== 'USA' && !entity.mailAddress3)
              errors.push(`${label} MailAddress3 is required for non-USA addresses.`);
          }

          validateNameSection(data.filer, 'Filer');
          validateAddressSection(data.filer, 'Filer');

        // Filer validations
       
        if (!/^\d{7}$/.test(data.filer.clientAccountNum)) {
          errors.push('ClientAccountNum must be a 7-digit number.');
        }
      
        if (!data.filer.contactName || data.filer.contactName.length > 35)
          errors.push('Filer ContactName is required and max 35 characters.');
        if (!data.filer.contactPhone || data.filer.contactPhone.length > 12)
          errors.push('Filer ContactPhone is required and max 12 characters.');
        if (!data.filer.contactEmail || !data.filer.contactEmail.includes('@') || data.filer.contactEmail.length > 254)
          errors.push('Filer ContactEmail is required and must be a valid email.');
        if (!data.header?.packetNum || data.header.packetNum.length > 32)
          errors.push('PacketNum is required and must not exceed 32 characters.');

        // Debtor validations
        const debtor = data.record?.debtor || {};
        validateNameSection(debtor, 'Debtor');
        validateAddressSection(debtor, 'Debtor');
       
        // Secured party validations
        const secured = data.record?.secured || {};
        validateNameSection(secured, 'Secured');
        validateAddressSection(secured, 'Secured');

        // === Record Type Specific ===
        if (!data.record?.seqNumber || data.record.seqNumber.length > 5 || !/^\d+$/.test(data.record.seqNumber)) {
          errors.push('SeqNumber is required, must be numeric and max 5 digits.');
        }
        if (!data.record?.transType || !['Initial', 'Amendment'].includes(data.record.transType)) {
          errors.push('TransType must be either Initial or Amendment.');
        }
       
         if (data.record.transType === 'Amendment') {
            if (!data.record.amendmentType) errors.push('AmendmentType is required for Amendment transactions.');
            if (!data.record.amendmentAction) errors.push('AmendmentAction is required for Amendment transactions.');
            if (!data.record.initialFileNumber || data.record.initialFileNumber.length > 100)
              errors.push('InitialFileNumber is required for Amendment and max 100 characters.');
          }
          if (!data.record?.filerRef || data.record.filerRef.length > 80) {
            errors.push('Filer Reference is required and must not exceed 80 characters.');
          }
          if (data.record.collateralText && data.record.collateralText.length > 10000) {
            errors.push('Collateral text must not exceed 10000 characters.');
          }
        
          // === Authorizing Party ===
          const auth = data.record?.authorizingParty;
          if (auth) {
            validateNameSection(auth, 'AuthorizingParty');
          }
      
        return errors;
      }
      
      module.exports = validateUccData;
      