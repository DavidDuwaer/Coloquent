import {Model} from '../../lib/Model';

export abstract class BaseModel extends Model {
    getJsonApiBaseUrl(): string {
        return 'http://coloquent.app/api/';
    }
}