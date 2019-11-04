import {assert, expect} from 'chai';
import {Hero} from './dummy/Hero';
import * as moxios from 'moxios';
import {Model, SingularResponse} from "../../dist";
import {SaveResponse} from "../../dist";
import {AxiosInstance} from "axios";

describe('Model2', () => {
    let superHero: Hero;

    beforeEach(() => {
        moxios.install();
        superHero = new Hero();
    });

    afterEach(() => {
        moxios.uninstall();
    });

    it('should be able to initiate', () => {
        expect(superHero).to.be.an.instanceof(Model);
    });

    it('should set default properties', () => {
        /** @see Hero */
        expect(superHero.getJsonApiType()).to.equal('heros');

        /** @see BaseModel */
        expect(superHero.getJsonApiBaseUrl()).to.equal('http://coloquent.app/api/');
    });

    it('should have an orderBy method', (done) => {
        Hero
            .orderBy('name')
            .get();

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();

            assert.equal(request.config.method, 'get');
            assert.include(request.url, 'sort=name');

            done();
        });
    });

    it('should properly run its save() method when it has no ID', () => {
        superHero.save();
    });

    it('should properly run its save() method when it has an ID', () => {
        superHero.setApiId(Math.floor(Math.random()*10000).toString());
        superHero.save();
    });

    it('should include the ID in the payload for save() when it has one', (done) => {
        let id = Math.floor(Math.random()*10000).toString();
        superHero.setApiId(id);
        superHero.save();

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();
            assert.equal(JSON.parse(request.config.data).data.id, id);

            done();
        });
    });

    it('should NOT include the ID in the payload for save() when it has no ID', (done) => {
        superHero.save();

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();
            assert.isUndefined(JSON.parse(request.config.data).data['id'])

            done();
        });
    });

    it('should pass a proper response object to its save() promise callback when id was set', (done) => {
        superHero.setApiId(Math.floor(Math.random()*10000).toString());
        superHero.save()
            .then(function (response: SaveResponse) {
                assert.equal(superHero.getApiId(), response.getModelId());

                done();
            });

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();

            request.respondWith({
                response: {
                    data: {
                        type: superHero.getJsonApiType(),
                        id: superHero.getApiId(),
                        attributes: superHero.getAttributes()
                    }
                }
            });
        });
    });

    it('should pass a proper response object to its save() promise callback when id was not set', (done) => {
        let id: string = Math.floor(Math.random()*10000).toString();
        superHero.save()
            .then(function (response: SaveResponse) {
                assert.equal(id, response.getModelId());

                done();
            });

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();

            request.respondWith({
                response: {
                    data: {
                        type: superHero.getJsonApiType(),
                        id: id,
                        attributes: superHero.getAttributes()
                    }
                }
            });
        });
    });

    it('should update in ID when it had none and gets saved', (done) => {
        let id: string = Math.floor(Math.random()*10000).toString();
        expect(null, superHero.getApiId());
        superHero.save()
            .then(function (response: SaveResponse) {
                assert.equal(id, response.getModelId());
                assert.equal(id, superHero.getApiId());
                done();
            });

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();

            request.respondWith({
                response: {
                    data: {
                        type: superHero.getJsonApiType(),
                        id: id,
                        attributes: superHero.getAttributes()
                    }
                }
            })
        });
    });

    it('should properly run its create() method when it has an ID', () => {
        superHero.setApiId(Math.floor(Math.random()*10000).toString());
        superHero.create();
    });

    it('should include the ID in the payload for create() when it has one', (done) => {
        let id = Math.floor(Math.random()*10000).toString();
        superHero.setApiId(id);
        superHero.create();

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();
            assert.equal(JSON.parse(request.config.data).data.id, id);

            done();
        });
    });

    it('should NOT include the ID in the payload for create() when it has no ID', (done) => {
        superHero.create();

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();
            assert.isUndefined(JSON.parse(request.config.data).data['id'])

            done();
        });
    });

    it('should pass a proper response object to its create() promise callback', (done) => {
        superHero.setApiId(Math.floor(Math.random()*10000).toString());
        superHero.create()
            .then(function (response: SaveResponse) {
                assert.equal(superHero.getApiId(), response.getModelId());

                done();
            });

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();

            request.respondWith({
                response: {
                    data: {
                        type: superHero.getJsonApiType(),
                        id: superHero.getApiId(),
                        attributes: superHero.getAttributes()
                    }
                }
            });
        });
    });

    it('should allow a header to be set', (done) => {
        let httpClient: AxiosInstance = Hero.getHttpClient().getImplementingClient();
        httpClient.defaults.headers.authentication = 'someAuthenticationHeader5636rt3';
        Hero.find('1');

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();

            assert.equal(request.headers.authentication, 'someAuthenticationHeader5636rt3');

            assert.notEqual(request.headers.authentication, 'asdfasdf');

            done();
        });
    });
    
    it('fresh method should reload the resource data from the backend', (done) => {
        Hero
            .first()
            .then((response: SingularResponse) => {
                let hero = <Hero> response.getData();
                hero.setName('Joel');

                hero
                    .fresh()
                    .then((antihero: Hero) => {
                        assert.instanceOf(antihero, Hero);
                        assert.equal(hero.getName(), 'Joel');
                        assert.equal(antihero.getName(), 'Bob');
                        assert.equal(hero.getApiId(), antihero.getApiId());

                        done();
                    })
                    .catch(error => done(error));
            })
            .catch(error => done(error));

        moxios.wait(() => {
            let heroRequest = moxios.requests.mostRecent();
            let responseData = {
                response: {
                    data: [
                        {
                            type: superHero.getJsonApiType(),
                            id: 1,
                            attributes: {
                                name: 'Bob'
                            }
                        }
                    ]
                }
            };

            heroRequest.respondWith(responseData);

            moxios.wait(() => {
                let antiheroRequest = moxios.requests.mostRecent();
                antiheroRequest.respondWith(responseData);
            });
        });
    });

    it('fresh method should keep the loaded relations', (done) => {
        Hero
            .with('friends')
            .first()
            .then((response: SingularResponse) => {
                let hero = <Hero> response.getData();

                hero
                    .fresh();
            })
            .catch(error => done(error));

        moxios.wait(() => {
            let heroRequest = moxios.requests.mostRecent();
            let responseData = {
                response: {
                    data: [
                        {
                            type: superHero.getJsonApiType(),
                            id: 1,
                            attributes: {
                                name: 'Bob'
                            },
                            relationships: {
                                friends: {
                                    data: [
                                        {
                                            type: "heroes",
                                            id: "3"
                                        }
                                    ]
                                },
                            }
                        }
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
            };

            heroRequest.respondWith(responseData);

            moxios.wait(() => {
                let antiheroRequest = moxios.requests.mostRecent();
                assert.include(antiheroRequest.url, 'include=friends');
                done();
            });
        });
    });

    it('fresh method should create a new and empty instance of model when it does not have an ID', (done) => {
        let hero = new Hero();
        
        hero.setName('Bob');

        hero
            .fresh()
            .then((antihero: Hero) => {
                assert.instanceOf(antihero, Hero);
                assert.isFalse(hero === antihero);
                assert.equal(antihero.getName(), null);
                assert.equal(hero.getName(), 'Bob');
                done();
            })
            .catch(error => done(error)); 
    });
});
