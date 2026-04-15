from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "Agro-Nexus Backend Running 🚀"


# Mandi API Configuration
MANDI_RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070'
MANDI_API_KEY = os.getenv('GOV_DATA_API_KEY', '579b464db66ec23bdd000001a02d583913d449c85bebb4d5fa74463f')

@app.route('/api/mandi', methods=['GET'])
def get_mandi_data():
    limit = request.args.get('limit', 20)
    url = f"https://api.data.gov.in/resource/{MANDI_RESOURCE_ID}?api-key={MANDI_API_KEY}&format=json&limit={limit}"
    try:
        response = requests.get(url)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict_disease():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    # Mock prediction logic for the Python backend
    # In a real scenario, this would load a TensorFlow/PyTorch model
    return jsonify({
        "class": "Healthy (Python Mock)",
        "confidence": 0.98,
        "predictions": {
            "Healthy": 0.98,
            "Diseased": 0.02
        }
    })

if __name__ == '__main__':
    # Port 5000 for Mandi, Port 5001 for Prediction (as per frontend calls)
    # Note: Flask usually runs on one port. If the user had two ports, 
    # they might have been running two separate scripts or a proxy.
    # We'll default to 5000 here.
    app.run(host='0.0.0.0', port=5000)


