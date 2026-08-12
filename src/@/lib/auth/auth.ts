import axios from 'axios';

export interface DataLogin {
  username: string;
  password: string;
  redirect: boolean;
  csrfToken: string;
  callbackUrl: string;
  json: boolean;
}

export interface DataLogout {
  csrfToken: string;
  callbackUrl: string;
  json: boolean;
}

type AccessTokenSummary = {
  id: number;
  name: string;
  isSession: boolean;
  expires: string;
  createdAt: string;
};

const authHeaders = (apiKey: string) => ({
  Authorization: `Bearer ${apiKey}`,
});

async function getActiveTokens(baseUrl: string, apiKey: string) {
  const response = await axios.get(`${baseUrl}/api/v1/tokens`, {
    headers: authHeaders(apiKey),
  });
  return response.data.response as AccessTokenSummary[];
}

async function revokeTokenById(
  baseUrl: string,
  apiKey: string,
  tokenId: number,
) {
  await axios.delete(`${baseUrl}/api/v1/tokens/${tokenId}`, {
    headers: authHeaders(apiKey),
  });
}

export async function getCsrfTokenFetch(url: string): Promise<string> {
  const token = await fetch(`${url}/api/v1/auth/csrf`);
  const { csrfToken } = await token.json();
  return csrfToken;
}

export async function performLoginOrLogout(
  url: string,
  data: DataLogin | DataLogout,
) {
  const formBody = Object.entries(data)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join('&');

  return await axios.post(url, formBody, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}

export async function getSession(
  url: string,
  username: string,
  password: string,
  sessionName: string,
) {
  return await axios.post(
    `${url}/api/v1/session`,
    {
      username,
      password,
      sessionName,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

export async function revokeNamedSession(
  baseUrl: string,
  apiKey: string,
  sessionName: string,
): Promise<boolean> {
  const tokens = await getActiveTokens(baseUrl, apiKey);
  const matchingSessions = tokens
    .filter((token) => token.isSession && token.name === sessionName)
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );

  const currentSession = matchingSessions[0];
  if (!currentSession) {
    return false;
  }

  await revokeTokenById(baseUrl, apiKey, currentSession.id);
  return true;
}

export async function revokeStaleNamedSessions(
  baseUrl: string,
  apiKey: string,
  sessionName: string,
): Promise<number> {
  const tokens = await getActiveTokens(baseUrl, apiKey);
  const matchingSessions = tokens
    .filter((token) => token.isSession && token.name === sessionName)
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );

  const staleSessions = matchingSessions.slice(1);
  for (const token of staleSessions) {
    await revokeTokenById(baseUrl, apiKey, token.id);
  }

  return staleSessions.length;
}

export async function getSessionFetch(url: string) {
  const session = await fetch(`${url}/api/v1/auth/session`);
  const sessionJson = await session.json();
  return sessionJson.user;
}
