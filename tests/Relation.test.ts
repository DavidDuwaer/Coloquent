import {assert, expect} from 'chai';
import * as moxios from 'moxios';
import {Hero} from './dummy/Hero';
import {Builder} from '../lib/Builder';
import {PaginationStrategy} from "../lib/PaginationStrategy";
import {PluralResponse} from "../lib/response/PluralResponse";

describe('Relation', () => {
    let model;

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
});