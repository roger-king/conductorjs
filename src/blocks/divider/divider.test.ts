import { Divider } from '..';
import { DividerBlock } from '@slack/bolt';

const expectedDividerBlock: DividerBlock = {
    type: 'divider',
};

describe('Divider', () => {
    test('it should render a divider block', () => {
        const divider = new Divider();
        expect(divider.render()).toStrictEqual(expectedDividerBlock);
    });
});
