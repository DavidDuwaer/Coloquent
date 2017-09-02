import {Query} from './../lib/Query';
import {assert} from 'chai';
import {FilterSpec} from "../lib/FilterSpec";
import {Option} from "../lib/Option";
import {OffsetBasedPaginationSpec} from "../lib/paginationspec/OffsetBasedPaginationSpec";
import {SortSpec} from "../lib/SortSpec";

describe('Query', () => {
    let query;

    beforeEach(() => {
        query = new Query();
    });

    it('should return an empty string when there are no parameters set', () => {
        assert.equal(query.toString(), '');
    });

    it('filter parameters should nest under filter key', () => {
        let filters = [
            new FilterSpec('name', 'Bob'),
            new FilterSpec('age', '99'),
        ];

        query.setFilterParameters(filters);

        assert.equal(query.toString(), '?filter%5Bname%5D=Bob&filter%5Bage%5D=99');
    });

    it('include parameters should nest under include key', () => {
        query.setIncludeParameters(['weapons', 'costume']);

        assert.equal(query.toString(), '?include=weapons%2Ccostume');
    });

    it('option parameters should append to the query string', () => {
        let options = [
            new Option('name', 'Bob'),
            new Option('age', '99'),
        ];

        query.setOptionsParameters(options);

        assert.equal(query.toString(), '?name=Bob&age=99');
    });

    it('pagination parameters should nest under page key', () => {
        let pageSpec = new OffsetBasedPaginationSpec('offset', 'limit', 10);
        pageSpec.setPage(1);

        query.setPaginationParameters(pageSpec);

        assert.equal(query.toString(), '?page%5Boffset%5D=0&page%5Blimit%5D=10');
    });

    it('sort parameters should append to sort key', () => {
        let orderBy = [
            new SortSpec('name', true),
            new SortSpec('age', false),
        ];

        query.setSortParameters(orderBy);

        assert.equal(query.toString(), '?sort=name%2C-age');
    });
});