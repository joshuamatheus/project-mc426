FROM python:3.10

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

RUN apt-get update && apt-get install -y sqlite3

RUN pip install --no-cache-dir geopy
RUN pip install --no-cache-dir python-multipart

COPY ./app/assets/pointsOfInterest.json /app/app/assets/pointsOfInterest.json
COPY ./app/assets/creatures.json /app/app/assets/creatures.json

COPY . .

EXPOSE 9000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "9000"]