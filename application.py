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

@app.route('/<category>/<filters>/')
def bechdelresults(category, filters):
    cursor.execute("SELECT SUM(rating), COUNT(rating) FROM list WHERE %s ILIKE %s", (category,'%' + filters + '%'))
    result = cursor.fetchone()
    if not result[0]:
        return "No known movies for: " + filters " in " + category
    else:
         return ("The average bechdel score for movies with " + filters + " in "  + category + " is " + str(result[0]/result[1]) + " with " + str(result[0]) + " movies.")



if __name__ == '__main__':
   app.run(debug = True)