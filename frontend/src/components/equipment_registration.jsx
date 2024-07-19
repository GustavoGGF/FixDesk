/**
 * Importações internas necessárias para este componente.
 * - React: permite a criação e manipulação de componentes React.
 * - useState: hook que possibilita a adição de estado a componentes funcionais.
 * - useRef: hook que fornece uma maneira de armazenar referências a elementos DOM ou valores mutáveis que persistem entre as renderizações.
 * - useEffect: hook utilizado para executar efeitos colaterais em componentes funcionais, como ações após renderizações.
 */
import React, { useState, useEffect, useRef } from "react";

/**
 * Importações de elementos DOM e imagens necessárias para este componente.
 * - TicketOpen: constante representando um elemento DOM relacionado à abertura de tickets.
 * - DivUpload: constante representando um elemento DOM para upload.
 * - HeaderFiles, BodyFiles, FooterFiles: constantes representando elementos DOM para cabeçalho, corpo e rodapé de arquivos.
 * - PFiles, PFiles2: constantes representando elementos DOM para parágrafos relacionados a arquivos.
 * - IMGFile, IMGFile2: constantes representando elementos DOM para imagens relacionadas a arquivos.
 * - Span1, Span2, Span3: constantes representando elementos DOM para spans.
 * - B1: constante representando um elemento DOM para texto em negrito.
 * - InputFiles: constante representando um elemento DOM para input de arquivos.
 * - ListFiles: constante representando um elemento DOM para listagem de arquivos.
 * - Divider: constante representando um elemento DOM para um divisor.
 * - IMGClose: constante representando um elemento DOM para uma imagem de fechamento.
 * - Cloud: importação da imagem "cloud-uploading.png" localizada em "../images/components".
 * - Message: componente utilizado para exibir mensagens ao usuário.
 * - Close: importação da imagem "close.png" localizada em "../images/components".
 */
import {
  TicketOpen,
  DivUpload,
  HeaderFiles,
  PFiles,
  IMGFile,
  Span1,
  Span2,
  BodyFiles,
  PFiles2,
  B1,
  InputFiles,
  IMGFile2,
  FooterFiles,
  Divider,
  Span3,
  ListFiles,
  IMGClose,
} from "../styles/Equipment_RegistrationStyle";
import Cloud from "../images/components/cloud-uploading.png";
import Message from "./message";
import Close from "../images/components/close.png";
/**
 * Componente responsável pelo registro de equipamentos.
 * @param {string} token - Token de autenticação para CSRF.
 * @param {string} equipamentforuser - Nome do equipamento associado ao usuário.
 * @param {function} CloseFunct - Função de callback para fechar o componente.
 */
export default function Equipment_Registration({ token, equipamentforuser, CloseFunct }) {
  /**
   * Variáveis de estado utilizadas neste componente de registro de equipamentos.
   * - fileName: estado que armazena o nome do arquivo selecionado.
   * - fileImg: estado que armazena a imagem do arquivo selecionado.
   * - modelEquipament: estado que armazena o modelo do equipamento.
   * - companyName: estado que armazena o nome da empresa associada ao equipamento.
   * - message: estado que controla a exibição de mensagens no componente.
   * - typeError: estado que define o tipo de erro ocorrido.
   * - messageError: estado que armazena a mensagem de erro a ser exibida.
   */
  const [fileName, setFileName] = useState("");
  const [fileImg, setFileImg] = useState();
  const [modelEquipament, setModelEquipament] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [message, setMessage] = useState(false);
  const [typeError, setTypeError] = useState("");
  const [messageError, setMessageError] = useState("");

  /**
   * Variáveis de referência utilizadas para acessar elementos do DOM neste componente.
   * - inputName: referência ao input para o nome do equipamento.
   * - nameFile: referência ao input para o nome do arquivo.
   * - selectCompany: referência ao select para a seleção da empresa.
   */
  const inputName = useRef(null);
  const nameFile = useRef(null);
  const selectCompany = useRef(null);

  /**
   * Função ativada quando uma imagem é arrastada e solta no campo de upload.
   * - Define a imagem selecionada como estado.
   * - Define o nome do arquivo como estado.
   * - Atualiza o texto exibido no campo de nome do arquivo.
   * @returns {string} - Nome do arquivo selecionado.
   */
  function inputDrop() {
    setFileImg(inputName.current.files[0]);
    setFileName(inputName.current.files[0].name);

    return (nameFile.current.innerText = inputName.current.files[0].name);
  }

  /**
   * Função utilizada para obter o nome do equipamento a partir do evento de mudança.
   * @param {object} event - Evento de mudança que aciona a função.
   * @returns {string} - Nome do equipamento inserido.
   */
  function modelEquip(event) {
    const newModel = event.target.value;
    setModelEquipament(newModel);

    return modelEquipament;
  }

  /**
   * Efeito colateral utilizado para animar o campo de upload de imagens.
   * - Este efeito é condicionado ao valor da variável equipamentforuser.
   * - O efeito será executado sempre que equipamentforuser for modificado.
   * - Este efeito manipula o DOM para adicionar classes e executar animações.
   */
  useEffect(() => {
    if (equipamentforuser === true) {
      //DOM
      const $ = document.querySelector.bind(document);

      //APP
      let App = {};
      App.init = (function () {
        //Init
        function handleFileSelect(evt) {
          const files = evt.target.files; // FileList object

          //files template
          let template = `${Object.keys(files).join("")}`;

          $("#drop").classList.add("hidden");
          $("footer").classList.add("hasFiles");
          $("#importar").classList.add("active");
          setTimeout(() => {
            $("#list-files").innerHTML = template;
          }, 1000);

          Object.keys(files).forEach((file) => {
            let load = 2000 + file * 2000; // fake load
            setTimeout(() => {
              $(`.file--${file}`).querySelector(".progress").classList.remove("active");
              $(`.file--${file}`).querySelector(".done").classList.add("anim");
            }, load);
          });
        }

        // drop events
        $("#drop").ondragleave = (evt) => {
          $("#drop").classList.remove("active");
          $("#divider").classList.remove("overflow-hidden");
          evt.preventDefault();
        };
        $("#drop").ondragover = $("#drop").ondragenter = (evt) => {
          $("#drop").classList.add("active");
          evt.preventDefault();
        };
        $("#drop").ondrop = (evt) => {
          $("input[type=file]").files = evt.dataTransfer.files;
          $("footer").classList.add("hasFiles");
          $("#divider").classList.remove("overflow-hidden");
          $("#divider").classList.add("lineTop");
          $("#drop").classList.remove("active");
          evt.preventDefault();
        };

        //upload more
        $("#importar").addEventListener("click", () => {
          $("#list-files").innerHTML = "";
          $("footer").classList.remove("hasFiles");
          $("#importar").classList.remove("active");
          setTimeout(() => {
            $("#drop").classList.remove("hidden");
          }, 500);
        });

        // input change
        $("input[type=file]").addEventListener("change", handleFileSelect);
      })();
    } else {
      return;
    }
  }, [equipamentforuser]);

  /**
   * Função utilizada para salvar o nome da empresa associada ao equipamento cadastrado.
   */
  function Select_Company() {
    var option = selectCompany.current.options[selectCompany.current.selectedIndex].value;

    switch (option) {
      default:
        break;
      case "none":
        break;
      case "csc":
        setCompanyName("CSC");
        break;
      case "ropes":
        setCompanyName("ROPES");
        break;
      case "fiber":
        setCompanyName("FIBER");
        break;
      case "vera":
        setCompanyName("VERA");
        break;
      case "mna":
        setCompanyName("MNA");
        break;
    }
  }

  /**
   * Função utilizada para realizar o cadastro do equipamento.
   */
  function updateEquipament() {
    if (fileName.length === 0) {
      setTypeError("Dados insuficientes");
      setMessageError("Imagem do equipamento obrigatoria");
      return setMessage(true);
    }

    if (companyName.length === 0) {
      setTypeError("Dados insuficientes");
      setMessageError("Filial obrigatória");
      return setMessage(true);
    }

    if (modelEquipament.length === 0) {
      setTypeError("Dados insuficientes");
      setMessageError("Modelo Obrigatório");
      return setMessage(true);
    }

    const formData = new FormData();

    formData.append("image", fileImg);
    formData.append("company", companyName);
    formData.append("model", modelEquipament);

    fetch("equipment_inventory/", {
      method: "POST",

      headers: {
        "X-CSRFToken": token,
      },
      body: formData,
    })
      .then((response) => {
        if (response.status === 200) {
          return window.location.reload();
        }
        return response.json();
      })
      .catch((err) => {
        setMessageError(err);
        setTypeError("Fatal ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  /**
   * Função para fechar a menssagem
   */
  function closeMessage() {
    return setMessage(false);
  }

  return (
    <TicketOpen className="position-fixed top-50 start-50 translate-middle z-2">
      <div className="w-100 d-flex justify-content-end">
        <IMGClose src={Close} className="img-fluid" onClick={CloseFunct} />
      </div>
      {message && <Message MessageError={messageError} TypeError={typeError} CloseMessage={closeMessage} />}
      <h3 className="text-center mt-1">Cadastro de Equipamentos</h3>
      <p className="text-center">Imagem do Equipamento</p>
      <DivUpload className="upload">
        <div className="upload-files">
          <HeaderFiles className="justify-content-center">
            <PFiles>
              <IMGFile2 src={Cloud} alt="" />
              <Span1 className="up">up</Span1>
              <Span2 className="load">load</Span2>
            </PFiles>
          </HeaderFiles>
          <BodyFiles className="body" id="drop" onDrop={() => inputDrop()}>
            <IMGFile src={File} alt="" />
            <PFiles2 className="pointer-none">
              <B1>Arraste e Solte</B1> a imagem do equipamento aqui
            </PFiles2>
            <InputFiles type="file" ref={inputName} />
          </BodyFiles>
          <FooterFiles id="footerFiles">
            <Divider className="divider overflow-hidden" id="divider">
              <Span3 className="mb-3">FILE</Span3>
            </Divider>
            <ListFiles className="list-files" id="list-files">
              <p ref={nameFile}></p>
            </ListFiles>
            <input type="text" className="form-control mx-auto mb-2" placeholder="Modelo" onChange={modelEquip} />
            <select className="form-select mx-auto w-25" ref={selectCompany} id="select_company" onChange={Select_Company}>
              <option value="none" selected disabled>
                Filial
              </option>
              <option value="csc">CSC</option>
              <option value="fiber">Fiber</option>
              <option value="ropes">Ropes</option>
              <option value="vera">Vera</option>
              <option value="mna">MNA</option>
            </select>
            <button id="importar" className="btn btn-success mt-3" onClick={updateEquipament}>
              Cadastrar Equipamento
            </button>
          </FooterFiles>
        </div>
      </DivUpload>
    </TicketOpen>
  );
}
