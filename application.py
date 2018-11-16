import os
import re
from flask import Flask, jsonify, render_template, request
from cs50 import SQL

DATABASE_URL = os.environ['DATABASE_URL']

# Configure application
app = Flask(__name__)

# bechdeldatabase
db = SQL(DATABASE_URL)


app = Flask(__name__)

# Ensure responses aren't cached
@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

@app.route('/country/<country>/')
def success(country):
    countryresult = db.execute("SELECT SUM(rating), COUNT(rating) FROM list WHERE country LIKE :country", country="%" + country + "%")[0]
    if not countryresult:
        return "No known movies for: " + country
    else:
         return ("The average bechdel score for movies from " + country + " is " + str(countryresult['SUM(rating)']/countryresult['COUNT(rating)']) + " with " + str(countryresult['COUNT(rating)']) + " movies.")


if __name__ == '__main__':
   app.run(debug = True)