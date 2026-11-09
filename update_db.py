import urllib.request
import sqlite3
import os
import re
import html


# User-agent to avoid 403
_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
}


def main():
    # --- Scrape all movies from bechdeltest.com ---
    all_movies = scrape_all_pages()
    print(f"Scraped {len(all_movies)} movies total")

    # --- DB connection ---
    DB_PATH = os.environ.get('DATABASE_URL', 'movies.db')
    if DB_PATH.startswith('postgres://') or DB_PATH.startswith('postgresql://'):
        DB_PATH = 'movies.db'
    connection = sqlite3.connect(DB_PATH)
    cursor = connection.cursor()

    # --- Existing imdbids ---
    cursor.execute("SELECT imdbid FROM list")
    rows = cursor.fetchall()
    existing_imdbids = set(str(r[0]) for r in rows)
    print(f"Found {len(existing_imdbids)} existing movies in database")

    # --- Deduplicate (keep earliest row per imdbid) ---
    cursor.execute("""
        DELETE FROM list 
        WHERE rowid NOT IN (
            SELECT MIN(rowid) FROM list GROUP BY imdbid
        )
    """)
    deleted_count = cursor.rowcount
    if deleted_count:
        print(f"Removed {deleted_count} duplicate entries")
    connection.commit()

    # --- Insert new movies ---
    already_inserted = set()
    inserted_count = 0

    for movie_data in all_movies:
        imdbid_str = movie_data['imdbid']
        if not imdbid_str:
            continue

        # Skip if already in DB
        if imdbid_str in existing_imdbids:
            continue

        # Skip if already processed in this run
        if imdbid_str in already_inserted:
            continue

        already_inserted.add(imdbid_str)

        try:
            imdbid = int(imdbid_str)
        except ValueError:
            print(f"  Skipping invalid imdbid: {imdbid_str}")
            continue

        year = movie_data['year']
        rating = movie_data['rating']
        title = movie_data['title']
        bechdelid = movie_data['bechdelid']
        decade = (year // 10) * 10

        print(f"Inserting: imdbid: {imdbid} bechdelid: {bechdelid} title: '{title}'")
        insertstring = (
            "INSERT INTO list "
            "(year, rating, imdbid, title, country, castmembers, genres, directors, writers, decade, bechdelid) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )
        cursor.execute(insertstring, (
            int(year), int(rating), imdbid, title,
            "", "", "", "", "",
            decade, int(bechdelid)
        ))
        inserted_count += 1

        # Commit every 50 inserts to avoid losing progress
        if inserted_count % 50 == 0:
            connection.commit()
            print(f"  ... {inserted_count} new movies inserted so far")

    connection.commit()
    cursor.close()
    connection.close()

    print(f"\nDone. Inserted {inserted_count} new movies.")


def scrape_all_pages():
    """Scrape all pages from bechdeltest.com."""
    all_movies = []
    page = 1

    while True:
        url = f"https://bechdeltest.com/?page={page}"
        print(f"Fetching page {page}...")
        try:
            req = urllib.request.Request(url, headers=_HEADERS)
            with urllib.request.urlopen(req, timeout=30) as resp:
                html_content = resp.read().decode("iso-8859-1")
        except Exception as e:
            print(f"  Error fetching page {page}: {e}")
            break

        movies = parse_bechdel_page(html_content)
        if not movies:
            print(f"  No movies found on page {page}, stopping.")
            break

        all_movies.extend(movies)
        print(f"  Found {len(movies)} movies (total: {len(all_movies)})")
        page += 1

        # Safety cap
        if page > 200:
            print("  Reached page cap of 200, stopping.")
            break

    return all_movies


# ---------------------------------------------------------------------------
# HTML parsing
# ---------------------------------------------------------------------------

_MOVIE_BLOCK_RE = re.compile(
    r'<div\s+class="movie">'
    r'.*?'
    r'https://www\.imdb\.com/title/tt(\d+)/'
    r'.*?'
    r'alt="\[\[(\d)\]\]"'
    r'.*?'
    r'<a\s+id="movie-(\d+)"'
    r'.*?'
    r'>([^<]+)</a>'
    r'.*?'
    r'</div>',
    re.DOTALL
)

_YEAR_ANCHOR_RE = re.compile(r'<a\s+id="year-(\d+)"')


def parse_bechdel_page(html_content):
    """Parse a single page of bechdeltest.com and return list of movie dicts."""
    movies = []

    year_positions = []
    for m in _YEAR_ANCHOR_RE.finditer(html_content):
        year = int(m.group(1))
        year_positions.append((m.start(), year))

    for m in _MOVIE_BLOCK_RE.finditer(html_content):
        block_start = m.start()
        imdbid = m.group(1)
        rating = int(m.group(2))
        bechdelid = int(m.group(3))
        title = html.unescape(m.group(4).strip())

        # Find the current year section
        year = 0
        for pos, y in year_positions:
            if pos < block_start:
                year = y
            else:
                break

        movies.append({
            "imdbid": imdbid,
            "rating": rating,
            "bechdelid": bechdelid,
            "title": title,
            "year": year,
        })

    return movies


if __name__ == "__main__":
    main()
