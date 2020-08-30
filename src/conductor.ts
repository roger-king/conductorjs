import { Tedis } from 'tedis';
import { json, Router } from 'express';
import { CodedError } from '@slack/bolt';
import { WebClient } from '@slack/web-api';

import { SlackChannel, DBConnectionConfig } from './types';
import { ChannelRepository, InstallationRepository } from './repositories';
import { APIV1Router } from './routes';

export interface IConductor {
    authorize(args: { teamId: string; enterpriseId: string }): Promise<any>;
    listen(args: { payload: any; context: any; next: any }): Promise<void>;
    shouldProcess(args: { payload: any; context: any; next: any }): Promise<void>;
    handleError(error: CodedError): Promise<void>;
}

export interface ConductorConfig {
    dbConfig: DBConnectionConfig;
    slackClient?: WebClient;
    router?: Router;
    withChannelRoutes?: boolean;
}

export class Conductor implements IConductor {
    public dbConnection: Tedis;
    public channelRepo: ChannelRepository;
    private installationRepo: InstallationRepository;
    private router?: Router;

    constructor(conf: ConductorConfig) {
        this.dbConnection = new Tedis(conf.dbConfig as any);
        this.channelRepo = new ChannelRepository(this.dbConnection);
        this.installationRepo = new InstallationRepository(this.dbConnection);

        this.router = conf.router;

        if (conf.withChannelRoutes) {
            if (conf.router) {
                this.router = conf.router;
                this.router.use(json());

                // Setup channel routes
                new APIV1Router(this.router, this.channelRepo);
            } else {
                throw new Error('missing express router');
            }
        }
    }

    private async setDbContext(context: any) {
        context.db = {
            connection: this.dbConnection,
        };
    }

    public async authorize({ teamId, enterpriseId }: { teamId: string; enterpriseId: string }): Promise<any> {
        const installation = await this.installationRepo.findOne(teamId);

        if (installation && installation.bot) {
            return {
                botToken: installation.bot.token,
                botId: installation.bot.id,
                botUserId: installation.bot.userId,
            };
        }

        throw new Error('No authorization');
    }

    public async listen({ payload, context, next }: any): Promise<void> {
        this.setDbContext(context);
        await next();
    }

    public async shouldProcess({ payload, context, next }: any): Promise<void> {
        const { team, channel, channel_type } = payload;

        const savedChannels = await this.channelRepo.find(team);

        if (channel_type === 'channel') {
            if (savedChannels.length > 0 && !savedChannels.find((s: SlackChannel) => s.id === channel && s.enabled)) {
                throw { code: 405, name: 'unknown_channel' };
            }
        }

        await next();
    }

    public async handleError(error: CodedError): Promise<void> {
        console.log(error);
    }
}
