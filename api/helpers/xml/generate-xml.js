const { create } = require('xmlbuilder2');

module.exports = {

  friendlyName: 'Generate xml',

  description: '',

  inputs: {
    data: {
      type: 'ref', // or 'json' if you want validation
      required: true,
      description: 'Full input data used to build the XML',
    },
  },

  exits: {
    success: {
      description: 'All done.',
    },
  },

  fn: async function (inputs) {

    const data = inputs.data;

    // The rest of your XML generation code remains unchanged...
    const xml = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('Document')
        .ele('XMLVersion').att('Version', '08172001').up()
        .ele('Header')
        .ele('FID').txt(data.FID).up()
          .ele('Filer')
            .ele('Names')
              .ele('OrganizationName').txt(data.filer.orgName).up()
              .ele('MailAddress').txt(data.filer.mailAddress).up()
              .ele('City').txt(data.filer.city).up()
              .ele('State').txt(data.filer.state).up()
              .ele('PostalCode').txt(data.filer.postalCode).up()
              .ele('Country').txt(data.filer.country).up()
            .up()
            .ele('ContactName').txt(data.filer.contactName).up()
            .ele('ContactPhone').txt(data.filer.contactPhone).up()
            .ele('ContactEmail').txt(data.filer.contactEmail).up()
          .up()
          .ele('PacketNum').txt(data.header.packetNum).up()
        .up()
        .ele('Record')
          .ele('SeqNumber').txt(data.record.seqNumber).up()
          .ele('TransType').att('Type', data.record.transType).up()
          .ele('OptionalFilerReference').txt(data.record.filerRef).up()
          .ele('Debtors')
            .ele('DebtorName')
              .ele('Names')
                .ele('OrganizationName').txt(data.record.debtor.orgName).up()
                .ele('MailAddress').txt(data.record.debtor.mailAddress).up()
                .ele('City').txt(data.record.debtor.city).up()
                .ele('State').txt(data.record.debtor.state).up()
                .ele('PostalCode').txt(data.record.debtor.postalCode).up()
                .ele('Country').txt(data.record.debtor.country).up()
              .up()
            .up()
          .up()
          .ele('SecuredParties')
            .ele('SecuredName')
              .ele('Names')
                .ele('OrganizationName').txt(data.record.secured.orgName).up()
                .ele('MailAddress').txt(data.record.secured.mailAddress).up()
                .ele('City').txt(data.record.secured.city).up()
                .ele('State').txt(data.record.secured.state).up()
                .ele('PostalCode').txt(data.record.secured.postalCode).up()
                .ele('Country').txt(data.record.secured.country).up()
              .up()
            .up()
          .up()
          .ele('Collateral')
            .ele('ColText').txt(data.record.collateralText).up()
          .up()
          .ele('CollateralDesignation').att('Type', 'NODesignation').up()
        .up()
      .end({ prettyPrint: true });

    const xmlBase64 = Buffer.from(xml).toString('base64');

    return {
      xml,
      xmlBase64
    };
  }
};
