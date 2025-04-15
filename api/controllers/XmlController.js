module.exports = {
  generate: async function (req, res) {
    try {
      const data = req.body;

      // ✅ Use helper
      const { xml, xmlBase64 } = await sails.helpers.xml.generateXml.with({ data });


      // Save to DB
      const record = await FormsXml.create({
        xml_base64: xmlBase64,
        FID: data.FID || 0,
        reference: data.record.filerRef,
        form_type: data.record.transType || 'UCC1',
        created_by: 1
      }).fetch();

      return res.ok({
        message: 'XML created and stored successfully.',
        xmlPreview: xml,
        recordId: record.id
      });

    } catch (err) {
      console.error(err);
      return res.serverError({ error: 'Something went wrong', details: err.message });
    }
  },
  getXmlByFid: async function (req, res) {
    const fid = req.params.fid;
  
    if (!fid) return res.badRequest({ message: 'Missing FID' });
  
    const record = await FormsXml.findOne({ FID: fid });
  
    if (!record) return res.notFound({ message: 'No record for FID' });
  
    const rawXml = Buffer.from(record.xml_base64, 'base64').toString();
  
    if (req.query.format === 'xml') {
      return res.type('application/xml').send(rawXml);
    }
  
    return res.ok({
      id: record.id,
      fid: record.FID,
      rawXml
    });
  }
  


//   getXml: async function (req, res) {
//     const id = req.params.id;

//     if (!id) return res.badRequest({ message: 'Missing ID' });

//     const record = await FormsXml.findOne({ id });

//     if (!record) return res.notFound({ message: 'Record not found' });

//     // Decode base64 back to raw XML
//     const rawXml = Buffer.from(record.xml_base64, 'base64').toString();

//     // Optional: return raw XML as browser-friendly
//     if (req.query.format === 'xml') {
//       return res.type('application/xml').send(rawXml);
//     }

//     return res.ok({
//       id: record.id,
//       reference: record.reference,
//       form_type: record.form_type,
//       rawXml,
//       created_by: record.created_by
//     });
//   }
};
