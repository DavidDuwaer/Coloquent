import {assert, expect} from 'chai';
import * as moxios from 'moxios';
import {Hero} from './dummy/Hero';
import {Builder} from '../lib/Builder';
import {PaginationStrategy} from "../lib/PaginationStrategy";

describe('Builder', () => {
    let builder;

    beforeEach(() => {
        moxios.install();
        builder = new Builder(Hero);
    });

    afterEach(() => {
       moxios.uninstall();
    });

    it('get method should add pagination parameters to the resource uri query string', (done) => {
        builder.get();

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();

            assert.equal(request.config.method, 'get');
            assert.equal(request.url, 'http://coloquent.app/api/heros?page[offset]=0&page[limit]=50');

            done();
        });
    });

    // TODO: add first method test here

    it('find method should append argument to the resource uri', (done) => {
        builder.find('007');

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();

            assert.equal(request.config.method, 'get');
            assert.equal(request.url, 'http://coloquent.app/api/heros/007');

            done();
        });
    });

    it('where method should add filter parameters to query string', (done) => {
        builder
            .where('name', 'Bob')
            .get();

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();

            assert.equal(request.config.method, 'get');
            assert.include(request.url, 'filter[name]=Bob');

            done();
        });
    });

    it('with method should add include parameters to query string', (done) => {
        builder
            .with('weapons')
            .get();

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();

            assert.equal(request.config.method, 'get');
            assert.include(request.url, 'include=weapons');

            done();
        });
    });

    it('with method should allow adding multiple includes as an array', (done) => {
        builder
            .with(['weapons', 'costume'])
            .get();

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();

            assert.equal(request.config.method, 'get');
            assert.include(request.url, 'include=weapons,costume');

            done();
        });
    });

    it('with method should throw an exception when the argument is invalid', () => {
        expect(() => {
            let invalid = {};

            builder
                .with(invalid)
                .get();

        }).to.throw('The argument for \'with\' must be a string or an array of strings.');
    });

    it('orderBy method should add order parameters to query string', (done) => {
        builder
            .orderBy('name')
            .get();

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();

            assert.equal(request.config.method, 'get');
            assert.include(request.url, 'sort=name');

            done();
        });
    });

    it('orderBy method should allow sort direction as the second parameter and prepend value with - when it is descending', (done) => {
        builder
            .orderBy('name', 'desc')
            .get();

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();

            assert.equal(request.config.method, 'get');
            assert.include(request.url, 'sort=-name');

            done();
        });
    });

    it('orderBy method should throw an exception when the sort direction is invalid', () => {
        expect(() => {
            builder
                .orderBy('name', 'invalid')
                .get();

        }).to.throw('The \'direction\' parameter must be string of value \'asc\' or \'desc\'.');
    });

    it('option method should allow adding parameters to query string', (done) => {
        builder
            .option('foo', 'bar')
            .get();

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();

            assert.equal(request.config.method, 'get');
            assert.include(request.url, 'foo=bar');

            done();
        });
    });

    it('default pagination strategy is limit-offset', (done) => {
        builder
            .get(2);

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();

            assert.include(request.url, 'page[limit]');
            assert.include(request.url, 'page[offset]');

            done();
        })
    });

    it('pagination strategy limit-offset properly serializes pagination spec', (done) => {
        let page: number = Math.round(Math.random() * 100) + 2;
        let limit: number = Hero.getPageSize();
        builder
            .get(page);

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();

            assert.include(request.url, 'page[limit]='+limit);
            assert.include(request.url, 'page[offset]='+(page-1)*limit);

            done();
        })
    });

    it('pagination strategy pagesize-pagenumber properly serializes pagination spec', (done) => {
        Hero.setPaginationStrategy(PaginationStrategy.PageBased);
        builder = new Builder(Hero);
        let page: number = Math.round(Math.random() * 100) + 2;
        let limit: number = Hero.getPageSize();
        builder
            .get(page);

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();

            assert.include(request.url, 'page[size]='+limit);
            assert.include(request.url, 'page[number]='+page);

            done();
        })
    });
});