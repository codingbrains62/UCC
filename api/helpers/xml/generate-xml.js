const { create } = require('xmlbuilder2');

module.exports = {
  friendlyName: 'Generate xml',

  inputs: {
    data: {
      type: 'ref',
      required: true,
    },
  },

  exits: {
    success: {
      description: 'XML generated successfully',
    },
  },

  fn: async function (inputs) {
    const data = inputs.data;

    const doc = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('Document')
        .ele('XMLVersion').att('Version', '08172001').up();

    // === HEADER ===
    const header = doc.ele('Header');
    header.ele('FID').txt(data.FID).up();

    const filer = header.ele('Filer');
    const names = filer.ele('Names');
    names.ele('OrganizationName').txt(data.filer.orgName).up();
    names.up();

    filer.ele('MailAddress').txt(data.filer.mailAddress).up();
    if (data.filer.mailAddress2) {
      filer.ele('MailAddress2').txt(data.filer.mailAddress2).up();
    }
    if (data.filer.country !== 'USA' && data.filer.mailAddress3) {
      filer.ele('MailAddress3').txt(data.filer.mailAddress3).up();
    }

    filer.ele('City').txt(data.filer.city).up();
    filer.ele('State').txt(data.filer.state).up();
    filer.ele('PostalCode').txt(data.filer.postalCode).up();
    filer.ele('Country').txt(data.filer.country).up();

    filer.ele('ClientAccountNum').txt(data.filer.clientAccountNum).up();
    filer.ele('ContactName').txt(data.filer.contactName).up();
    filer.ele('ContactPhone').txt(data.filer.contactPhone).up();
    filer.ele('ContactEmail').txt(data.filer.contactEmail).up();
    filer.up();

    header.ele('PacketNum').txt(data.header.packetNum).up();
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

    record.ele('OptionalFilerReference').txt(data.record.filerRef).up();

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
    debtor.ele('OrganizationName').txt(data.record.debtor.orgName).up();
    debtor.ele('MailAddress').txt(data.record.debtor.mailAddress).up();
    debtor.ele('City').txt(data.record.debtor.city).up();
    debtor.ele('State').txt(data.record.debtor.state).up();
    debtor.ele('PostalCode').txt(data.record.debtor.postalCode).up();
    debtor.ele('Country').txt(data.record.debtor.country).up();
    debtor.up().up().up();

    // === SECURED PARTIES ===
    const secured = record.ele('SecuredParties').ele('SecuredName').ele('Names');
    secured.ele('OrganizationName').txt(data.record.secured.orgName).up();
    secured.ele('MailAddress').txt(data.record.secured.mailAddress).up();
    secured.ele('City').txt(data.record.secured.city).up();
    secured.ele('State').txt(data.record.secured.state).up();
    secured.ele('PostalCode').txt(data.record.secured.postalCode).up();
    secured.ele('Country').txt(data.record.secured.country).up();
    secured.up().up().up();

    // === COLLATERAL ===
    if (data.record.collateralText) {
      record.ele('Collateral').ele('ColText').txt(data.record.collateralText).up().up();
    }

    // === DESIGNATION ===
    record.ele('CollateralDesignation').att('Type', 'NODesignation').up();

    // === OUTPUT ===
    const xml = doc.end({ prettyPrint: true });
    const xmlBase64 = Buffer.from(xml).toString('base64');

    return {
      xml,
      xmlBase64
    };
  }
};
