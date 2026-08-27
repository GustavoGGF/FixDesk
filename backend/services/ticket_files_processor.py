import threading
from io import BytesIO
from base64 import b64encode
from typing import Iterable, Tuple, List, Any
from PIL import Image, UnidentifiedImageError
import magic

_magic_local = threading.local()

def get_magic_instance() -> magic.Magic:
    """
    Retorna uma instância thread-local do Magic.
    
    Garante que a instância do Magic seja reutilizada de forma segura
    entre múltiplas threads, evitando custos de inicialização repetida.
    
    Returns:
        magic.Magic: Instância configurada da biblioteca magic.
    """
    if not hasattr(_magic_local, "instance"):
        _magic_local.instance = magic.Magic()
    return _magic_local.instance

def process_ticket_files(ticket_files: Iterable[Any]) -> Tuple[List[Any], List[str], List[str]]:
    """
    Processa uma coleção de arquivos anexados e retorna listas organizadas de dados.
    
    Esta função foi extraída da camada de views para respeitar o Princípio de
    Responsabilidade Única (SRP) do SOLID. Além disso, recebe um iterável de
    arquivos em vez do ticket em si, o que permite ao chamador utilizar
    prefetch_related para resolver o problema de consultas N+1.
    
    Args:
        ticket_files (Iterable[Any]): Coleção de instâncias de TicketFile.
        
    Returns:
        Tuple[List[Any], List[str], List[str]]: Tupla contendo dados da imagem, 
                                                conteúdo do arquivo e nome do arquivo.
    """
    image_data: List[Any] = []
    content_file: List[str] = []
    name_file: List[str] = []

    mime = get_magic_instance()

    for tf in ticket_files:
        raw = tf.data
        if not raw:
            continue

        fn = tf.file_name or "file"

        try:
            img_buf = BytesIO(raw)
            pil = Image.open(img_buf)
            out = BytesIO()
            pil.save(out, format="PNG")

            image_data.append({"image": b64encode(out.getvalue()).decode()})
            content_file.append("img")
            name_file.append(fn)
            continue

        except UnidentifiedImageError:
            ft = (tf.file_type or mime.from_buffer(raw)).lower()
            if ft.startswith("technical:"):
                ft = ft.removeprefix("technical:")
            ft_clean = ft.split(",")[0].split("(")[0].strip()

            mapping = {
                "mail": "mail",
                "rfc 822 mail": "mail",
                "application/vnd.ms-outlook": "mail",
                "cdfv2 microsoft outlook message": "mail",
                "excel": "excel",
                "composite document file v2 document": "excel",
                "microsoft excel 2007+": "excel",
                "zip": "zip",
                "utf-8 text": "txt",
                "ascii text": "txt",
                "microsoft word": "word",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "word",
                "pdf document": "pdf",
                "application/pdf": "pdf",
            }

            for k, v in mapping.items():
                if ft_clean.startswith(k):
                    image_data.append(v)
                    content_file.append(b64encode(raw).decode())
                    name_file.append(fn)
                    break

    return image_data, content_file, name_file


def verify_valid_or_not(
    file_bytes: bytes, file_name: str, allowed_types: list[str] | None
) -> tuple[bool, str]:
    """
    Verifica se os bytes de um arquivo correspondem a um tipo permitido.

    Garante validação rápida usando o Magic thread-local e, se falhar,
    tenta adivinhar o tipo com base no nome do arquivo (mimetypes.guess_type).

    :param file_bytes: Bytes do arquivo a ser validado.
    :param file_name: Nome do arquivo para fallback de validação.
    :param allowed_types: Lista pré-processada de tipos válidos em minúsculas.
    :return: Uma tupla contendo um booleano indicando validade e a string do tipo MIME identificado.
    """
    if not allowed_types:
        return False, ""

    mime = get_magic_instance()
    file_type = mime.from_buffer(file_bytes)
    file_type_clean = file_type.split(",")[0].strip().lower()

    valid = any(t in file_type_clean for t in allowed_types)

    if not valid:
        from mimetypes import guess_type
        guessed = guess_type(file_name)
        if guessed[0]:
            guessed_clean = guessed[0].lower()
            if any(t in guessed_clean for t in allowed_types):
                valid = True

    return valid, file_type
