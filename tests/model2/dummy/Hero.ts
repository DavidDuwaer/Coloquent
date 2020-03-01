import {BaseModel} from './BaseModel';
import {ToManyRelation} from "../../../dist";

export class Hero extends BaseModel {
    protected jsonApiType = 'heros';

    public setName(name: string) 
    {
        this.setAttribute('name', name);
    }

    public getName() {
        return this.getAttribute('name');
    }

    public friends(): ToManyRelation
    {
        return this.hasMany(Hero, 'friends');
    }

    public foes(): ToManyRelation
    {
        return this.hasMany(Hero, 'enemies');
    }
}