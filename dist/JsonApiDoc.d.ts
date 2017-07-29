export declare class JsonApiDoc {
    type: string;
    id: string;
    attributes: {
        [key: string]: any;
    };
    relationships: {
        [relationshipName: string]: {
            data: any;
        };
    };
}
