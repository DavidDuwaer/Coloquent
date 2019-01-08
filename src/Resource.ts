export class Resource
{
    public type: string;

    public id: string;

    public attributes: {
        [key: string]: any
    };

    public relationships: {
        [relationshipName: string]: {
            data: any
        }
    };
}