import { describe, it, expect } from 'vitest';

interface PortalIdentity {
  resolved: boolean;
  associateId: string | null;
  dependentId: string | null;
  profileType: 'associate' | 'dependent' | null;
  associationStatus: string | null;
  accessLevel: 'full' | 'read_only' | 'blocked' | 'manual_review' | null;
  linkStatus: string | null;
  reasonCode: string | null;
}

const mapPortalIdentityResponse = (row: any): PortalIdentity => {
  if (!row) {
    return {
      resolved: false,
      associateId: null,
      dependentId: null,
      profileType: null,
      associationStatus: null,
      accessLevel: null,
      linkStatus: null,
      reasonCode: 'PROFILE_NOT_FOUND'
    };
  }

  const associateId = row.associate_id || row.associado_id || null;
  const associationStatus = row.association_status || row.associado_status || null;
  const profileType = (row.profile_type || row.person_type) as any || null;
  const authUserId = row.auth_user_id || row.auth_id || null;
  const linkStatus = row.link_status || null;
  const accessLevel = (row.access_level as any) || (linkStatus === 'active' ? 'full' : 'blocked');
  const reasonCode = row.reason_code || (associateId ? 'READY' : 'PROFILE_LINK_MISSING');
  const resolved = row.resolved ?? Boolean(associateId && linkStatus === 'active');

  return {
    resolved,
    associateId,
    dependentId: row.dependent_id || row.dependente_id || null,
    profileType,
    associationStatus,
    linkStatus,
    accessLevel,
    reasonCode
  };
};

describe('Portal Identity Adapter', () => {
  it('should map old Portuguese/snake_case contract to new camelCase identity', () => {
    const input = {
      auth_id: "dc21aede-f18c-4e1b-9b44-285dec1f572e",
      link_id: "a9fe89...",
      associado_id: "712146d5-9f54-4619-976c-9c9cf015f46c",
      link_status: "active",
      person_type: "associate",
      associado_status: "regular"
    };

    const output = mapPortalIdentityResponse(input);

    expect(output.resolved).toBe(true);
    expect(output.associateId).toBe("712146d5-9f54-4619-976c-9c9cf015f46c");
    expect(output.profileType).toBe("associate");
    expect(output.associationStatus).toBe("regular");
    expect(output.linkStatus).toBe("active");
    expect(output.reasonCode).toBe("READY");
  });

  it('should map new standardized contract correctly', () => {
    const input = {
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

    const output = mapPortalIdentityResponse(input);

    expect(output.resolved).toBe(true);
    expect(output.associateId).toBe("712146d5-9f54-4619-976c-9c9cf015f46c");
    expect(output.accessLevel).toBe("full");
    expect(output.reasonCode).toBe("READY");
  });
});
