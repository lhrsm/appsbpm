import { expect, test } from 'vitest';

// Simulação do mapeamento conforme implementado no Contexto
function mapPortalIdentityResponse(row: any) {
  if (!row) return null;
  return {
    resolved: row.resolved === true,
    authUserId: row.auth_user_id ?? null,
    associateId: row.associate_id ?? null,
    dependentId: row.dependent_id ?? null,
    profileType: row.profile_type ?? null,
    associationStatus: row.association_status ?? null,
    linkStatus: row.link_status ?? null,
    accessLevel: row.access_level ?? null,
    reasonCode: row.reason_code ?? null
  };
}

test('mapPortalIdentityResponse maps snake_case from RPC to camelCase frontend object', () => {
  const input = {
    resolved: true,
    auth_user_id: "dc21aede-f18c-4e1b-9b44-285dec1f572e",
    associate_id: "712146d5-9f54-4619-976c-9c9cf015f46c",
    profile_type: "associate",
    association_status: "regular",
    link_status: "active",
    access_level: "full",
    reason_code: "READY"
  };

  const output = mapPortalIdentityResponse(input);

  expect(output).toEqual({
    resolved: true,
    authUserId: "dc21aede-f18c-4e1b-9b44-285dec1f572e",
    associateId: "712146d5-9f54-4619-976c-9c9cf015f46c",
    dependentId: null,
    profileType: "associate",
    associationStatus: "regular",
    linkStatus: "active",
    accessLevel: "full",
    reasonCode: "READY"
  });
});

test('mapPortalIdentityResponse handles missing fields with null', () => {
  const input = { resolved: false };
  const output = mapPortalIdentityResponse(input);
  expect(output.associateId).toBeNull();
  expect(output.resolved).toBe(false);
});
