const { create } = require('xmlbuilder2');
const validateUccData = require('../../utils/validateUccData');

  function escapeXml(str) {
    if (typeof str !== 'string') return '';
    return str?.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&apos;')
              .replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD]/g, ''); 
  }

  function addNameElement(namesElement, nameData) {
    if (nameData.orgName) {
        namesElement.ele('OrganizationName').txt(escapeXml(nameData.orgName)).up();
    }
    if (nameData.individualName) {
        const individualName = namesElement.ele('IndividualName');
        individualName.ele('Surname').txt(escapeXml(nameData.individualName.surname)).up();
        if (nameData.individualName.firstPersonalName) {
            individualName.ele('FirstPersonalName').txt(escapeXml(nameData.individualName.firstPersonalName)).up();
        }
        if (nameData.individualName.additionalNamesInitials) {
            individualName.ele('AdditionalNamesInitials').txt(escapeXml(nameData.individualName.additionalNamesInitials)).up();
        }
        if (nameData.individualName.suffix) {
            individualName.ele('Suffix').txt(escapeXml(nameData.individualName.suffix)).up();
        }
    }
  }

module.exports = {
  friendlyName: 'Generate xml',

  inputs: {
    data: {
      type: 'ref',
      required: true,
    },
  },

  exits: {
    success: { description: 'XML generated successfully',},
    tooLarge: { description: 'XML exceeds allowed size limit'}
  },

  fn: async function (inputs, exits) {
    const data = inputs.data;
    const errors = validateUccData(data);
    if (errors.length > 0) {
      return exits.success({ success: false, message: 'Validation failed.', errors, });
    }

    const doc = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('Document')
        .ele('XMLVersion').att('Version', '08172001').up();

    // === HEADER ===
    const header = doc.ele('Header');
    header.ele('FID').txt(data.FID || '0').up();

    const filer = header.ele('Filer');
    const names = filer.ele('Names');
    
     addNameElement(names, data.filer);
     filer.up();

    filer.ele('MailAddress').txt(escapeXml(data.filer.mailAddress)).up();
    if (data.filer.mailAddress2) {
      filer.ele('MailAddress2').txt(escapeXml(data.filer.mailAddress2)).up();
    }
    if (data.filer.country !== 'USA' && data.filer.mailAddress3) {
      filer.ele('MailAddress3').txt(escapeXml(data.filer.mailAddress3)).up();
    }

    filer.ele('City').txt(escapeXml(data.filer.city)).up();
    filer.ele('State').txt(data.filer.state).up();
    filer.ele('PostalCode').txt(data.filer.postalCode).up();
    filer.ele('Country').txt(data.filer.country).up();
    filer.ele('ClientAccountNum').txt(data.filer.clientAccountNum).up();
    filer.ele('ContactName').txt(escapeXml(data.filer.contactName)).up();
    filer.ele('ContactPhone').txt(data.filer.contactPhone).up();
    filer.ele('ContactEmail').txt(data.filer.contactEmail).up();
    filer.up();

    header.ele('PacketNum').txt(escapeXml(data.header.packetNum)).up();
    header.up();

    // === RECORD ===
    const record = doc.ele('Record');

    record.ele('SeqNumber').txt(data.record.seqNumber).up();
    record.ele('TransType').att('Type', data.record.transType).up();

    // Optional Amendment fields
    if (data.record.transType === 'Amendment') {
      record.ele('AmendmentType').att('Type', data.record.amendmentType || 'NOType').up();
      record.ele('AmendmentAction').att('Action', data.record.amendmentAction || 'NOAction').up();
      if (data.record.initialFileNumber) {
        record.ele('InitialFileNumber').txt(data.record.initialFileNumber).up();
      }
    }

    record.ele('OptionalFilerReference').txt(escapeXml(data.record.filerRef)).up();

    // Optional Indicators
    if (Array.isArray(data.record.optionalIndicators)) {
      const indicators = record.ele('OptionalIndicators');
      data.record.optionalIndicators.forEach(ind =>
        indicators.ele('OptionalIndicator').att('Type', ind).up()
      );
      indicators.up();
    }

    // === DEBTORS ===
    const debtor = record.ele('Debtors').ele('DebtorName').ele('Names');
    addNameElement(debtor, data.record.debtor);
    debtor.up().up().up();

    // === SECURED PARTIES ===
    const secured = record.ele('SecuredParties').ele('SecuredName').ele('Names');
    addNameElement(secured, data.record.secured);
    secured.up().up().up();

    // === COLLATERAL ===
    if (data.record.collateralText) {
      record.ele('Collateral').ele('ColText').txt(escapeXml(data.record.collateralText)).up().up();
    }

    // === DESIGNATION ===
    record.ele('CollateralDesignation').att('Type', 'NODesignation').up();
    if (data.record.authorizingParty) {
      const auth = record.ele('AuthorizingParty');
      if (data.record.authorizingParty.type === 'secured') {
        const authName = auth.ele('AuthSecuredParty').ele('Names');
        addNameElement(authName, data.record.authorizingParty);
        authName.up().up();
      } else if (data.record.authorizingParty.type === 'debtor') {
        const authName = auth.ele('AuthDebtor').ele('Names');
        addNameElement(authName, data.record.authorizingParty);
        authName.up().up();
      }
    }
    // === OUTPUT ===
    const xml = doc.end({ prettyPrint: true });
    const xmlSize = Buffer.byteLength(xml, 'utf8');
    if (xmlSize > 10485760) {
      return exits.tooLarge();
    }
    const xmlBase64 = Buffer.from(xml).toString('base64');

    return exits.success({
      success:true,
      xml,
      xmlBase64
    });
  }
};
