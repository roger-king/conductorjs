export interface SlackChannel {
    id: string;
    name: string;
    enabled: boolean;
}

export interface DBConnectionConfig {
    host: string;
    port?: string;
    password?: string;
    timeout?: string;
}
