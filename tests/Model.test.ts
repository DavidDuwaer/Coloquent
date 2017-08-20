import {expect} from 'chai';
import {Hero} from './dummy/Hero';
import {Model} from '../lib/Model';

describe('Model', () => {
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
});