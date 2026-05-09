import {assert, expect} from 'chai';
import {fetchMock} from './support/fetchMock';
import {Hero} from './model1/dummy/Hero';

describe('Relation', () => {
    let model: Hero;

    beforeEach(() => {
        fetchMock.install();
        model = new Hero();
    });

    afterEach(() => {
        fetchMock.uninstall();
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

        fetchMock.wait(() => {
            let request = fetchMock.requests.mostRecent();
            assert.equal(request.url.split('?')[0], model.getJsonApiBaseUrl()+'/heros/friends');
            done();
        });
    });

    it('yields a query with "<base class\>/<\<base id\>/\<relation class\>" at the start of the URL when an id is provided when using ToManyRelation', (done) => {
        model.setApiId('superman');

        model
            .friends()
            .get();

        fetchMock.wait(() => {
            let request = fetchMock.requests.mostRecent();
            assert.equal(request.url.split('?')[0], model.getJsonApiBaseUrl()+'/heros/superman/friends');
            done();
        });
    });

    it('yields a query with "<base class\>/<\<base id\>/\<relation class\>" at the start of the URL when an id is provided when using ToOneRelation', (done) => {
        model.setApiId('superman');

        model
            .rival()
            .get();

        fetchMock.wait(() => {
            let request = fetchMock.requests.mostRecent();
            assert.equal(request.url.split('?')[0], model.getJsonApiBaseUrl()+'/heros/superman/rival');
            done();
        });
    });
});
