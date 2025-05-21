from flask import Flask, request, jsonify
import pandas as pd
from textblob import TextBlob
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

def analyze_sentiment(comment):
    """Analyzes sentiment using TextBlob and returns Positive, Negative, or Neutral."""
    if not isinstance(comment, str) or not comment.strip():
        return "Neutral"  # Handle empty or non-string comments
    analysis = TextBlob(comment)
    polarity = analysis.sentiment.polarity
    return "Positive" if polarity > 0 else "Negative" if polarity < 0 else "Neutral"

@app.route("/", methods=["GET"])
def home():
    """Health check endpoint to verify if the Flask server is running."""
    return jsonify({"message": "Server is running!"}), 200

@app.route("/upload", methods=["POST"])
def upload_file():
    """Handles CSV file upload, detects the correct text column, and processes sentiment analysis."""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files["file"]
    
    try:
        # Read CSV file (auto-detect delimiter)
        df = pd.read_csv(file, delimiter=None)

        # Find a column with text data (e.g., comments, feedback, review)
        text_columns = [col for col in df.columns if df[col].dtype == "object"]

        if not text_columns:
            return jsonify({"error": "No text column found in CSV"}), 400
        
        # Use the first detected text column for sentiment analysis
        text_column = "Comment" if "Comment" in df.columns else text_columns[0]
        print(f"Using column: {text_column}")
        
        # Drop rows where text column is empty
        df = df.dropna(subset=[text_column])
        
        # Analyze sentiment for each row
        df["Sentiment"] = df[text_column].apply(analyze_sentiment)
        
        # Count sentiment distribution
        sentiment_counts = df["Sentiment"].value_counts().to_dict()

        return jsonify({
            "feedback": df.to_dict(orient="records"),
            "stats": sentiment_counts
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
