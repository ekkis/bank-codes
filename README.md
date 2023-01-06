# Bank Codes

A package that allows the caller to extrace SWIFT codes published by the http://bank.codes service

## Install
Add to your project from the NPM repository:
```
npm install bank-codes --save
```
and grab an instance:
```javascript
// using ES6  modules
import bc from 'bank-codes';

// using CommonJS modules
const bc = require('bank-codes');
```

## Usage

The methods in this package store the data retrieved into a `cache.json` file.  This package contains such a file and most clients will simply want to use it directly, rather than scanning the site for the data.  The file may be included like this:
```js
const bc = require('bank-codes/cache.json')
```

The following methods are available in the package:

### countries()

Returns an object keyed by country names and values a path within the site see a list of banks
```javascript
{
    "United States": "/swift-code/united-states/"
}
```
### banks(country)

Retrieves the list of banks for the given country.  The return value is similar that below:
```javascript
{
    "banks": {
        "United States": {
            "Intrust Bank, n.a.": {
                "Wichita": [{
                    "Branch": "Finance Operations",
                    "Address": "105 North Main",
                    "PostCode": "67202",
                    "SWIFT": "Trstus44"
                }]
            }
        }
    }
}
```

## Examples

The methods return promises so their return values need to be waited for
```javascript
// as a promise
bc.banks('United States').then(console.log);

// async/await
(async () => {
    console.log(await bc.banks('United States'));
})()
```
## Cache file

The package includes a database of site content (SWIFT codes only) organised as a Json object in a tarball named `cache.json.tar.gz`, which users may download and include in projects without having to build it.  To grab the file just run:
```bash
curl -L "https://github.com/ekkis/bank-codes/raw/main/cache.json.tar.gz" |tar -xzv
```
As the data on the site may change across time, making the database stale, it may be necessary to regenerate this, which is accomplished by running:
```bash
# creates a cache file for all countries
npm run cache

# will extract the data for only the countries specified
npm run cache Mexico Sweden

# prints to stdout so it can be captured to a file
npm run cache Mexico > Mexico.json

# progress information is produced
export DEBUG=Y
npm run cache

# in case an extract brakes, the page that failed may be re-run
# which also continues extracting all subsequent pages
npm run cache "https://bank.codes/swift-code/united-states/page/63/"

```
Note: when passing country names to the script, they must be title-cased

## Contribute

If you add functionality, make sure tests pass:
```
npm test
```
and when publishing, bump up the version like this:
```
npm version <patch|minor|major>
```

## Licence
ISC

## Support

For support post an issue on Github or reach out to me directly [@ekkis](https://t.me/ekkis) on Telegram
