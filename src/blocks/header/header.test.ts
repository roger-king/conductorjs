import { HeaderBlock } from '@slack/bolt';

import { Header } from './header';
import { PlainText } from '../text';

describe('Header', () => {
    const plainText = new PlainText('hello');

    const expectedHeader: HeaderBlock = {
        type: 'header',
        text: {
            type: 'plain_text',
            text: 'hello',
            emoji: false,
        },
    };

    it('renders a header component', () => {
        const header = new Header(plainText);
        expect(header.render()).toMatchObject(expectedHeader);
    });
});
