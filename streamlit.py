import streamlit as st
from sklearn.metrics.pairwise import cosine_similarity
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import nltk
import os

from flask import Flask, request, jsonify
from flask_cors import CORS

nltk.download('wordnet')
nltk.download('punkt')
nltk.download('stopwords')
from PIL import Image
import pytesseract
import requests
import re
import json
from docx import Document
import PyPDF2
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()

model = SentenceTransformer('bert-base-nli-mean-tokens')

def extract_text(file):

    file_name = file.filename
    file_extension = os.path.splitext(file_name)[1].lower()
    print(file,file_name,file_extension)
    if file_extension =="pdf" or file_extension ==".pdf":
        return extract_text_from_pdf(file)
    elif file.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" or file_extension == ".docx" or file_extension == ".doc":
        return extract_text_from_docx(file)
    elif file.mimetype.startswith("image") or file_extension==".png" or file_extension == ".jpg" or file_extension == ".jpeg":

        return extract_text_from_image(file)
    else:
        st.error("Unsupported file format. Please upload a PDF, DOCX, or an image.")

def extract_text_from_pdf(file):
        text = ""
        pdf_reader = PyPDF2.PdfReader(file)
        num_pages = len(pdf_reader.pages)

        for page_num in range(num_pages):
            page = pdf_reader.pages[page_num]
            text += page.extract_text()
        cleaned_text = preprocessing(text)
        entity = get_entity(cleaned_text)
        return entity

def extract_text_from_docx(file):
        text = ""
        doc = Document(file)
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        cleaned_text = preprocessing(text)
        entity = get_entity(cleaned_text)
        return entity

def extract_text_from_image(file):
        image = Image.open(file)
        text = pytesseract.image_to_string(image)
        cleaned_text = preprocessing(text)
        entity = get_entity(cleaned_text)
        return entity

def get_entity(text):
        temp = ''
        include = 'extract named entity'
        url = f'https://api.dandelion.eu/datatxt/nex/v1/?include={include}&text={text}&token=f69b378878d141f29f40aaaf093e5600'
        response = requests.get(url)
        data = json.loads(response.text)
        for i in data['annotations']:
            temp = temp + " " + str(i)
        return temp

def calculate_similarity(paragraph1, paragraph2):
        print('kk')
        embedding1 = model.encode([paragraph1])
        embedding2 = model.encode([paragraph2])
        similarity = cosine_similarity(embedding1, embedding2)[0][0]
        similarity_percentage = round(similarity * 100, 2)
        return similarity_percentage

def preprocessing(text):
        data = ''
        text_p = re.sub(r'[^\w\s]', '', text)
        tokens = nltk.word_tokenize(text_p)
        stop_words = set(stopwords.words('english'))
        without_stop_words = []
        for words in tokens:
            if words not in stop_words:
                without_stop_words.append(words)
        lemmatizer = WordNetLemmatizer()
        lemmatized_words = [lemmatizer.lemmatize(words) for words in without_stop_words]
        final_text = [x for i, x in enumerate(lemmatized_words) if x not in lemmatized_words[:i]]
        for i in final_text:
            data = data + ' ' + i
        return data

def main():

    st.header("RESUME - JOB DESCRIPTION ANALYZER")

    col1, col2 = st.columns(2)

    with col1:
        st.markdown('<style>div.file_input.UploadFile > label{height: 200px !important;}</style>',
                    unsafe_allow_html=True)
        uploaded_files = st.file_uploader("UPLOAD RESUME", type=["pdf", "docx", "image/*", "png", "jpg", "jpeg"],
                                          accept_multiple_files=True)

    with col2:
        st.markdown('<style>div.Widget.row-widget.stRadio > label{height: 200px !important;}</style>',
                    unsafe_allow_html=True)
        user_input_jd = st.text_input("ENTER JOB-DESCRIPTION", "", key='text_input')

    hide_footer_html = """
    <style>
    .css-cio0dv {
        visibility: hidden;
    }
    .css-14xtw13 {
        visibility: hidden;
    }
    </style>
    """

    st.markdown(hide_footer_html, unsafe_allow_html=True)

    scores = {}  # Dictionary to store scores for each resume

    if st.button("Submit") and uploaded_files is not None:
        for idx, uploaded_file in enumerate(uploaded_files):
            st.write(f"Processing Resume {idx + 1}")
            entity_of_resume = extract_text(uploaded_file)

            cleaned_text_jd = preprocessing(user_input_jd)


            entity_of_jd = get_entity(cleaned_text_jd)

            percentage = calculate_similarity(entity_of_resume, entity_of_jd)

            file_name = uploaded_file.name.split('.')[0]

            scores[file_name] = percentage


        scores_json = json.dumps(scores, indent=2)

        st.text("Scores:")
        st.json(scores)


if __name__ == "__main__":
    main()
