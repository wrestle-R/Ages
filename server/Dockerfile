FROM python:3.12.10

WORKDIR /ages

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY . .

CMD ["python","app.py"]