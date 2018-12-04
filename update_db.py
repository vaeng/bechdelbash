import urllib.request, json
import  psycopg2
from psycopg2 import sql
import imdb # Import the imdb package.
import os


def main():
    # data urls from bechdeltest:
    # update_url = "http://bechdeltest.com/api/v1/getAllMovieIds" #only id and imdbid
    update_url = "http://bechdeltest.com/api/v1/getAllMovies" # all data
    # convert json to dict object
    with urllib.request.urlopen(update_url) as url:
        data = json.loads(url.read().decode())
    # connect to local:
    DATABASE_URL = os.environ['DATABASE_URL']
    connection = psycopg2.connect(DATABASE_URL, sslmode='require')
    cursor = connection.cursor()
    # Create the object that will be used to access the IMDb's database.
    ia = imdb.IMDb() # by default access the web.
    # Get a list of imdbids on the server
    cursor.execute("SELECT imdbid from list")
    imdbarray = cursor.fetchall()
    imdbarray = [i for sub in imdbarray for i in sub]
    imdbarray = (','.join([str(x) for x in imdbarray])).split(",")
    # Find duplicates from:
    # https://stackoverflow.com/questions/9835762/
    # how-do-i-find-the-duplicates-in-a-list-and-create-another-list-with-them
    unique_imdbids = {}
    duplicate_entries = []
    for x in imdbarray:
        if x not in unique_imdbids:
            unique_imdbids[x] = 1
        else:
            if unique_imdbids[x] == 1:
                duplicate_entries.append(x)
            unique_imdbids[x] += 1
    # Delete duplicates
    deletestring = "DELETE FROM list WHERE imdbid = %s;"
    counter = 0
    for duplicate_imdb in duplicate_entries:
        try:
            cursor.execute(deletestring, (duplicate_imdb,))
            counter += 1
        except:
            pass
    print("Deleted %i duplcates" % (counter))
    already_inserted = []
    for film in data:
        imdbid = film['imdbid']
        if not imdbid:
            continue
        else:
            imdbid = int(imdbid)
        # skip entries that are already in the database
        # but re-include duplicates, because all where deleted
        if str(imdbid) in duplicate_entries:
            pass
        elif str(imdbid) in imdbarray:
            continue
        # make sure there are no doubles in bechdel-list
        if imdbid in already_inserted:
            continue
        else:
            already_inserted.append(imdbid)
        movie = ia.get_movie(imdbid)
        year = film['year']
        rating = film['rating']
        title =  film['title']
        country = get_list(movie, "countries")
        castmember = get_people(movie,"cast")
        genres = get_list(movie, "genres")
        directors = get_people(movie,"directors")
        writers = get_people(movie,"writers")
        decade = int(film['year'])//10*10
        bechdelid = film['id']
        print("Inserting: imdbid: {} bechdelid: {} title: '{}'".format(imdbid, bechdelid, title))
        insertstring = "INSERT INTO list (year, rating, imdbid, title, country, castmember, genres, directors, writers, decade, bechdelid) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
        cursor.execute(insertstring, (int(year), int(rating), imdbid, title, country, castmember, genres, directors, writers, decade, int(bechdelid)))
    # Make the changes to the database persistent
    connection.commit()
    # Close communication with the database
    cursor.close()
    connection.close()


def get_people(movie, category):
    try:
        itemarray = movie[category]
        itemstring = ""
        for member in itemarray:
            itemstring += member['name'] + ","
        return itemstring[:-1]
    except:
        return ""

def get_list(movie, category):
    try:
        itemlist = movie['countries']
        refined_list = ','.join(a for a in itemlist)
        return refined_list
    except:
        return ""

if __name__ == "__main__":
    main()