import {assert, expect} from 'chai';
import * as moxios from 'moxios';
import {Hero} from './dummy/Hero';
import {Builder} from '../lib/Builder';
import {PaginationStrategy} from "../lib/PaginationStrategy";
import {PluralResponse} from "../lib/response/PluralResponse";
import {split} from "ts-node/dist";

describe('Relation', () => {
    let model: Hero;

    beforeEach(() => {
        moxios.install();
        model = new Hero();
    });

    afterEach(() => {
        moxios.uninstall();
    });

    it('successufly stores its referring object', () => {
        assert.equal(model, model.friends().getReferringObject());
    });

    it('knows its own name', () => {
        assert.equal('friends', model.friends().getName());
    });

    it('knows its own name when overridden', () => {
        assert.equal('enemies', model.foes().getName());
    });

    it('yields a query with "\<base class\>/\<relation class\>" at the start of the URL', (done) => {
        model
            .friends()
            .get();

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();
            assert.equal(request.url.split('?')[0], model.getJsonApiBaseUrl()+'heros/friends');
            done();
        });
    });
});