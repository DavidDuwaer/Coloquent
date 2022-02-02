import {assert, expect} from 'chai';
import {Hero} from './dummy/Hero';
import * as moxios from 'moxios';
import {Model} from "../../dist";
import {SaveResponse} from "../../dist";
import {AxiosInstance} from "axios";

describe('Model1', () => {
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
        expect(superHero.getJsonApiBaseUrl()).to.equal('http://coloquent.app/api');
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
        let httpClient: AxiosInstance = Hero.effectiveHttpClient.getImplementingClient();
        httpClient.defaults.headers.authentication = 'someAuthenticationHeader5636rt3';
        Hero.find('1');

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();

            assert.equal(request.headers.authentication, 'someAuthenticationHeader5636rt3');

            assert.notEqual(request.headers.authentication, 'asdfasdf');

            done();
        });
    });

    it('serializes a toOne relation when saving', (done) => {
        const hero = new Hero();
        hero.setName('MeatMan');

        const rival = new Hero();
        rival.setApiId(Math.floor(Math.random()*10000).toString());

        hero.setRelation('rival', rival);
        hero.save();

        moxios.wait(() => {
            const request = moxios.requests.mostRecent();
            const requestBody = JSON.parse(request.config.data);
            const relationships = requestBody.data.relationships;

            expect(relationships.rival.data).to.be.an('object');
            expect(relationships.rival.data.id).to.equal(rival.getApiId());
            done();
        })
    });

    it('serializes a toMany relation when saving', (done) => {
        const hero = new Hero();
        hero.setName('MeatMan');

        const friendA = new Hero();
        friendA.setApiId(Math.floor(Math.random()*10000).toString());

        const friendB = new Hero();
        friendB.setApiId(Math.floor(Math.random()*10000).toString());

        hero.setRelation('friends', [friendA, friendB]);
        hero.save();

        moxios.wait(() => {
            const request = moxios.requests.mostRecent();
            const requestBody = JSON.parse(request.config.data);
            const relationships = requestBody.data.relationships;

            expect(relationships.friends.data).to.be.an('Array');
            expect(relationships.friends.data.length).to.equal(2);
            expect(relationships.friends.data[0].id).to.equal(friendA.getApiId());
            expect(relationships.friends.data[1].id).to.equal(friendB.getApiId());

            done();
        });
    });

    it('should have the application/vnd.api+json content-type in the header', (done) => {
        const hero = new Hero();
        hero.setName('MeatMan');

        hero.save();

        moxios.wait(() => {
            const request = moxios.requests.mostRecent();
            const headers = request.headers;

            expect(headers['Content-Type']).to.equal('application/vnd.api+json');

            done();
        })
    })
});
