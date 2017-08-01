![Coloquent](https://user-images.githubusercontent.com/8791690/28809914-c0c8e938-7686-11e7-8d22-599328c73cb5.png)

Javascript/Typescript library mapping objects and their interrelations to JSON API, with a clean, fluent syntax inspired by Laravel's Eloquent for creating, retrieving, updating and deleting model objects. For example:

```javascript
Teacher
    .where('gender', 'm')                    // sets a filter
    .with('schools.address')                 // eager loads related models
    .with('students')                        // eager loads related models
    .get()                                   // submits the HTTP request, returns an ES6 Promise
    .then(function (coloquentResponse) {
        // do stuff with response
    });
```

# Usage

#### Retrieving

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

The second argument denoting the sorting direction is optional and is either `asc` (default) or `desc`.


To retrieve a single model by ID:
```javascript
Artist.find(324);
```

All of the queries above return an ES6 `Promise` to which an instance of, depending on whether a single or multiple models were requested, `SingularColoquentResponse` or `PluralColoquentResponse` is passed. From these classes both requested models and eagerly loaded models can be obtained, e.g.:

```javascript
var teacher = coloquentResponse.getData[0];
var schoolAddress = teacher.getSchools()[0].getAddress();
var student = teacher.getStudents()[0];
```

The variables `teacher`, `schoolAddress` and `student` now all contain full-fledged model objects.

#### Creating / updating

To save an instance of `Artist` to the server:

```javascript
artist.save();
```

If `artist` has the property `id` set, Coloquent will attempt a `PATCH` request to update an existing object; otherwise it will perform a `POST` request, creating a new object server-side. 

#### Deleting

To delete an instance of `Artist`:

```javascript
artist.delete();
```

# Setup

All you need to do is extend Coloquent's `Model` class with your own model: 

```javascript
import {Model} from 'coloquent';

class Artist extends Model
{
    protected jsonApiBaseUrl = 'http://www.app.com/api/';
    
    protected jsonApiType = 'artists';
    
    protected pageSize = 30;
}
```

If there are settings that you want the same for all your models, it is useful to make an intermediary class that extends Eloquent's `Model`, and have your model classes extend that class. This is done in the following example.

# Example setup
We are configuring 3 models: `Artist`, `Album` and `Song`.

```javascript
import {Model} from 'coloquent';

class AppModel extends Model
{
    protected jsonApiBaseUrl = 'http://www.app.com/api/';
}

class Artist extends AppModel
{
    protected jsonApiType = 'artists';

    public albums() {
        return new ToManyRelation(Album);
    }

    getAlbums(): Album[] {
        return this.getRelation('albums');
    }
}

class Album extends AppModel
{
    protected jsonApiType = 'albums';

    public artist() {
        return new ToOneRelation(Artist);
    }

    public songs() {
        return new ToManyRelation(Song);
    }

    getArtist(): Artist {
        return this.getRelation('artist');
    }

    getSongs(): Song[] {
        return this.getRelation('songs');
    }
}

class Song extends AppModel
{
    protected jsonApiType = 'songs';

    public album() {
        return new ToOneRelation(Album);
    }

    getAlbum(): Album {
        return this.getRelation('album');
    }
}
```

Now we can query these models in the fashion shown in the Usage section of this readme.

# Install


```bash
npm install coloquent
```

# License

The content of this project is licensed under the MIT license.