
const mapPortalIdentityResponse = (row) => {
  if (!row) return { resolved: false, reasonCode: 'PROFILE_NOT_FOUND' };
  const associateId = row.associate_id || row.associado_id || null;
  const associationStatus = row.association_status || row.associado_status || null;
  const profileType = (row.profile_type || row.person_type) || null;
  const authUserId = row.auth_user_id || row.auth_id || null;
  const linkStatus = row.link_status || null;
  const accessLevel = row.access_level || (linkStatus === 'active' ? 'full' : 'blocked');
  const reasonCode = row.reason_code || (associateId ? 'READY' : 'PROFILE_LINK_MISSING');
  const resolved = row.resolved ?? Boolean(associateId && linkStatus === 'active');

  return {
    resolved,
    authUserId,
    associateId,
    dependentId: row.dependent_id || row.dependente_id || null,
    profileType,
    associationStatus,
    linkStatus,
    accessLevel,
    reasonCode
  };
};

const input = {
  auth_id: "dc21aede-f18c-4e1b-9b44-285dec1f572e",
  link_id: "a9fe89...",
  associado_id: "712146d5-9f54-4619-976c-9c9cf015f46c",
  link_status: "active",
  person_type: "associate",
  associado_status: "regular"
};

const result = mapPortalIdentityResponse(input);
console.log(JSON.stringify(result, null, 2));

const inputNew = {
  resolved: true,
  auth_user_id: "dc21aede-f18c-4e1b-9b44-285dec1f572e",
  link_id: "a9fe89...",
  associate_id: "712146d5-9f54-4619-976c-9c9cf015f46c",
  dependent_id: null,
  profile_type: "associate",
  association_status: "regular",
  link_status: "active",
  access_level: "full",
  reason_code: "READY"
};

const resultNew = mapPortalIdentityResponse(inputNew);
console.log(JSON.stringify(resultNew, null, 2));
