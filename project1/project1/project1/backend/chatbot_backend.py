from flask import Flask, request, jsonify
import json
import os
from difflib import get_close_matches

app = Flask(__name__)

# Load knowledge base
with open(os.path.join(os.path.dirname(__file__), 'chatbot_knowledge.json'), 'r') as f:
    knowledge = json.load(f)

@app.route('/chatbot', methods=['POST'])
def chatbot():
    data = request.get_json()
    question = data.get('question', '').strip().lower()
    # Find best matching question
    questions = [item['question'] for item in knowledge]
    match = get_close_matches(question, questions, n=1, cutoff=0.5)
    if match:
        answer = next(item['answer'] for item in knowledge if item['question'] == match[0])
    else:
        answer = "Sorry, I don't know the answer to that yet. Please ask a different question or try rephrasing."
    return jsonify({'answer': answer})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
