import { Router } from 'express';
import { API_URL } from './constants';

export class ChannelRouter {
    private router: Router;

    constructor(router: Router) {
        this.router = router;
    }

    set() {
        this.router.get(`${API_URL}/:teamId/channels`, () => {});
    }
}
