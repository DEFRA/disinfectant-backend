import Joi from 'joi';
 
const disinfectantApprovedListSchema = Joi.object({
    createdon: Joi.date().iso().required(),
    dsf_approvalslistsiid: Joi.string().required(),
    dsf_chemicalgroups: Joi.string().required(),
    dsf_companyaddress: Joi.string().required(),
    dsf_companyname: Joi.string().required(),
    dsf_disinfectant: Joi.string().required(),
    dsf_disinfectantname: Joi.string().required(),
    dsf_disinfectanttype: Joi.number().integer().required(),
    dsf_dp_approveddilution: Joi.string().required(),
    dsf_fm_approveddilution: Joi.string().required(),
    dsf_go_approveddilution: Joi.string().required(),
    dsf_identity: Joi.any().allow(null),
    dsf_parentdisinfectant: Joi.string().required(),
    dsf_pform: Joi.string().required(),
    dsf_pid: Joi.any().allow(null),
    dsf_sv_approveddilution: Joi.string().required(),
    dsf_tb_approveddilution: Joi.string().required(),
    dsf_tradenameordisinfectantname: Joi.string().required(),
    statecode: Joi.number().integer().allow(null),
    statuscode: Joi.number().integer().allow(null)
});
 
export default disinfectantApprovedListSchema;