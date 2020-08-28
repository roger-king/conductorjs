import { Tedis } from "tedis";
import { CodedError } from "@slack/bolt";
import { Installation } from "@slack/oauth";
import { SlackChannel } from "./models";

export interface DBConnectionConfig {
  host: string;
  port?: string;
  password?: string;
  timeout?: string;
}

export interface ILightningBolt {}

export class LightningBolt implements ILightningBolt {
  public dbConnection: Tedis;

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

  public async shouldProcess({ payload, context, next }: any) {
    const { team, channel, channel_type } = payload;

    const savedChannels = await this.fetchSavedChannels(team);

    if (channel_type === "channel") {
      if (
        savedChannels.length > 0 &&
        !savedChannels.find((s: SlackChannel) => s.id === channel && s.enabled)
      ) {
        throw { code: 405, name: "unknown_channel" };
      }
    }

    await next();
  }

  public async handleError(error: CodedError) {
    console.log(error);
  }

  public async saveChannel(teamId: string, channel: SlackChannel) {
    let channels = [channel];
    const savedChannels = await this.fetchSavedChannels(teamId);

    if (savedChannels) {
      channels = channels.concat(savedChannels);
    }

    return this.dbConnection.hset(
      "savedChannels",
      teamId,
      JSON.stringify(channels)
    );
  }

  public async removeSavedChannel(teamId: string, channelId: string) {
    let channels = [];
    const savedChannels = await this.fetchSavedChannels(teamId);

    if (savedChannels.length > 0) {
      channels = savedChannels.filter((c: any) => c.id !== channelId);
    }

    return this.dbConnection.hset(
      `savedChannels`,
      teamId,
      JSON.stringify(channels)
    );
  }

  public async fetchSavedChannels(teamId: string) {
    const saved = await this.dbConnection.hget("savedChannels", teamId);

    if (saved) {
      return JSON.parse(saved);
    }

    return [];
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
