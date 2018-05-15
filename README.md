# An app to download videos from Stalker/Ministra Middleware

## Requirements

* [Node.js](https://nodejs.org/en/),
* [VLC](https://www.videolan.org/vlc/index.html) to play videos.

## Usage

```console
# Clone or download zip
git clone https://github.com/toyorg/stalker_archive_downloader.git
# Open directory
cd stalker_archive_downloader
# Install dependencies
npm i
# First run to get channels
node app.js -c
# Then you can run app normally
node app.js
```

## Changelog

### v1.0.2

* If channels.json is empty download available channels from portal,
* Fixed downloading channels.

### v1.0.1

* Code cleanup using [Prettier](https://github.com/prettier/prettier), [ESLint](https://github.com/eslint/eslint) and [Babel](https://github.com/babel/babel).

### v1.0.0

* Get channels dynamically from portal (multiple portals support).

### v0.1.1

* GitHub update notify,
* Chalk for colored output.

### v0.1.0

* Replace fs for reading mac.txt to [lowdb](https://github.com/typicode/lowdb),
* lowdb is storing MAC and portal URL addresses.

### v0.0.6

* Renamed var to let,
* Truncating TV show name.

### v0.0.5

* Replaced [Moment.js](https://momentjs.com/) with [Day.js](https://github.com/xx45/dayjs),
* Ability to search for TV channel instead of just looking for it,
* Prompt that is allowing you to choose what to do with selected TV show (link, download, watch),
* Unique channels,
* Renamed api.js to app.js.

### v0.0.4

* Archive for 2 days instead of 1 day.

### v0.0.3

* Some fixing and cleaning.

### v0.0.1

* First working version.

## TODO
