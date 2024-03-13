from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from streamlit import calculate_similarity, extract_text


app = Flask(__name__)
CORS(app)

@app.route('/upload', methods=['POST'])
def upload_file():
    uploaded_file = request.files["file"]
    user_input_jd = request.form.get("job_description")
    entity = extract_text(uploaded_file)
    percentage = calculate_similarity(entity,user_input_jd)
    print(percentage)
    file_name = uploaded_file.filename
    file_name =  os.path.splitext(file_name)[0].lower()
    return {"file_name":file_name,"score":percentage}


@app.route('/extractEntity', methods=['POST'])
def extract_entity():
    uploaded_file = request.files["job_description"]
    entity = extract_text(uploaded_file)

    return entity


if __name__ == '__main__':
    app.run(debug=True)