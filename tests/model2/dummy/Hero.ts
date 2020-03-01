import {BaseModel} from './BaseModel';
import {ToManyRelation, ToOneRelation} from "../../../dist";

export class Hero extends BaseModel {
    protected jsonApiType = 'heros';

    public setName(name: string) 
    {
        this.setAttribute('name', name);
    }

    public getName() {
        return this.getAttribute('name');
    }

    public bestFriend(): ToOneRelation
    {
        return this.hasOne(Hero);
    }

    public friends(): ToManyRelation
    {
        return this.hasMany(Hero);
    }

    public foes(): ToManyRelation
    {
        return this.hasMany(Hero, 'enemies');
    }
}