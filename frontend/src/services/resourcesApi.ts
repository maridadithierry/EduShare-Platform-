export type Resource = {
  id: string;
  title: string;
  description: string;
  subject: string;
  level: string;
  language: string;
  helpfulCount: number;
};

type ResourceQuery = {
  subject?: string;
  level?: string;
};

function buildQuery(params: ResourceQuery): string {
  const searchParams = new URLSearchParams();

  if (params.subject) {
    searchParams.set("subject", params.subject);
  }

  if (params.level) {
    searchParams.set("level", params.level);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function getResources(params: ResourceQuery): Promise<Resource[]> {
  const response = await fetch(`/api/resources${buildQuery(params)}`);

  if (!response.ok) {
    throw new Error("Failed to load resources");
  }

  const payload = (await response.json()) as { resources: Resource[] };
  return payload.resources;
}

export async function markResourceHelpful(resourceId: string): Promise<Resource> {
  const response = await fetch(`/api/resources/${resourceId}/helpful`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to vote for resource");
  }

  const payload = (await response.json()) as { resource: Resource };
  return payload.resource;
}
