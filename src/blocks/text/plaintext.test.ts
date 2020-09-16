import { PlainText } from './plaintext';
import { PlainTextElement } from '@slack/bolt';

describe('Plaintext', () => {
    const expectedPlainTextBlock: PlainTextElement = {
        type: 'plain_text',
        text: 'hello',
        emoji: false,
    };

    test('it should render a slack plaintext block', () => {
        const plaintext = new PlainText('hello');
        expect(plaintext.render()).toStrictEqual(expectedPlainTextBlock);
    });
});
