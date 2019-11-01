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

    it('get method with limit 3 should restrict response to 3 results', (done) => {
        builder
            .limit(2)
            .get()
            .then(function(response: PluralResponse) {
                let heros = response.getData();

                assert.equal(heros.length, 2);

                done();
            })
            .catch(error => done(error));

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();
            let jsonApiType = (new Hero()).getJsonApiType();

            request.respondWith({
                response: {
                    data: [
                        {
                            type: jsonApiType,
                            id: 1,
                            attributes: {
                                name: 'John'
                            }
                        },
                        {
                            type: jsonApiType,
                            id: 2,
                            attributes: {
                                name: 'Paul'
                            }
                        },
                        {
                            type: jsonApiType,
                            id: 3,
                            attributes: {
                                name: 'Ringo'
                            }
                        },
                    ]
                }
            })
        });
    });

    it('get method with limit bigger than response\'s length should return all results', (done) => {
        builder
            .limit(5)
            .get()
            .then(function(response: PluralResponse) {
                let heros = response.getData();

                assert.equal(heros.length, 3);

                done();
            })
            .catch(error => done(error));

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();
            let jsonApiType = (new Hero()).getJsonApiType();

            request.respondWith({
                response: {
                    data: [
                        {
                            type: jsonApiType,
                            id: 1,
                            attributes: {
                                name: 'John'
                            }
                        },
                        {
                            type: jsonApiType,
                            id: 2,
                            attributes: {
                                name: 'Paul'
                            }
                        },
                        {
                            type: jsonApiType,
                            id: 3,
                            attributes: {
                                name: 'Ringo'
                            }
                        },
                    ]
                }
            })
        });
    });

    it('get method with limit 0 should return no results', (done) => {
        builder
            .limit(0)
            .get()
            .then(function(response: PluralResponse) {
                let heros = response.getData();

                assert.equal(heros.length, 0);

                done();
            })
            .catch(error => done(error));

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();
            let jsonApiType = (new Hero()).getJsonApiType();

            request.respondWith({
                response: {
                    data: [
                        {
                            type: jsonApiType,
                            id: 1,
                            attributes: {
                                name: 'John'
                            }
                        },
                        {
                            type: jsonApiType,
                            id: 2,
                            attributes: {
                                name: 'Paul'
                            }
                        },
                        {
                            type: jsonApiType,
                            id: 3,
                            attributes: {
                                name: 'Ringo'
                            }
                        },
                    ]
                }
            })
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

    it('where method applied before clone should generate same url result', (done) => {
        moxios.requests.reset();

        builder.where('foo', 'bar');
        let builderClone = builder;

        builder
            .get();

        builderClone
            .get();

        moxios.wait(() => {
            let request = moxios.requests.at(0);
            let requestClone = moxios.requests.at(1);

            assert.equal(request.url, requestClone.url);
            done();
        });
    });

    it('where method applied after clone should generate different url result', (done) => {
        moxios.requests.reset();

        let builderClone = builder;

        builder
            .where('name', 'Bob')
            .get();

        builderClone
            .where('name', 'Josh')
            .get();

        moxios.wait(() => {
            let request = moxios.requests.at(0);
            let requestClone = moxios.requests.at(1);

            assert.notEqual(request.url, requestClone.url);
            
            assert.notInclude(request.url, 'filter%5Bname%5D=Josh');
            assert.notInclude(requestClone.url, 'filter%5Bname%5D=Bob');

            assert.include(request.url, 'filter%5Bname%5D=Bob');
            assert.include(requestClone.url, 'filter%5Bname%5D=Josh');

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

    it('with method applied before clone should generate same url result', (done) => {
        moxios.requests.reset();
        
        builder
            .with('weapons');
        
        let builderClone = builder;
        
        builder
            .get();

        builderClone
            .get();

        moxios.wait(() => {
            let request = moxios.requests.at(0);
            let cloneRequest = moxios.requests.at(1);

            assert.equal(request.url, cloneRequest.url);

            done();
        });
    });

    it('with method applied after clone should generate different url result', (done) => {
        moxios.requests.reset();
        
        let builderClone = builder;
        
        builder
            .with('weapons')
            .get();

        builderClone
            .with('costume')
            .get();

        moxios.wait(() => {
            let request = moxios.requests.at(0);
            let requestClone = moxios.requests.at(1);

            assert.notInclude(request.url, 'include=costume');
            assert.notInclude(requestClone.url, 'include=weapons');

            assert.include(request.url, 'include=weapons');
            assert.include(requestClone.url, 'include=costume');

            done();
        });
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

    it('orderBy method applied before clone should generate same url result', (done) => {
        moxios.requests.reset();
        
        builder
            .orderBy('name');

        let builderClone = builder;

        builder
            .get();

        builderClone
            .get();

        moxios.wait(() => {
            let request = moxios.requests.at(0);
            let requestClone = moxios.requests.at(1);

            assert.equal(request.url, requestClone.url);

            done();
        });
    });

    it('orderBy method applied after clone should generate different url result', (done) => {
        moxios.requests.reset();

        let builderClone = builder;

        builder
            .orderBy('name')
            .get();

        builderClone
            .orderBy('foo')
            .get();

        moxios.wait(() => {
            let request = moxios.requests.at(0);
            let requestClone = moxios.requests.at(1);

            assert.notInclude(request.url, 'sort=foo');
            assert.notInclude(requestClone.url, 'sort=name');

            assert.include(request.url, 'sort=name');
            assert.include(requestClone.url, 'sort=foo');

            done();
        });
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

    it('option method applied before clone should generate same url result', (done) => {
        moxios.requests.reset();
        
        builder
            .option('foo', 'bar');

        let builderClone = builder;

        builder
            .get();

        builderClone
            .get();

        moxios.wait(() => {
            let request = moxios.requests.at(0);
            let requestClone = moxios.requests.at(1);

            assert.equal(request.url, requestClone.url);

            done();
        });
    });

    it('option method applied after clone should generate different url result', (done) => {
        moxios.requests.reset();

        let builderClone = builder;

        builder
            .option('foo', 'bar')
            .get();

        builderClone
            .option('baz', 'qux')
            .get();

        moxios.wait(() => {
            let request = moxios.requests.at(0);
            let requestClone = moxios.requests.at(1);

            assert.notInclude(request.url, 'baz=qux');
            assert.notInclude(requestClone.url, 'foo=bar');

            assert.include(request.url, 'foo=bar');
            assert.include(requestClone.url, 'baz=qux');

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