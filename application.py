import os
import re
from flask import Flask, jsonify, render_template, request

# DATABASE_URL = "sqlite:///movies.db"

DATABASE_URL = "postgres://qekvcnyebnsgvd:6ed23855e6c43cb2c3e6827668f5fdbedcec79b312e51fb643f01bb1734070ee@ec2-54-235-156-60.compute-1.amazonaws.com:5432/dcsk9j9tcn3eej" # os.environ['DATABASE_URL']

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
    countryresult = cursor.execute("SELECT * FROM list LIMIT 5")
    print(countryresult)
    countryresult = db.execute("SELECT SUM(rating), COUNT(rating) FROM list WHERE country LIKE :country", country="%" + country + "%")[0]
    print(countryresult)
    if not countryresult:
        return "No known movies for: " + country
    else:
         return ("The average bechdel score for movies from " + country + " is " + str(countryresult['SUM(rating)']/countryresult['COUNT(rating)']) + " with " + str(countryresult['COUNT(rating)']) + " movies.")



if __name__ == '__main__':
   app.run(debug = True)