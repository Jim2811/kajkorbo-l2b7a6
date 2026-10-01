import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env";

const googleClient = new OAuth2Client({
	client_id: env.googleClientId,
});

export { googleClient };
