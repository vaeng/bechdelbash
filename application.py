import os
import re
from flask import Flask, jsonify, render_template, request
import psycopg2

# DATABASE_URL = "sqlite:///movies.db"

DATABASE_URL = os.environ['DATABASE_URL']

connection = psycopg2.connect(DATABASE_URL, sslmode='require')
print(connection)
cursor = connection.cursor()
print(cursor)


# Configure application
app = Flask(__name__)

# bechdeldatabase
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
    cursor.execute("SELECT SUM(rating), COUNT(rating) FROM list WHERE country LIKE :country", country="%" + country + "%")
    countryresult = cursor.fetchone()
    print(countryresult)
    if not countryresult:
        return "No known movies for: " + country
    else:
         return ("The average bechdel score for movies from " + country + " is " + str(countryresult['SUM(rating)']/countryresult['COUNT(rating)']) + " with " + str(countryresult['COUNT(rating)']) + " movies.")



if __name__ == '__main__':
   app.run(debug = True)