import _ from 'lodash';

export function formatDate(input) {
    if (input) {
        const droppedTime = _.split(input, 'T', 1);
        const [year, month, date] = _.split(droppedTime, '-');
        return `${date}.${month}.${year}`;
    }
    return '';
}