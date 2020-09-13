import { Block, KnownBlock } from '@slack/bolt';

export interface Component {
    render(): KnownBlock | Block;
}
