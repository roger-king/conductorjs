import { HeaderBlock } from '@slack/bolt';
import { Component } from '../base';
import { PlainText } from '../text';

export class Header implements Component {
    constructor(private text: PlainText) {}

    render(): HeaderBlock {
        return {
            type: 'header',
            text: this.text.render(),
        };
    }
}
