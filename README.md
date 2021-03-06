# Albumiphy

![Albumiphy screenshot](web/assets/placeit-git.png?raw=true "Albumiphy screenshot")

A simple static image gallery:

- Calendar layout
- Responsive
- Bookmarkable URLs
- Images scaled for web/mobile

Albumiphy uses the timestamp encoded in exif data to arrange images by month and year. Images are optimised for the web coming in at around 50-100kB each. Should support relatively large image libraries with 10k+ images.

Here is an [example gallery](http://retu.be/Albumiphy) featuring random shots of London.

## Requirements

- Linux
- Python

## Installation

- Download ZIP above 
- Unzip
- Add the the `bin` directory extracted above to `$PATH` in your `.bashc`

## Create Album

`> cd /path/to/images`

`> albumiphy.py --title="My Super Pics"`

Then point your web browser to:

`file:///path/to/images/Albumiphy/index.html`

and voila!

Copy the `Albumiphy` folder to your favorite web server, USB stick etc at your leisure.

## Home page

[Albumiphy home page](http://retu.be/albumiphy.html)

