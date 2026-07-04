FROM python:3.11-slim

# Install system dependencies required for OpenCV, Tesseract, and FastText
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-hin \
    build-essential \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Hugging Face Spaces requires a non-root user with UID 1000
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# Copy requirements and install
COPY --chown=user:user backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/requirements.txt

# Download spaCy model
RUN python -m spacy download en_core_web_sm

# Copy the rest of the backend codebase
COPY --chown=user:user backend /app/backend

# We need to run from the backend directory to resolve app modules
WORKDIR /app/backend

# Download the FastText model directly into the models folder
RUN mkdir -p app/models && \
    wget -O app/models/lid.176.ftz https://dl.fbaipublicfiles.com/fasttext/supervised-models/lid.176.ftz

# Hugging Face Spaces runs on port 7860
EXPOSE 7860

# Run the FastAPI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
