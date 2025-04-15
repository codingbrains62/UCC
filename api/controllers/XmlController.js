const validateUccData = require('../utils/validateUccData');

module.exports = {
  generate: async function (req, res) {
    try {
      const data = req.body;
       // Validate before XML generation
       const errors = validateUccData(data);
       if (errors.length) {
         return res.badRequest({
           message: 'Validation failed',
           errors
         });
       }
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
  
      try {
        const result = await sails.helpers.xml.getXml.with({
          fid: parseInt(fid),
          format: req.query.format
        });
    
        if (result.isXml) {
          return res.type('application/xml').send(result.rawXml);
        }
    
        return res.ok(result);
      } catch (err) {
        if (err.code === 'notFound') {
          return res.notFound({ message: 'No record for FID' });
        }
    
        return res.serverError({ error: 'Something went wrong', details: err.message });
      }
  }
};
