import os
import re
from flask import Flask, jsonify, render_template, request, Response
import psycopg2
from psycopg2 import sql
import json


# Set up database
DATABASE_URL = os.environ['DATABASE_URL']
connection = psycopg2.connect(DATABASE_URL, sslmode='require')
cursor = connection.cursor()



# Configure application
app = Flask(__name__)


# Ensure responses aren't cached
@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

@app.route('/<category>/<filters>/')
def bechdelresults(category, filters):
    filterstring = "%" + filters + "%"
    try:
        cursor.execute(sql.SQL("SELECT SUM(rating), COUNT(rating) FROM list WHERE {} ILIKE %s").format(sql.Identifier(category)), (filterstring,))
    except:
        return ("No known movies for: " + filters + " in " + category)
    result = cursor.fetchone()
    return ("The average bechdel score for movies with " + filters + " in "  + category + " is " + str(result[0]/result[1]) + " with " + str(result[0]) + " movies.")

@app.route("/decades", methods=["GET"])
def decades():
    """Returns development of bechdel score over the decades for search term and category"""

    decade_result = [{
		"category" : "",
		"filterterm" : "",
		"totalmovies" : 0,
		"totalaverage" : 0,
	   }]

    # Ensure category was submitted
    category = request.args.get("category")
    print("category: " + category)
    if not category:
        return "must provide category"

    # Ensure filterterm was submitted
    filterterm = request.args.get("filterterm")
    if not filterterm:
        return "must provide filterterm"
    # setting up dict object
    decade_result[0]["category"] = category
    decade_result[0]["filterterm"] = filterterm

    filterstring = "%" + filterterm + "%"

    try:
        cursor.execute(sql.SQL("SELECT SUM(rating), COUNT(rating) FROM list WHERE {} ILIKE %s").format(sql.Identifier(category)), (filterstring,))
    except:
        return Response(json.dumps(decade_result),  mimetype='application/json')

    (ratingsum, moviesum) = cursor.fetchone()

    if int(moviesum) >0:
        decade_result[0]["totalmovies"] = moviesum
        decade_result[0]["totalaverage"] = "{:.10}".format(ratingsum/moviesum)

    # return the desired json obect
    return Response(json.dumps(decade_result),  mimetype='application/json')

@app.route('/')
def index():
    return render_template("index.html")

if __name__ == '__main__':
   app.run(debug = True)