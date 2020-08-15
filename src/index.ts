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

  public async set(key: string, value: any) {
    if (typeof value === "object") {
      value = JSON.stringify(value);
    }

    this.dbConnection.set(key, value);
  }

  public async get(key: string): Promise<any> {
    return this.dbConnection.get(key);
  }

  public async saveInstallation(teamId: string, installation: Installation) {
    this.set(teamId, installation);
  }

  public async fetchInstallation(id: string) {
    const installation: Installation = await this.get(id);
    return installation;
  }

  public async listen({ payload, context, next }: any) {
    this.setDbContext(context);
    await next();
  }
}
