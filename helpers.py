import psycopg2
from psycopg2 import sql
import fnmatch


def column2array(column, cursor): # cursor and genres? see autplist
    """returns a complete sql column into one array"""
    array = []
    selectstring = 'SELECT "' + column + '" FROM list'
    try:
        cursor.execute(selectstring)
    except:
        return []
    tuplearray = cursor.fetchall()
    mixedarray = [i for sub in tuplearray for i in sub]
    longstring = ','.join([str(x) for x in mixedarray])
    mixedarray = longstring.split(",")
    uniqueset = set()
    uniqueset.update(mixedarray)
    mixedarray = list(uniqueset)
    return mixedarray


def arrayfilter(array, filterterm):
    """ filters an array and returns an array where only filtered terms are included. case insensitive """
    pattern = f'*{filterterm.lower()}*'
    return [item for item in array if fnmatch.fnmatch(item.lower(), pattern)]