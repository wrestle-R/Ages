FROM python:3.14.1

WORKDIR /ages

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY . .

CMD ["python","app.py"]