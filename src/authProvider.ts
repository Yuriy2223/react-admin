import getProfileFromToken from "./getProfileFromToken";

const apiUrl = import.meta.env.VITE_API_HOST;
const redirectUrl = import.meta.env.VITE_OIDC_REDIRECT_URI;
const getTokenApiPath = import.meta.env.VITE_API_GET_TOKEN_PATH;

function generateRandomString(length: number): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function encodeParams(params: { [key: string]: string }): string {
  return Object.keys(params)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`,
    )
    .join("&");
}

const authProvider = {
  login: () => {
    return new Promise<void>((resolve) => {
      const sessionState = generateRandomString(30);
      const params = {
        response_type: "code",
        client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
        redirect_uri: redirectUrl,
        scope:
          "openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
        state: sessionState,
        access_type: "offline",
        include_granted_scopes: "true",
        prompt: "select_account",
      };
      console.log("Auth redirect URL: ", redirectUrl);

      const authUrl = `https://accounts.google.com/o/oauth2/auth?${encodeParams(
        params,
      )}`;
      window.localStorage.setItem("sessionState", sessionState);
      window.location.href = authUrl;
      resolve();
    });
  },

  logout: () => {
    localStorage.removeItem("token");
    return Promise.resolve();
  },

  checkError: ({ status, body }: { status: number; body: any }) => {
    console.log(`Error Status: ${status}`);
    console.log(`Error Body:`, body);

    if (status === 401) {
      localStorage.removeItem("token");
      return Promise.resolve();
    }
    // Завжди повертати Promise
    return Promise.resolve();
  },

  checkAuth: () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return Promise.reject();
    }

    // Перевіряємо чи є token
    const jwt = token ? getProfileFromToken(token) : null;
    if (!jwt) {
      return Promise.reject();
    }
    const now = new Date();

    return now.getTime() > jwt.exp * 1000
      ? Promise.reject()
      : Promise.resolve();
  },

  getPermissions: () => Promise.resolve(),

  getIdentity: () => {
    const token = window.localStorage.getItem("token");

    // Перевірка на наявність token
    if (!token) {
      return Promise.reject();
    }

    const profile = getProfileFromToken("token");

    return Promise.resolve({
      id: profile.sub,
      fullName: profile.name,
      avatar: profile.picture,
    });
  },

  getToken: () => {
    return window.localStorage.getItem("token");
  },

  handleCallback: async () => {
    if (window.localStorage.getItem("token")) {
      return Promise.resolve();
    }
    const { searchParams } = new URL(window.location.href);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error || !code || !state) {
      console.log("Error: ", error);
      console.log("Code: ", code);
      console.log("State: ", state);
      throw new Error('Failed to handle login callback.');
    }

    window.localStorage.setItem("authCode", code);
    const params: { [key: string]: string | null } = {
      code: code,
      state: state,
      error: error,
      from_react: "true",
    };

    const paramsWithValues: { [key: string]: string } = Object.fromEntries(
      Object.entries(params).filter(
        ([, value]) => value !== null && value !== undefined,
      ) as [string, string][],
    );

    const response = await fetch(
      `${apiUrl}${getTokenApiPath}?${encodeParams(paramsWithValues)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to handle login callback.');
    }

    const data = await response.json();
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);

    window.location.href = "/";
    return {redirectTo: "/"};
  },
};

export default authProvider;
