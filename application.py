import os
import re
from flask import Flask, jsonify, render_template, request, Response
import psycopg2
from psycopg2 import sql
import json
from helpers import column2array, arrayfilter
from flask_compress import Compress
from flask_sslify import SSLify


# compression
COMPRESS_MIMETYPES = ['text/html', 'text/css', 'text/xml', 'application/json', 'application/javascript']
COMPRESS_LEVEL = 6
COMPRESS_MIN_SIZE = 500


# Set up database
DATABASE_URL = os.environ['DATABASE_URL']
connection = psycopg2.connect(DATABASE_URL, sslmode='require')
cursor = connection.cursor()

genrearray = column2array("genres", cursor)
countryarray = column2array("country", cursor)
castarray = column2array("castmember", cursor)
writersarray = column2array("writers", cursor)
directorsarray = column2array("directors", cursor)

# Configure application
app = Flask(__name__)
Compress(app)
sslify = SSLify(app)


# Ensure responses aren't cached
# @app.after_request
# def after_request(response):
#    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
#    response.headers["Expires"] = 0
#    response.headers["Pragma"] = "no-cache"
#    return response

@app.route('/<category>/<filters>/')
def bechdelresults(category, filters):
    filterstring = "%" + filters + "%"
    try:
        cursor.execute(sql.SQL("SELECT SUM(rating), COUNT(rating) FROM list WHERE {} ILIKE %s").format(sql.Identifier(category)), (filterstring,))
    except:
        return ("No known movies for: " + filters + " in " + category)
    result = cursor.fetchone()
    return ("The average bechdel score for movies with " + filters + " in "  + category + " is " + str(result[0]/result[1]) + " with " + str(result[0]) + " movies.")

@app.route("/api/<method>", methods=["POST", "GET"])
def apirequest(method):
    """Returns development of bechdel score over the decades for search term and category"""

    supportedMethods = ["getTotalScore", "getDecadeScores", "getYearlyScores"]

    if method not in supportedMethods:
        return Response(json.dumps({"error" : method + " method not supported"}),  mimetype='application/json', status=400)

    data = {
        "method" : method,
		"category" : "",
		"filterTerm" : "",
		"totalRated" : 0,
		"totalAverage" : 0,
	   }

    # Ensure category was submitted
    category = request.values.get("category")
    if not category:
        return Response(json.dumps({"error" : "no category was submitted"}),  mimetype='application/json', status=400)

    # Ensure filterterm was submitted
    filterterm = request.values.get("filterterm")
    if not filterterm:
         return Response(json.dumps({"error" : "no filterterm was submitted"}),  mimetype='application/json', status=400)

    # setting up dict object
    data["category"] = category
    data["filterTerm"] = filterterm

    filterstring = "%" + filterterm + "%"

    sqlsearchstring = """SELECT COUNT(*) total,
                                SUM(case when rating = 0 then 1 else 0 end) rating0,
                                SUM(case when rating = 1 then 1 else 0 end) rating1,
                                SUM(case when rating = 2 then 1 else 0 end) rating2,
                                SUM(case when rating = 3 then 1 else 0 end) rating3
                           FROM list
                           WHERE {}
                           ILIKE %s"""
    try:
        cursor.execute(sql.SQL(sqlsearchstring).format(sql.Identifier(category)), (filterstring,))
    except:
        return Response(json.dumps({"error" : "Problem with the database request. Maybe category " + category + " is not valid?"}),  mimetype='application/json', status=400)

    (totalrated, totalrating0, totalrating1, totalrating2, totalrating3) = cursor.fetchone()

    if int(totalrated) >0:
        data["totalRated"] = totalrated
        data["totalAverage"] = "{:.10}".format((totalrating1 + 2*totalrating2 + 3*totalrating3)/totalrated)
        data["totalRatingOf0"] = totalrating0
        data["totalRatingOf1"] = totalrating1
        data["totalRatingOf2"] = totalrating2
        data["totalRatingOf3"] = totalrating3

    if method == "getTotalScore":
        return Response(json.dumps(data),  mimetype='application/json', status=200)

    if method == "getDecadeScores":
        sorter = "decade"
    if method == "getYearlyScores":
        sorter = "year"
    sqlsearchstring = "SELECT "+ sorter + "," + sqlsearchstring[6:] # remove the select argument, so year / decade can be inserted
    sqlsearchstring += " GROUP BY " + sorter + " ORDER BY " + sorter # add the grouping

    # following for  "getDecadeScores" and "getYearlyScores" methods
    try:
        cursor.execute(sql.SQL(sqlsearchstring).format(sql.Identifier(category)), (filterstring,))
    except:
        return Response(json.dumps({"error" : "Problem in the 'getDecadeScores' or 'getYearlyScores' methods"}),  mimetype='application/json', status=400)



    data[sorter + 's'] ={}

    for entry in cursor.fetchall():
        data[sorter + 's'][entry[0]] = {}
        data[sorter + 's'][entry[0]]["totalRated"] = entry[1]
        data[sorter + 's'][entry[0]]["totalAverage"] = "{:.10}".format((entry[3] + 2*entry[4] + 3*entry[5])/entry[1])
        data[sorter + 's'][entry[0]]["totalRatingOf0"] = entry[2]
        data[sorter + 's'][entry[0]]["totalRatingOf1"] = entry[3]
        data[sorter + 's'][entry[0]]["totalRatingOf2"] = entry[4]
        data[sorter + 's'][entry[0]]["totalRatingOf3"] = entry[5]

    return Response(json.dumps(data),  mimetype='application/json', status=200)


@app.route('/api')
def showAPI():
    return render_template("api.html")


@app.route('/about')
def showAbout():
    return render_template("about.html")


@app.route('/')
def index():
    return render_template("index.html")


@app.route('/search/<category>/<query>/<limit>')
def search(category,query,limit):

    if limit.isdigit():
        limit = int(limit)
    else:
        return Response(json.dumps({"error" : "limit must be ineger"}),  mimetype='application/json', status=400)

    filteredarray = []
    targetarray = []
    if category == "genres":
        targetarray = genrearray
    elif category == "country":
        targetarray = countryarray
    elif category == "castmember":
        targetarray = castarray
    elif category == "writers":
        targetarray = writersarray
    elif category == "directors":
        targetarray = directorsarray

    filteredarray = arrayfilter(targetarray, query)
    returndict = {'totalresults' : len(filteredarray), 'category' : category, 'query' : query, 'limit' : limit, 'results' : filteredarray[:int(limit)]}
    return Response(json.dumps(returndict),  mimetype='application/json', status=200)


@app.route('/serviceWorker.js', methods=['GET'])
def sw():
    return app.send_static_file('serviceWorker.js')

@app.route('/offline.html', methods=['GET'])
def offline():
    return app.send_static_file('offline.html')

@app.route('/manifest.json', methods=['GET'])
def manifest():
    return app.send_static_file('manifest.json')


if __name__ == '__main__':
   app.run(debug = True)