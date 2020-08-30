export class Installations {
    public enterpriseId: string;
    public teamId: string;
    public botToken: string;
    public botId: string;
    public botUserId: string;

    constructor(enterpriseId: string, teamId: string, botToken: string, botUserId: string, botId: string) {
        this.enterpriseId = enterpriseId;
        this.teamId = teamId;
        this.botToken = botToken;
        this.botUserId = botUserId;
        this.botId = botId;
    }
}

export class Message {}
