import {assert, expect} from 'chai';
import {Hero} from './dummy/Hero';
import {Model} from '../lib/Model';
import {SaveResponse} from "../lib/response/SaveResponse";
import * as moxios from 'moxios';

describe('Model', () => {

    beforeEach(() => {
        moxios.install();
    });

    afterEach(() => {
        moxios.uninstall();
    });

    it('should be able to initiate', () => {
        let superHero = new Hero();

        expect(superHero).to.be.an.instanceof(Model);
    });

    it('should set default properties', () => {
        let superHero = new Hero();

        /** @see Hero */
        expect(superHero.getJsonApiType()).to.equal('heros');

        /** @see BaseModel */
        expect(superHero.getJsonApiBaseUrl()).to.equal('http://coloquent.app/api/');
    });

    it('should properly run its save() method when it has no ID', () => {
        let superHero = new Hero();
        superHero.save();
    });

    it('should properly run its save() method when it has an ID', () => {
        let superHero = new Hero();
        superHero.setApiId(Math.floor(Math.random()*10000).toString());
        superHero.save();
    });

    it('should pass a proper response object to its save() promise callback when id was set', (done) => {
        let superHero = new Hero();
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
        let superHero = new Hero();
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
});