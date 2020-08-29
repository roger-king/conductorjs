import { Tedis } from "tedis";
import { json, Router } from "express";
import { CodedError } from "@slack/bolt";
import { Installation } from "@slack/oauth";
import { SlackChannel } from "./models";

export interface DBConnectionConfig {
  host: string;
  port?: string;
  password?: string;
  timeout?: string;
}

export interface IConductorBolt {}

export interface ConductorConfig {
  dbConfig: DBConnectionConfig;
  router?: Router;
  withChannelRoutes?: boolean;
}

export class Conductor implements IConductorBolt {
  public dbConnection: Tedis;
  private router?: Router;
  private withChannelRoutes?: boolean;

  constructor(conf: ConductorConfig) {
    this.dbConnection = new Tedis(conf.dbConfig as any);
    this.router = conf.router;

    if (conf.withChannelRoutes) {
      if (!conf.router) {
        throw new Error("missing express router");
      }
      this.withChannelRoutes = conf.withChannelRoutes;
    }

    if (conf.router) {
      this.router = conf.router;
      this.setupRoutes();
    }
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

  private async setupRoutes() {
    if (this.router && this.withChannelRoutes) {
      this.router.use(json());

      this.router.post("/api/v1/:teamId/channels", async (req, res) => {
        const { teamId } = req.params;
        const { channel } = req.body;
        await this.saveChannel(teamId, channel);
        res.send({ data: true });
        return;
      });

      this.router.delete(
        "/api/v1/:teamId/channels/:channelId",
        async (req, res) => {
          const { teamId, channelId } = req.params;
          await this.removeSavedChannel(teamId, channelId);
          res.send({ data: true });
          return;
        }
      );
    }
  }
}

export interface ChannelRoute {
  channel: string;
  fn: () => Promise<void>;
}

export class ConductorConversationStore {
  set() {}

  get() {}
}
