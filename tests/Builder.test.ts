import {assert, expect} from 'chai';
import * as chai from 'chai';
import * as moxios from 'moxios';
import * as chaip from 'chai-as-promised';
import {Hero} from './model1/dummy/Hero';
import {Builder} from "../dist";
import {PaginationStrategy} from "../dist";
import {Response} from "../dist";
import {PluralResponse} from "../dist";
import {SortDirection} from "../dist";

chai.use(<any> chaip);

describe('Builder', () => {
    let builder: Builder;

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
            assert.equal(request.url, 'http://coloquent.app/api/heros?page%5Boffset%5D=0&page%5Blimit%5D=50');

            done();
        });
    });

    // TODO: add first method test here

    it('find method should append argument to the resource uri', (done) => {
        builder.find(7);

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();

            assert.equal(request.config.method, 'get');
            assert.equal(request.url, 'http://coloquent.app/api/heros/7');

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
            assert.include(request.url, 'filter%5Bname%5D=Bob');

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
            assert.include(request.url, 'include=weapons%2Ccostume');

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

    it('orderBy method should allow sort direction string as the second parameter - case ASC', (done) => {
        builder
            .orderBy('name', 'asc')
            .get();

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();

            assert.equal(request.config.method, 'get');
            assert.include(request.url, 'sort=name');

            done();
        });
    });

    it('orderBy method should allow sort direction string as the second parameter - case DESC', (done) => {
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

    it('orderBy method should allow sort direction enum as the second parameter - case ASC', (done) => {
        builder
            .orderBy('name', SortDirection.ASC)
            .get();

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();

            assert.equal(request.config.method, 'get');
            assert.include(request.url, 'sort=name');

            done();
        });
    });

    it('orderBy method should allow sort direction enum as the second parameter - case DESC', (done) => {
        builder
            .orderBy('name', SortDirection.DESC)
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

        }).to.throw();
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

            assert.include(request.url, 'page%5Blimit%5D');
            assert.include(request.url, 'page%5Boffset%5D');

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

            assert.include(request.url, 'page%5Blimit%5D='+limit);
            assert.include(request.url, 'page%5Boffset%5D='+(page-1)*limit);

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

            assert.include(request.url, 'page%5Bsize%5D='+limit);
            assert.include(request.url, 'page%5Bnumber%5D='+page);

            done();
        })
    });

    it('pagination strategy pagesize-pagenumber properly serializes pagination spec', (done) => {
        Hero.setPaginationStrategy(PaginationStrategy.PageBased);
        let id: string = Math.floor(Math.random()*10000).toString();
        builder = new Builder(Hero);
        let page: number = Math.round(Math.random() * 100) + 2;
        let limit: number = Hero.getPageSize();
        builder
            .get(page)
            .then(function (response: Response) {
                assert.equal(page, (<PluralResponse> response).getPageNumber());
                done();
            });

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();
            request.respondWith({
                response: {
                    data: [{
                        type: (new Hero()).getJsonApiType(),
                        id: id,
                        attributes: {}
                    }]
                }
            })
        });
    });

    it('PluralResponse exposes underlying http client\'s response object', (done) => {
        Hero.setPaginationStrategy(PaginationStrategy.PageBased);
        let id: string = Math.floor(Math.random()*10000).toString();
        builder = new Builder(Hero);
        let page: number = Math.round(Math.random() * 100) + 2;
        let limit: number = Hero.getPageSize();
        builder
            .get(page)
            .then(function (response: PluralResponse) {
                assert.isNotNull(response.getHttpClientResponse());
                done();
            });

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();
            request.respondWith({
                response: {
                    data: [{
                        type: (new Hero()).getJsonApiType(),
                        id: id,
                        attributes: {}
                    }]
                }
            })
        });
    });

    it('goes to catch clause when an exception is thrown', (done) => {
        Hero.setPaginationStrategy(PaginationStrategy.PageBased);
        let id: string = Math.floor(Math.random()*10000).toString();
        builder = new Builder(Hero);
        let page: number = Math.round(Math.random() * 100) + 2;
        let limit: number = Hero.getPageSize();
        let visitedCatchClause = false;
        builder
            .get(page)
            .then(function (response: PluralResponse) {
                return response;
            })
            .catch((response: PluralResponse) => {
                visitedCatchClause = true;
                return response;
            })
            .then((response: PluralResponse) => {
                assert(visitedCatchClause);
                done();
            });

        moxios.wait(() => {
            moxios.requests.mostRecent()
                .respondWith({
                    status: 401
                })
        });
    });

    it('throws an exception when no catch clause is registered', () => {
        Hero.setPaginationStrategy(PaginationStrategy.PageBased);
        let id: string = Math.floor(Math.random()*10000).toString();
        builder = new Builder(Hero);
        let page: number = Math.round(Math.random() * 100) + 2;

        moxios.wait(() => {
            moxios.requests.mostRecent()
                .respondWith({
                    status: 501
                });
        });

        return expect(builder.get(page)).to.be.rejected;
    });

    it('throws no exception when catch clause is registered', () => {
        Hero.setPaginationStrategy(PaginationStrategy.PageBased);
        let id: string = Math.floor(Math.random()*10000).toString();
        builder = new Builder(Hero);
        let page: number = Math.round(Math.random() * 100) + 2;

        moxios.wait(() => {
            moxios.requests.mostRecent()
                .respondWith({
                    status: 504
                });
        });

        return expect(builder.get(page).catch(response => Promise.resolve())).to.be.fulfilled;
    });


    it('should allow you to get a Builder with the correct modelType from a model instance with .query()', (done) => {
        const hero = new Hero();
        hero
            .query()
            .with('foes')
            .get()
            .then((response: PluralResponse) => {
                let beefMan: Hero = <Hero> response.getData()[0];
                let foes = beefMan.getFoes();
                assert(foes !== undefined);
                assert(foes !== null);
                assert(Array.isArray(foes));
                assert(foes.length === 1);

                done();
            });

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();
            request.respondWith({
                response: {
                    data: [
                        {
                            type: "heroes",
                            id: "1",
                            attributes: {
                                name: "BeefMan"
                            },
                            relationships: {
                                foes: {
                                    data: [
                                        {
                                            type: "heroes",
                                            id: "3"
                                        }
                                    ]
                                },
                            }
                        },
                    ],
                    included: [
                        {
                            type: "heroes",
                            id: "3",
                            attributes: {
                                name: "EggplantMan"
                            }
                        },
                    ]
                }
            })
        });
    });
});