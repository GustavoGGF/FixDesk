# Use a imagem base do Python
FROM python:3.10.12

# Set the working directory in the container
WORKDIR /FixDesk

# Copy the current directory contents into the container at /app
COPY . /FixDesk

# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt

# Expose port 8000 to the outside world
EXPOSE 8000

# Define the command to run your application
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]