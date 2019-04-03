import {assert} from 'chai';
import {Hero} from "./model1/dummy/Hero";
import {Query} from "../dist/Query";
import {OffsetBasedPaginationSpec} from "../dist/paginationspec/OffsetBasedPaginationSpec";
import {FilterSpec} from "../dist/FilterSpec";
import {SortSpec} from "../dist/SortSpec";
import {Option} from "../dist/Option";

describe('Query', () => {
    let model;
    let query: Query;

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

    it('pagination parameters do not always have to nest under page key', () => {
        let pageSpec = new OffsetBasedPaginationSpec('foo', 'bar', 10);
        pageSpec.setPage(1);

        query.setPaginationSpec(pageSpec);

        assert.equal(query.toString(), model.getJsonApiType()+'?foo=0&bar=10');
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
