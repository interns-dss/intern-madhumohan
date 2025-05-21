from flask import Flask, request, jsonify
import pandas as pd
from textblob import TextBlob
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def analyze_sentiment(comment):
    analysis = TextBlob(comment)
    polarity = analysis.sentiment.polarity
    return "Positive" if polarity > 0 else "Negative" if polarity < 0 else "Neutral"

@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    df = pd.read_csv(file, delimiter=";")

    if "comments" not in df.columns:
        return jsonify({"error": "CSV must contain 'comments' column"}), 400

    df["Sentiment"] = df["comments"].apply(analyze_sentiment)

    sentiment_counts = df["Sentiment"].value_counts().to_dict()
    return jsonify({"feedback": 
df.to_dict(orient="records"), "stats": sentiment_counts})

if __name__ == "__main__":
    app.run(debug=True)