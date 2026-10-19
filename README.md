# Fluentio

My personal web playground. Private repo, hosted on Cloudflare Pages (served from this private repo, kept off search engines with robots noindex).

## Layout

Everything is on `main`, served as static files:

- `index.html`, `404.html` — the main page
- `geography/` — the geography tests (world map and each continent)
- `robots.txt` — tells search engines not to index the site

No build step: Cloudflare Pages serves these files as they are.

## License

Apache License 2.0, see LICENSE. The geography tests' map comes from Natural Earth (public domain).
