import { getCurrentUser } from "aws-amplify/auth";
import { api } from "../data/apiClient";
import {
  HereditarySignal,
  RelationshipDirection,
  RelationshipLink,
  RelationshipStatus,
  RelationshipDegree,
} from "../../types";

async function getCurrentUserId(): Promise<string> {
  const { userId } = await getCurrentUser();
  return userId;
}

// Simple dev-time envelope — replace with libsodium sealed boxes in production
function encodeEnvelope(payload: Record<string, any>): string {
  const json = JSON.stringify(payload);
  return typeof btoa !== "undefined"
    ? btoa(json)
    : Buffer.from(json, "utf8").toString("base64");
}

function decodeEnvelope(ciphertext: string): any {
  const json =
    typeof atob !== "undefined"
      ? atob(ciphertext)
      : Buffer.from(ciphertext, "base64").toString("utf8");
  return JSON.parse(json);
}

export const familyService = {
  async requestLink(params: {
    relativeEmail: string;
    degree: RelationshipDegree;
    direction: RelationshipDirection;
  }): Promise<RelationshipLink> {
    const userId = await getCurrentUserId();
    return api.post<RelationshipLink>(`/users/${userId}/family/links`, {
      relativeEmail: params.relativeEmail,
      degree: params.degree,
      direction: params.direction,
    });
  },

  async acceptLink(params: {
    relativeEmail: string;
    degree: RelationshipDegree;
  }): Promise<RelationshipLink> {
    const userId = await getCurrentUserId();
    return api.post<RelationshipLink>(`/users/${userId}/family/links`, {
      relativeEmail: params.relativeEmail,
      degree: params.degree,
      direction: "reciprocal",
    });
  },

  async listLinks(): Promise<RelationshipLink[]> {
    const userId = await getCurrentUserId();
    return api.get<RelationshipLink[]>(`/users/${userId}/family/links`);
  },

  async revokeLink(linkId: string): Promise<void> {
    const userId = await getCurrentUserId();
    await api.delete(`/users/${userId}/family/links/${linkId}`);
  },

  async upsertSignal(params: {
    recipientId: string;
    conditionCode: string;
    onsetAgeBand: string;
    severityBand?: string | null;
    expiresAt?: string | null;
    payload: Record<string, any>;
  }): Promise<HereditarySignal> {
    const userId = await getCurrentUserId();
    return api.post<HereditarySignal>(`/users/${userId}/family/signals`, {
      recipientId: params.recipientId,
      conditionCode: params.conditionCode,
      onsetAgeBand: params.onsetAgeBand,
      severityBand: params.severityBand ?? null,
      expiresAt: params.expiresAt ?? null,
      ciphertext: encodeEnvelope(params.payload),
    });
  },

  async revokeSignal(signalId: string): Promise<void> {
    const userId = await getCurrentUserId();
    await api.delete(`/users/${userId}/family/signals/${signalId}`);
  },

  async listIncomingSignals(): Promise<HereditarySignal[]> {
    const userId = await getCurrentUserId();
    const data = await api.get<{
      received: HereditarySignal[];
      sent: HereditarySignal[];
    }>(`/users/${userId}/family/signals`);
    return data.received;
  },

  decryptPayload<T = any>(signal: HereditarySignal): T {
    return decodeEnvelope(signal.ciphertext) as T;
  },
};

export default familyService;
