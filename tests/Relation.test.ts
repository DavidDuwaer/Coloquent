import {assert, expect} from 'chai';
import * as moxios from 'moxios';
import {Hero} from './model1/dummy/Hero';

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
        assert.equal(model.friends().getReferringObject(), model);
    });

    it('knows its own name', () => {
        assert.equal(model.friends().getName(), 'friends');
    });

    it('knows its own name when overridden', () => {
        assert.equal(model.foes().getName(), 'enemies');
    });

    it('yields a query with "\<base class\>/\<relation class\>" at the start of the URL', (done) => {
        model
            .friends()
            .get();

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();
            assert.equal(request.url.split('?')[0], model.getJsonApiBaseUrl()+'/heros/friends');
            done();
        });
    });

    it('yields a query with "<base class\>/<\<base id\>/\<relation class\>" at the start of the URL when an id is provided when using ToManyRelation', (done) => {
        model.setApiId('superman');

        model
            .friends()
            .get();

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();
            assert.equal(request.url.split('?')[0], model.getJsonApiBaseUrl()+'/heros/superman/friends');
            done();
        });
    });

    it('yields a query with "<base class\>/<\<base id\>/\<relation class\>" at the start of the URL when an id is provided when using ToOneRelation', (done) => {
        model.setApiId('superman');

        model
            .rival()
            .get();

        moxios.wait(() => {
            let request = moxios.requests.mostRecent();
            assert.equal(request.url.split('?')[0], model.getJsonApiBaseUrl()+'/heros/superman/rival');
            done();
        });
    });
});
