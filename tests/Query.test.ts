import {Query} from './../lib/Query';
import {assert} from 'chai';

describe('Query', () => {
    it('should be able to initialize', () => {
        let query = new Query();

        assert.equal(query.toString(), '');
    });

    it('should be able to initialize with a query', () => {
        let query = new Query('name=John');

        assert.equal(query.toString(), 'name=John');
    });

    it('should be able to set value by key', () => {
        let query = new Query();
        query.set('name', 'John');

        assert.equal(query.toString(), 'name=John');
    });

    it('should be able to set nested value by . (dot) notation', () => {
        let query = new Query();
        query.set('hero.name', 'John');

        assert.equal(query.toString(), 'hero%5Bname%5D=John');
    });
});