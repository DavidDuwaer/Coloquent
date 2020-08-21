![Coloquent](https://user-images.githubusercontent.com/8791690/28809914-c0c8e938-7686-11e7-8d22-599328c73cb5.png)

Javascript/Typescript library mapping objects and their interrelations to [JSON API](http://jsonapi.org), with a clean, fluent ActiveRecord (e.g. similar to Laravel's Eloquent) syntax for creating, retrieving, updating and deleting model objects. For example:

```javascript
Teacher
    .where('gender', 'm')                   // sets a filter
    .with('students')                       // eager loads related models
    .with('schools.address')                // eager loads directly and indirectly related models
    .get()                                  // submits the HTTP request, returns an ES6 Promise
    .then(coloquentResponse => {
        // do stuff with response of full-fledged, interrelated model objects
    });
```

[![npm version](https://badge.fury.io/js/coloquent.svg)](https://badge.fury.io/js/coloquent)
[![Build Status](https://travis-ci.org/DavidDuwaer/Coloquent.svg?branch=master)](https://travis-ci.org/DavidDuwaer/Coloquent)

To get started, see our more elaborate guide in our [wiki](https://github.com/DavidDuwaer/Coloquent/wiki)! A short version is featured below.

# Install


```shell
$ npm install coloquent
```

# Requirements

* Use in a project of which the runtime code is **Javascript ES6 or higher**. If your compile target is ES5 or lower, you will run into [this issue](https://github.com/DavidDuwaer/Coloquent/issues/54).
* The attribute `jsonApiBaseUrl` explained in the Setup section of this readme must point to an API implementing the [JSON API](http://jsonapi.org) standard.

# Usage

### Retrieving

To retrieve a single page of models of a certain type:

```javascript
Artist.get();
```

To retrieve the second page

```javascript
Artist.get(2);
```

The page size can be configured, this is covered the Setup section.

To add a filter, add a `where` clause
```javascript
Artist
    .where('country', 'US')
    .get();
```
To eager load related models within the same HTTP request, add a `with` clause.
```javascript
Artist
    .with('songs')
    .get();
```
To sort the result set server-side (indispensible for pagination), add an `orderBy` clause:
```javascript
Artist
    .orderBy('birthDate', 'desc')
    .get();
```
The second argument denoting the sorting direction is optional and is either `asc` (default) or `desc` (or `SortDirection.ASC` and `SortDirection.DESC`).
If you are only interested in the youngest `Artist`, it is more efficient to use `first` instead of `get`:
```javascript
Artist
    .orderBy('birthDate', 'desc')
    .first();
```
This will retrieve only a single model from the server. To retrieve a single model by ID:
```javascript
Artist.find(324);
```
To query a relation of an object you've instantiated:
```javascript
artist.albums()
    .orderBy('name', SortDirection.DESC)
    .get()
```
If, for some reason, you need to add a raw URL query parameter (e.g. `?_foo=somevalue`) to the underlying endpoint, use
the `option` clause:
```javascript
Artist
    .option('_foo', 'somevalue')
    .get();
```

All of the queries above return an ES6 `Promise` to which an instance of -depending on whether a single or multiple
models were requested- `SingularResponse` or `PluralResponse` is passed. From these classes both requested models and
eagerly loaded models can be obtained, e.g.:

```javascript
var teacher = coloquentResponse.getData[0];
var schoolAddress = teacher.getSchools()[0].getAddress();
var student = teacher.getStudents()[0];
```

The variables `teacher`, `schoolAddress` and `student` now all contain full-fledged model objects.

#### Note for TypeScript users

You should specify model class as generic type of any static method invocation.

```typescript
Artist.get<Artist>().then((response) => {
    const data = response.getData();
    // data is now properly inferred as Artist[] instead of Model[]
    // You don't have to cast anything thanks to provided generic type.
})
```

### Creating / updating

To save an instance of `Artist` to the server:

```javascript
artist.save();
```

If `artist` has the property `id` set, Coloquent will attempt a `PATCH` request to update an existing object; otherwise it will perform a `POST` request, creating a new object server-side. 

### Deleting

To delete an instance of `Artist` from the server:

```javascript
artist.delete();
```

# Setup

All you need to do is extend Coloquent's `Model` class with your own model: 

```javascript
import {Model} from 'coloquent';

class Artist extends Model
{
    public getJsonApiBaseUrl(): string
    {
        return 'http://www.app.com/api/';
    }
    
    protected jsonApiType = 'artists';
    
    protected pageSize = 30;
}
```

If there are settings that you want the same for all your models, it is useful to make an intermediary class that extends Coloquent's `Model`, and have your model classes extend that class. This is done in the following example.

# Example setup
We are configuring 3 models: `Artist`, `Album` and `Song`. In the following example, Typescript type assertions (e.g. `: Artists[]`) are included in the syntax, but if you don't use Typescript, remember that Coloquent also works in Javascript without these type assertions.

```typescript
import {Model} from 'coloquent';

class AppModel extends Model
{
    getJsonApiBaseUrl(): string
    {
        return 'http://www.app.com/api/';
    }
}

class Artist extends AppModel
{
    jsonApiType = 'artists';
    
    readOnlyAttributes = [
        'age'
    ];

    albums(): ToManyRelation<Album, this>
    {
        return this.hasMany(Album);
    }

    getAlbums(): Album[]
    {
        return this.getRelation('albums');
    }
    
    getBirthDate(): string
    {
        return this.getAttribute('birtDate');
    }
    
    getAge(): number
    {
        return this.getAttribute('age');
    }
    
    getCountry(): string
    {
        return this.getAttribute('country');
    }
    
    setCountry(country: string)
    {
        this.setAttribute('country', country);
    }
}

class Album extends AppModel
{
    jsonApiType = 'albums';

    artist(): ToOneRelation<Artist, this>
    {
        return this.hasOne(Artist);
    }

    songs(): ToManyRelation<Song, this>
    {
        return this.hasMany(Song);
    }

    getArtist(): Artist
    {
        return this.getRelation('artist');
    }

    getSongs(): Song[]
    {
        return this.getRelation('songs');
    }
}

class Song extends AppModel
{
    jsonApiType = 'songs';

    album(): ToOneRelation<Album, this>
    {
        return this.hasOne(Album);
    }

    getAlbum(): Album
    {
        return this.getRelation('album');
    }
}
```

Now we can query these models in the fashion shown in the Usage section of this readme.
Note that the models contain getters, and that these getters get the values of
relationships and attributes with `this.getRelation` and `this.getAttribute`,
respectively. Attributes can conversely be set with a `this.setAttribute` method.

Also note the methods that return an object of type `ToManyRelation` or `ToOneRelation`.
These are relationship _declarations_: they tell Coloquent what kind of relationship
there exists. It is required that they bear the same name as the cosponding relationship
in the underlying JSON API.

Finally, note that the `Artist` class overrides an array called `readOnlyAttributes`.
This array is for attributes that should be excluded from the payload sent to the server
when saving an instance of `Artist` (using the `save()` method).

# Feedback

If something is missing from this library that makes it not fit your use case today, or if you find a bug that spoils
it for you, don't hesitate to create an Issue or a Pull Request.
Coloquent is in active development and all feedback and contributions are sincerely appreciated.


# License

The content of this project is licensed under the MIT license.
