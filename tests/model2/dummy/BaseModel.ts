import {Model} from "../../../dist";

export abstract class BaseModel extends Model {
    protected static jsonApiBaseUrl = 'http://coloquent.app/api/';
}
