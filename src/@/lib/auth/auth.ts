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

const authHeaders = (apiKey: string) => ({
  Authorization: `Bearer ${apiKey}`,
});

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
      purpose: 'browser_extension',
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

export async function revokeCurrentSession(baseUrl: string, apiKey: string) {
  const response = await axios.delete(`${baseUrl}/api/v1/session`, {
    headers: authHeaders(apiKey),
  });

  return response.data.response?.revoked === true;
}

export async function getSessionFetch(url: string) {
  const session = await fetch(`${url}/api/v1/auth/session`);
  const sessionJson = await session.json();
  return sessionJson.user;
}
