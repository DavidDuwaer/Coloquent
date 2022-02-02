import {BaseModel} from './BaseModel';
import {ToManyRelation} from "../../../dist";
import {Hero} from "./Hero";

export class AntiHero extends BaseModel
{
    protected static jsonApiType = 'anti-heroes';

    public heroes(): ToManyRelation
    {
        return this.hasMany(Hero, 'heros');
    }

    public getName(): string {
        return this.getAttribute('name');
    }
}
