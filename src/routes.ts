import { Router, Request, Response } from 'express';
import { API_URL } from './constants';
import { ChannelRepository } from './repositories';

export class APIV1Router {
    constructor(private router: Router, private channelRepo: ChannelRepository) {
        const chr = new ChannelRouter(this.router, this.channelRepo);

        this.router.use(`${API_URL}/:teamId`, chr.routes());
    }
}

export class ChannelRouter {
    constructor(private router: Router, private channelRepo: ChannelRepository) {}

    public routes() {
        const channelRouter = this.router;

        channelRouter.post('/channels', this.create);
        channelRouter.delete('/channels', this.delete);

        return channelRouter;
    }

    private async delete(req: Request, res: Response) {
        const { teamId, channelId } = req.params;
        await this.channelRepo.delete(teamId, channelId);
        res.send({ data: true });
        return;
    }

    private async create(req: Request, res: Response) {
        const { teamId } = req.params;
        const { channel } = req.body;
        await this.channelRepo.create(teamId, channel);
        res.send({ data: true });
        return;
    }
}
