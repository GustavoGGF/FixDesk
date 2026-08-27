import pytest
from unittest.mock import MagicMock
from io import BytesIO
from PIL import Image
from services.ticket_files_processor import process_ticket_files

@pytest.fixture
def mock_ticket_file_image():
    tf = MagicMock()
    tf.file_name = "test_image.png"
    tf.file_type = "image/png"
    
    # Create a valid tiny PNG image
    img = Image.new('RGB', (10, 10), color = 'red')
    img_byte_arr = BytesIO()
    img.save(img_byte_arr, format='PNG')
    tf.data = img_byte_arr.getvalue()
    
    return tf

@pytest.fixture
def mock_ticket_file_pdf():
    tf = MagicMock()
    tf.file_name = "test_doc.pdf"
    tf.file_type = "application/pdf"
    tf.data = b"dummy_pdf_content"
    return tf

@pytest.fixture
def mock_ticket_file_unknown():
    tf = MagicMock()
    tf.file_name = "unknown.xyz"
    tf.file_type = "application/xyz"
    tf.data = b"unknown_content"
    return tf

def test_process_ticket_files_image(mock_ticket_file_image):
    image_data, content_file, name_file = process_ticket_files([mock_ticket_file_image])
    assert len(image_data) == 1
    assert "image" in image_data[0]
    assert content_file[0] == "img"
    assert name_file[0] == "test_image.png"

def test_process_ticket_files_pdf(mock_ticket_file_pdf):
    image_data, content_file, name_file = process_ticket_files([mock_ticket_file_pdf])
    assert len(image_data) == 1
    assert image_data[0] == "pdf"
    assert len(content_file[0]) > 0
    assert name_file[0] == "test_doc.pdf"

def test_process_ticket_files_no_data():
    tf = MagicMock()
    tf.data = None
    image_data, content_file, name_file = process_ticket_files([tf])
    assert len(image_data) == 0
    assert len(content_file) == 0
    assert len(name_file) == 0
