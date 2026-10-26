import "dotenv/config";
export declare const env: {
    databaseUrl: string;
    jwt_access_secret: string;
    jwt_refresh_secret: string;
    jwt_access_expires_in: string;
    jwt_refresh_expires_in: string;
    port: number;
    googleClientId: string;
    googleClientSecret: string;
    redis_user: string | undefined;
    redis_password: string | undefined;
    redis_host: string;
    redis_port: number;
    super_admin_name: string;
    super_admin_email: string;
    super_admin_pass: string;
    smtp: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        password: string;
        from: string;
    };
    cloudinary: {
        cloudName: string;
        apiKey: string;
        apiSecret: string;
    };
    stripe: {
        secretKey: string;
        webhookSecret: string;
        teamCapacityUnitAmount: number;
        currency: string;
        successUrl: string;
        cancelUrl: string;
    };
};
//# sourceMappingURL=env.d.ts.map