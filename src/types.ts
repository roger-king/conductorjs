export interface SlackChannel {
    id: string;
    name: string;
    enabled: boolean;
}

export interface SlackInstallation {
    enterpriseId: string;
    teamId: string;
    botToken: string;
    botUserId: string;
    botId: string;
}

export interface DBConnectionConfig {
    host: string;
    port?: string;
    password?: string;
    timeout?: string;
}
