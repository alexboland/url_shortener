# URL Shortener Project

Shortens URLs to a six character string.  Below are some technical notes on the algorithms and design used.


## Database

I chose to use MySQL but would likely use a key-value store like dynamo in the future.  The abbreviated URL is based on the current timestamp and constitutes the primary key of the database.  Since the string value generally corresponds to the time of insertion, re-indexing is kept to a minimum, but this can happen in a special case: if there is a collision of IDs due to too many simultaneous requests, a random nonce will be added to the value in the next attempt, which means that some re-indexing might happen if things are out of order; this nonce is added to the underlying numerical value, not the string, so it still is only six characters.

The more intuitive approach would have been to just use an auto-incrementing ID field and convert the ID to a base-62 string upon retrieval, but this would make data-scraping extremely easy.  I might not have to worry about this, but realistically any commercial version of this would want to avoid this.

The request also has to check if that URL already has a string in the database.  If it is, it will likely be found in the cache before having to check the database. A secondary index is defined on the first 255 characters of the non-abbreviated URL in order to speed up this inspection.

Since it's impossible to impose a uniqueness constraint on a field that's more than 255 characters, there are times where multiple abbreviations can be created for the same URL.  This could only happen, however, if multiple requests to abbreviate a previously unused URL are made, and even in this case there is no harm done to functionality.  It is also worth noted that due to caching, if a URL is used frequently, it will virtually always return the same abbreviation.


## Redirecting to https

If this were a commercial product I would not have done this, but for the sake of safety I made the decision to always redirect to https.


## Testing

The seedUrls.js file was used to stress test the program, and locally it was able to handle as much as 3000 near-simultaneous requests without any errors.
