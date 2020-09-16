import { MarkDown } from './markdown';
import { MrkdwnElement } from '@slack/bolt';

describe('MarkDown', () => {
    const expectedMarkDownBlock: MrkdwnElement = {
        type: 'mrkdwn',
        text: 'hello',
    };

    test('it should render a slack markdown block', () => {
        const mrkdwn = new MarkDown('hello');
        expect(mrkdwn.render()).toStrictEqual(expectedMarkDownBlock);
    });
});
