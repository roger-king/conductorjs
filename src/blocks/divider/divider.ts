import { Component } from '../base';
import { DividerBlock } from '@slack/bolt';

export class Divider implements Component {
    render(): DividerBlock {
        return {
            type: 'divider',
        };
    }
}
