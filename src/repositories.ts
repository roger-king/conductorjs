import { Tedis } from 'tedis';
import { SlackChannel } from './types';
import { Installation } from '@slack/oauth';

export class ChannelRepository {
    constructor(private dbConnection: Tedis) {}

    public async find(teamId: string): Promise<SlackChannel[]> {
        const saved = await this.dbConnection.hget('savedChannels', teamId);

        if (saved) {
            return JSON.parse(saved);
        }

        return [];
    }

    public async create(teamId: string, channel: SlackChannel): Promise<0 | 1> {
        let channels = [channel];
        const savedChannels = await this.find(teamId);

        if (savedChannels) {
            channels = channels.concat(savedChannels);
        }

        return this.dbConnection.hset('savedChannels', teamId, JSON.stringify(channels));
    }

    public async delete(teamId: string, channelId: string): Promise<0 | 1> {
        let channels: SlackChannel[] = [];
        const savedChannels = await this.find(teamId);

        if (savedChannels.length > 0) {
            channels = savedChannels.filter((c: any) => c.id !== channelId);
        }

        return this.dbConnection.hset(`savedChannels`, teamId, JSON.stringify(channels));
    }
}

export class InstallationRepository {
    constructor(private dbConnection: Tedis) {}

    public async save(teamId: string, installation: Installation): Promise<0 | 1> {
        return this.dbConnection.hset('installations', teamId, JSON.stringify(installation));
    }

    public async findOne(id: string) {
        const installation = await this.dbConnection.hget('installations', id);
        if (installation) {
            return JSON.parse(installation);
        }

        return {};
    }
}
