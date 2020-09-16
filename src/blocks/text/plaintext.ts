import { PlainTextElement } from '@slack/bolt';
import { Component } from '../base';

export class PlainText implements Component {
    constructor(private text: string, private emoji?: boolean) {}
    render(): PlainTextElement {
        return {
            type: 'plain_text',
            text: this.text,
            emoji: this.emoji !== undefined ? this.emoji : false,
        };
    }
}
