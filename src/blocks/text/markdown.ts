import { Component } from '../base';
import { MrkdwnElement } from '@slack/bolt';

export class MarkDown implements Component {
    constructor(private text: string) {}

    render(): MrkdwnElement {
        return {
            type: 'mrkdwn',
            text: this.text,
        };
    }
}
