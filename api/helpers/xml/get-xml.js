module.exports = {


  friendlyName: 'Get xml',


  description: 'Fetch XML record from DB by FID and return decoded XML.',


  inputs: {
    fid: {
      type: 'number',
      required: true,
      description: 'The FID of the record to retrieve.'
    },
    format: {
      type: 'string',
      required: false,
      description: 'Optional format (xml or json)'
    }
  },


  exits: {
    notFound: {
      description: 'No record found with that FID.'
    },
    success: {
      description: 'Record found and returned.'
    }
  },


  fn: async function (inputs, exits) {
    const record = await FormsXml.findOne({ FID: inputs.fid });

    if (!record) {
      return exits.notFound({ message: 'No record for FID' });
    }

    const rawXml = Buffer.from(record.xml_base64, 'base64').toString();

    if (inputs.format === 'xml') {
      return exits.success({ isXml: true, rawXml });
    }

    return exits.success({
      id: record.id,
      fid: record.FID,
      rawXml
    });
  }

};

