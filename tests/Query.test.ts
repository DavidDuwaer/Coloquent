import {Query} from './../lib/Query';
import {assert} from 'chai';
import {FilterSpec} from "../lib/FilterSpec";
import {Option} from "../lib/Option";
import {OffsetBasedPaginationSpec} from "../lib/paginationspec/OffsetBasedPaginationSpec";
import {SortSpec} from "../lib/SortSpec";
import {Hero} from "./dummy/Hero";

describe('Query', () => {
    let model;
    let query;

    beforeEach(() => {
        model = new Hero();
        query = new Query(model.getJsonApiType());
        query.setPaginationSpec(
            new OffsetBasedPaginationSpec(
                Hero.getPaginationOffsetParamName(),
                Hero.getPaginationLimitParamName(),
                Hero.getPageSize()
            )
        )
    });

    it('should return only jsonapitype when there are no parameters set', () => {
        assert.equal(query.toString(), model.getJsonApiType());
    });

    it('filter parameters should nest under filter key', () => {
        let filters = [
            new FilterSpec('name', 'Bob'),
            new FilterSpec('age', '99'),
        ];

        for (let filter of filters) {
            query.addFilter(filter);
        }

        assert.equal(query.toString(), model.getJsonApiType()+'?filter%5Bname%5D=Bob&filter%5Bage%5D=99');
    });

    it('include parameters should nest under include key', () => {
        for (let include of ['weapons', 'costume']) {
            query.addInclude(include);
        }

        assert.equal(query.toString(), model.getJsonApiType()+'?include=weapons%2Ccostume');
    });

    it('option parameters should append to the query string', () => {
        let options = [
            new Option('name', 'Bob'),
            new Option('age', '99'),
        ];

        for (let option of options) {
            query.addOption(option);
        }

        assert.equal(query.toString(), model.getJsonApiType()+'?name=Bob&age=99');
    });

    it('pagination parameters should nest under page key', () => {
        let pageSpec = new OffsetBasedPaginationSpec('offset', 'limit', 10);
        pageSpec.setPage(1);

        query.setPaginationSpec(pageSpec);

        assert.equal(query.toString(), model.getJsonApiType()+'?page%5Boffset%5D=0&page%5Blimit%5D=10');
    });

    it('sort parameters should append to sort key', () => {
        let sorts = [
            new SortSpec('name', true),
            new SortSpec('age', false),
        ];

        for (let sort of sorts) {
            query.addSort(sort);
        }

        assert.equal(query.toString(), model.getJsonApiType()+'?sort=name%2C-age');
    });
});