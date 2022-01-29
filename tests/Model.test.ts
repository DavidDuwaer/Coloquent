import {expect} from 'chai';
import {AxiosHttpClient, Model} from "../dist";

describe('Model', () => {
  describe('static', () => {
    describe('getHttpClient', () => {
      describe('without static httpClient', () => {
        class Foo extends Model {}

        it('returns a new AxiosHttpClient', () => {
          expect(Foo.getHttpClient()).to.be.an.instanceof(AxiosHttpClient);
        });

        it('memoizes the HttpClient', () => {
          const httpClient = Foo.getHttpClient()

          expect(Foo.getHttpClient()).to.eql(httpClient);
        });
      });

      describe('with static httpClient', () => {
        const httpClient = new AxiosHttpClient()

        class Foo extends Model {
          static httpClient = httpClient
        }

        it('returns the httpClient', () => {
          expect(Foo.getHttpClient()).to.eql(httpClient)
        });
      });
    });

    describe('getJsonApiType', () => {
      describe('without static jsonApiType', () => {
        class Foo extends Model {}

        it('throws an Error', () => {
          expect(() => { Foo.getJsonApiType() }).to.throw();
        });
      });

      describe('with static jsonApiType', () => {
        class Foo extends Model {
          static jsonApiType = 'foos'
        }

        it('returns jsonApiType', () => {
          expect(Foo.getJsonApiType()).to.eq('foos');
        });
      });
    });

    describe('getJsonApiBaseUrl', () => {
      describe('without static jsonApiType', () => {
        class Foo extends Model {}

        it('throws an Error', () => {
          expect(() => { Foo.getJsonApiBaseUrl() }).to.throw();
        });
      });

      describe('with static jsonApiBaseUrl', () => {
        class Foo extends Model {
          static jsonApiBaseUrl = 'http://coloquent.app/api';
        }

        it('returns jsonApiBaseUrl', () => {
          expect(Foo.getJsonApiBaseUrl()).to.eq('http://coloquent.app/api');
        });
      });
    });

    describe('getJsonApiUrl', () => {
      describe('without static jsonApiBaseUrl', () => {
        class Foo extends Model {}

        it('throws an Error', () => {
          expect(() => { Foo.getJsonApiUrl() }).to.throw();
        });
      });

      describe('with static jsonApiBaseUrl and jsonApiType', () => {
        class Foo extends Model {
          static jsonApiBaseUrl = 'http://coloquent.app/api';
          static jsonApiType = 'foos';
        }

        it('returns URL with jsonApiType as endpoint', () => {
          expect(Foo.getJsonApiUrl()).to.eq('http://coloquent.app/api/foos')
        });
      });

      describe('with static jsonApiBaseUrl and jsonApiType and endpoint', () => {
        class Foo extends Model {
          static jsonApiBaseUrl = 'http://coloquent.app/api';
          static jsonApiType = 'foos';
          static endpoint = '/custom-endpoint-foo';
        }

        it('returns URL with endpoint', () => {
          expect(Foo.getJsonApiUrl()).to.eq('http://coloquent.app/api/custom-endpoint-foo')
        });
      });
    });
  });
});
