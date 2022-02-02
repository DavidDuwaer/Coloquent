import {BaseModel} from './BaseModel';
import {ToManyRelation} from "../../../dist";
import {AntiHero} from "./AntiHero";

export class Hero extends BaseModel
{
    protected static jsonApiType = 'heros';

    public antiHeroes(): ToManyRelation
    {
        return this.hasMany(AntiHero, 'anti-heroes');
    }

    public getAntiHeroes(): Array<AntiHero>
    {
        return this.getRelation('antiHeroes');
    }
}
