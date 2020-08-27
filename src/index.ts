import { Tedis } from "tedis";
import { Installation } from "@slack/oauth";

export interface DBConnectionConfig {
  host: string;
  port?: string;
  password?: string;
  timeout?: string;
}

export interface ILightningBolt {}

export class LightningBolt implements ILightningBolt {
  public dbConnection: Tedis;
  public message: any;
  public next: any;

  constructor(dbConfig: DBConnectionConfig) {
    this.dbConnection = new Tedis(dbConfig as any);
  }

  private async setDbContext(context: any) {
    context.db = {
      connection: this.dbConnection,
    };
  }

  public async saveInstallation(teamId: string, installation: Installation) {
    this.dbConnection.hset(
      "installations",
      teamId,
      JSON.stringify(installation)
    );
  }

  public async fetchInstallation(id: string) {
    const installation = await this.dbConnection.hget("installations", id);
    if (installation) {
      return JSON.parse(installation);
    }
    return {};
  }

  public async authorize({
    teamId,
    enterpriseId,
  }: {
    teamId: string;
    enterpriseId: string;
  }): Promise<any> {
    const installation = await this.fetchInstallation(teamId);

    if (installation && installation.bot) {
      return {
        botToken: installation.bot.token,
        botId: installation.bot.id,
        botUserId: installation.bot.userId,
      };
    }

    throw new Error("No authorization");
  }

  public async listen({ payload, context, next }: any) {
    this.setDbContext(context);
    await next();
  }

  // routes to channel to fn
  public async channelRouter([]: ChannelRoute[]) {}

  // addChannelToMap - when app/bot is added to the channel it will add the channel_id as a router
  public async addChannelToMap() {}
}

export interface ChannelRoute {
  channel: string;
  fn: () => Promise<void>;
}

export class LightningBoltConversationStore {
  set() {}

  get() {}
}
