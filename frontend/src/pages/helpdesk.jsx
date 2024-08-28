import Cloud from "../images/components/cloud-uploading.png";
import Exclude from "../images/components/lixo.png";
import Info from "../components/info";
import Loading from "../components/loading";
import Message from "../components/message";
import NavBar from "../components/navbar";
import "react-day-picker/dist/style.css";
import React, { useEffect, useRef, useState, createContext } from "react";
import "../styles/bootstrap/css/bootstrap.css";
import {
  BtnFile,
  Div,
  DivNameFile,
  Form,
  ImgFile,
  Input,
  InputFile,
  PNameFile,
  Textarea,
  TitlePage,
  B1,
  BodyFiles,
  Divider,
  DivUpload,
  FooterFiles,
  HeaderFiles,
  IMGFile,
  IMGFile2,
  InputFiles,
  ListFiles,
  PFiles,
  PFiles2,
  Span1,
  Span2,
  Span3,
} from "../styles/helpdeskStyle";
import TicketsOptions from "../components/ticketsOptions";

export const ValorContext = createContext();
export default function Helpdesk() {
  useEffect(() => {
    // Este useEffect é executado uma vez após o componente ser montado.
    // O array de dependências vazio ([]) garante que o código dentro deste useEffect
    // seja executado apenas na montagem inicial do componente e não em atualizações subsequentes.

    // Define o título da página
    document.title = "Abrir Chamado";

    // Recupera o tema armazenado no localStorage
    const theme = localStorage.getItem("Theme");

    // Se o tema for "light", aplica o tema claro
    if (theme === "light") {
      ThemeLight();
    } else {
      // Caso contrário, define o tema como "black" e aplica o tema preto
      // Isso cobre o caso onde o tema é "null" ou qualquer outro valor que não seja "light"
      localStorage.setItem("Theme", "black");
      ThemeBlack();
    }
  }, []); // Array de dependências vazio

  // Declarando variáveis de estado String
  const [csrfToken, setCSRFToken] = useState("");
  const [infoClass, setInfoClass] = useState("");
  const [infoClass2, setInfoClass2] = useState("");
  const [infoID, setInfoID] = useState("");
  const [messageError, setMessageError] = useState("");
  const [nameOnDropFiles, setNameOnDropFiles] = useState("");
  const [nameOnInutFiles, setNameOnInputFiles] = useState("");
  const [observation, setObservation] = useState("");
  const [messagetitle, setMessagetitle] = useState("");
  const [sector, setSector] = useState("");
  const [occurrence, setOccurrence] = useState("");
  const [problemn, setProblemn] = useState("");
  const [equipamentSelected, setEquipamentSelected] = useState("");
  const [typeError, setTypeError] = useState("");
  const [theme, setTheme] = useState("");
  const [themeTicket, setThemeTicket] = useState("");
  const [respectiveArea, setRespectiveArea] = useState("");
  const [messageinfo1, setMessageinfo1] = useState("");
  const [messageinfo2, setMessageinfo2] = useState("");
  // Declarando variaveis de estado Boolean

  const [dashboard, setDashboard] = useState(false);
  const [fileSizeNotify, setFileSizeNotify] = useState(false);
  const [info, setInfo] = useState(false);
  const [inputDropControl, setInputDropControl] = useState(true);
  const [inputManualControl, setInputManualControl] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reset, setReset] = useState(false);
  const [message, setMessage] = useState(false);
  const [navbar, setNavbar] = useState(false);
  const [alertverify, setAlertVerify] = useState(false);
  const [alert, setAlert] = useState(false);

  // Declarando variaveis de estado Vazias
  const [dataUser, setdataUser] = useState();

  // Declarando varaiveis de estado array
  const [arrayInput, setArrayInput] = useState([]);
  const [daysForAlocate, setDaysForAlocate] = useState([]);
  const [fileimg, setFileImg] = useState([]);
  const [filename, setFileName] = useState([]);

  // Declarando Variaveis Null
  const observationRef = useRef(null);
  const primaryContainerRef = useRef(null);

  let file_name = [];

  // const respectiveAr = useContext(ValorContext);

  // Função que muda o tema pra escuro
  function ThemeBlack() {
    setThemeTicket("");
    setTheme("themeBlack");
  }

  // Função que muda o tema para claro
  function ThemeLight() {
    setThemeTicket("themeLightTicket");
    setTheme("themeLight");
  }

  // Ao iniciar a pagina pega dados do backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          body: {},
        });
        if (!response.ok) {
          // Lançar um erro se a resposta não for ok
          const errorData = await response.text(); // Obtém o texto de erro, se disponível
          throw new Error(`Erro na solicitação: ${errorData}`);
        }
        const data = await response.json();
        // Atualiza os estados com os dados recebidos
        setCSRFToken(data.token);
        // Processa dados do localStorage com segurança
        const storedDataUser = localStorage.getItem("dataInfo");
        const dataUserInfo = storedDataUser ? JSON.parse(storedDataUser).data : null;
        setdataUser(dataUserInfo);
      } catch (error) {
        console.error("Erro na solicitação:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Verifica se dataUser existe e contém pelo menos uma chave
    if (dataUser && Object.keys(dataUser).length > 0) {
      // Atualiza os estados somente se a condição for atendida
      setLoading(false);
      setNavbar(true);
      setDashboard(true);
    }
  }, [dataUser]); // Dependência de dataUser para atualizar o efeito quando dataUser mudar

  // Função inicia quando dashboard é renderizado, realiza animação e funcionalidade para imagens adicionadas quando soltadas
  useEffect(() => {
    if (dashboard === true) {
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

          if (fileimg.length <= 0) {
            return;
          }

          $("#drop").classList.add("hidden");
          $("footer").classList.add("hasFiles");
          $(".importar").classList.add("active");
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
          for (let i = 0; i < evt.dataTransfer.files.length; i++) {
            setFileImg((itens) => [...itens, evt.dataTransfer.files[i]]);
          }

          $("footer").classList.add("hasFiles");
          $("#divider").classList.remove("overflow-hidden");
          $("#divider").classList.add("lineTop");
          $("#drop").classList.remove("active");
          evt.preventDefault();
        };

        //upload more
        $(".importar").addEventListener("click", () => {
          // $("#list-files").innerHTML = "";
          $("footer").classList.remove("hasFiles");
          $(".importar").classList.remove("active");
          setTimeout(() => {
            $("#drop").classList.remove("hidden");
          }, 500);
        });

        // input change
        $("input[type=file]").addEventListener("change", handleFileSelect);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboard]);

  /**
   * Atualiza o estado `observation` com o valor do input.
   * @param {Event} event - O evento de mudança do input.
   */
  function getObservation(event) {
    // Atualiza o estado com o valor do input
    setObservation(event.target.value);
  }

  /**
   * Esta função é responsável por enviar um novo ticket de chamado.
   *
   * @param {Event} event - O evento associado ao envio do formulário ou à ação que aciona a função.
   * @returns {void} - Esta função não retorna nada diretamente, mas realiza o envio do ticket de chamado.
   */
  function submitTicket(event) {
    event.preventDefault();
    /**
     * Dentro da função 'submitTicket', são realizadas validações para verificar se determinados campos foram preenchidos antes de enviar o ticket de chamado.
     * Se algum campo estiver vazio, um alerta é exibido indicando o problema específico.
     *
     * @param {String} respectiveArea - Uma String representando a área responsável pelo chamado.
     * @param {String} sector - Uma String representando o tipo de ocorrência.
     * @param {String} occurrence - Uma String representando o tipo de problema.
     * @param {String} problemn - Uma String representando o problema específico.
     * @param {String} setAlertVerify - Uma String para definir o estado do alerta de validação.
     * @param {String} setMessagetitle - Uma String para definir o título da mensagem de alerta.
     * @returns {void} - Esta função não retorna nada diretamente, mas exibe alertas se os campos necessários não forem preenchidos.
     */
    if (respectiveArea.length === 0) {
      setAlertVerify(true);
      setMessagetitle("Selecione a Área Responsável pelo Chamado");
      return;
    } else if (sector.length === 0) {
      setAlertVerify(true);
      setMessagetitle("Selecione um tipo de ocorrencia");
      return;
    } else if (occurrence.length === 0) {
      setAlertVerify(true);
      setMessagetitle("Selecione um tipo de problema");
      return;
    } else if (problemn.length === 0) {
      setAlertVerify(true);
      setMessagetitle("Selecione o problema em especifico");
      return;
    } else {
      setAlertVerify(false);
    }
    // * Caso nenhuma opção seja selecionada mostra mensagem e não cria o chamado

    // Obter o dia, mês e ano da dataUser atual
    var dataUserAtual = new Date();
    var dia = dataUserAtual.getDate();
    var mes = dataUserAtual.getMonth() + 1; // Os meses em JavaScript são indexados a partir de zero, por isso é necessário adicionar 1
    var ano = dataUserAtual.getFullYear();

    function adicionaZero(numero) {
      if (numero < 10) {
        return "0" + numero;
      }
      return numero;
    }
    var horaFormatada = adicionaZero(dataUserAtual.getHours()) + ":" + adicionaZero(dataUserAtual.getMinutes());

    // Formatar a dataUser no formato dd/mm/yy

    // Formatando para dataUser BR
    var dataUserFormatada = ano + "-" + ("0" + mes).slice(-2) + "-" + ("0" + dia).slice(-2) + " " + horaFormatada;

    /**
     * Inicialização de variáveis dentro do escopo da função ou bloco de código.
     *
     * @type {string} Status - Variável para armazenar o status do ticket de chamado.
     * @type {Array} NewDatesAlocate - Array vazio para armazenar novas datas alocadas.
     * @type {FormData} formdataUser - Objeto FormData para coletar dados de formulário.
     * @type {number} total_size - Variável para armazenar o tamanho total, inicializada com zero.
     */
    let Status;
    let NewDatesAlocate = [];
    const formdataUser = new FormData();
    var total_size = 0;

    if (filename.length > 0) {
      for (let i = 0; i < fileimg.length; i++) {
        const file = fileimg[i];
        total_size += file.size;
        formdataUser.append("image", file);
      }
    } else if (daysForAlocate.length > 0) {
      for (let dateObj of daysForAlocate) {
        const day = dateObj.getDate().toString().padStart(2, "0");
        const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
        const year = dateObj.getFullYear();
        const dateFormated = `${year}-${month}-${day}`;
        NewDatesAlocate.push(dateFormated);
      }
      formdataUser.append("id_equipament", equipamentSelected);
      formdataUser.append("days_alocated", NewDatesAlocate);
    }
    if (total_size > 10 * 1024 * 1024) {
      setMessage(true);
      setTypeError("Capacidade Máxima Ultrapassada");
      setMessageError("Capacidade Máxima de Arquivos Anexado é de 20MB");
      return;
    }
    formdataUser.append("ticketRequester", dataUser.name);
    formdataUser.append("department", dataUser.departament);
    formdataUser.append("mail", dataUser.mail);
    formdataUser.append("company", dataUser.company);
    formdataUser.append("sector", sector);
    formdataUser.append("occurrence", occurrence);
    formdataUser.append("problemn", problemn);
    if (observation.length < 2) {
      setMessageError("Obrigatório Escrever Obversação conforme o chamado");
      setTypeError("Falta de Dados");
      setMessage(true);
      return;
    }
    formdataUser.append("observation", observation);
    formdataUser.append("start_date", dataUserFormatada);
    formdataUser.append("PID", dataUser.pid);
    formdataUser.append("respective_area", respectiveArea);
    fetch("submitTicket/", {
      method: "POST",
      headers: {
        "X-CSRFToken": csrfToken,
        "Cache-Control": "no-cache",
      },
      body: formdataUser,
    })
      .then((response) => {
        Status = response.status;
        return response.json();
      })
      .then((dataUser) => {
        if (Status === 403) {
          setMessage(true);
          setTypeError("Falta de dados");
          setMessageError("PID Não cadastrado, favor contatar equipe de TI");
          return window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        } else if (Status === 200) {
          setInfoID(dataUser.id);
          setInfo(true);
          setInfoClass("animate__lightSpeedInRight");
          setReset(true);
          observationRef.current.value = "";
          setInfoClass2("closeInfo");
          setTimeout(() => {
            setInfo(false);
          }, 6000);
        } else if (Status === 320) {
          setMessage(true);
          setTypeError("Dados Inválidos");
          setMessageError("Arquivo Anexado Inválido");
          return window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        } else if (Status === 310) {
          setDaysForAlocate([]);
          const dates = dataUser.dates;
          var btn = document.querySelectorAll(".rdp-day");
          btn.forEach(function (b) {
            for (var i = 0; i < dates.length; i++) {
              var date = dates[i].slice(-2);
              if (b.textContent === date) {
                b.classList.remove("rdp-day_selected");
                b.disabled = true;
              }
            }
          });

          setMessage(true);
          setTypeError("Dados Inválidos");
          setMessageError("dataUser de Alocação Indisponivel");
          return window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      })
      .catch((err) => {
        return console.log(err);
      });
  }

  // Fechar menssagem
  function closeMessage() {
    setMessage(false);
  }

  // Apos soltar um arquivo para upload é chamado essa função que mostra qual arquivo foi anexado
  // e seu tamanho
  function inputDrop() {
    setInputDropControl(true);
    setInputManualControl(false);
    file_name = fileimg.map((fileItem) => fileItem.name);
    setFileName(file_name);

    const paragraphs = file_name.map((fileName, index) => (
      <DivNameFile>
        <PNameFile key={index} className="text-break">
          {fileName}
        </PNameFile>
        <div>
          {(() => {
            const file = fileimg[index];
            const sizeInBytes = file.size;
            let size;
            let unit;

            if (sizeInBytes >= 1024 * 1024) {
              size = sizeInBytes / (1024 * 1024);
              unit = "MB";
            } else {
              size = sizeInBytes / 1024;
              unit = "KB";
            }

            return `${size.toFixed(2)} ${unit}`;
          })()}
        </div>
        <BtnFile
          type="button"
          onClick={() => {
            fileimg.splice(index, 1);
            inputDrop();
            const divider = document.getElementById("divider");
            divider.classList.remove("lineTop");
          }}
        >
          <ImgFile src={Exclude} alt="Excluir arquivo" />
        </BtnFile>
      </DivNameFile>
    ));

    const Div = <div className="w-100">{paragraphs}</div>;

    setNameOnDropFiles(Div);
    setFileSizeNotify(true);
  }

  // Apos enviar um arquivo para upload é chamado essa função que mostra qual arquivo foi anexado
  // e seu tamanho
  function inputManual(event) {
    // setInputDropControl(false);
    setInputManualControl(true);

    const files = event.target.files;

    const fileList = Array.from(files);
    setArrayInput(fileList);

    const drop = document.getElementById("drop");
    drop.classList.add("hidden");
    const divider = document.getElementById("divider");
    divider.classList.add("lineTop");

    const paragraphs = fileList.map((file, index) => (
      <DivNameFile>
        <PNameFile key={index} className="text-break">
          {file.name}
        </PNameFile>
        <div>
          {(() => {
            const file = fileList[index];
            const sizeInBytes = file.size;
            let size;
            let unit;

            if (sizeInBytes >= 1024 * 1024) {
              size = sizeInBytes / (1024 * 1024);
              unit = "MB";
            } else {
              size = sizeInBytes / 1024;
              unit = "KB";
            }

            return `${size.toFixed(2)} ${unit}`;
          })()}
        </div>
        <BtnFile
          type="button"
          onClick={() => {
            const drop = document.getElementById("drop");
            drop.classList.remove("hidden");
            const divider = document.getElementById("divider");
            divider.classList.remove("lineTop");
            removeFile(index);
          }}
        >
          <ImgFile src={Exclude} alt="Excluir arquivo" />
        </BtnFile>
      </DivNameFile>
    ));

    setNameOnInputFiles(paragraphs);
    setFileSizeNotify(true);
  }

  // Função que remove arquivo anexado para upload
  function removeFile(indexToRemove) {
    if (arrayInput.length < 1) {
      setNameOnInputFiles("");
      setInputManualControl(false);
      return;
    }

    const updatedFiles = arrayInput.filter((_, index) => index !== indexToRemove);
    setArrayInput(updatedFiles);

    const updatedParagraphs = updatedFiles.map((file, index) => (
      <DivNameFile key={index}>
        <PNameFile className="text-break">{file.name}</PNameFile>
        <BtnFile type="button" onClick={() => removeFile(index)}>
          <ImgFile src={Exclude} alt="Excluir arquivo" />
        </BtnFile>
      </DivNameFile>
    ));

    const drop = document.getElementById("drop");
    drop.classList.add("hidden");
    const divider = document.getElementById("divider");
    divider.classList.add("lineTop");

    setNameOnInputFiles(updatedParagraphs);
  }

  // Fechar informação
  function closeInfo() {
    setInfo(false);
  }

  // Pega a variavel de estado typeError
  const getTypeError = (value) => {
    setTypeError(value);
  };

  // Pega a variavel de estado messageError
  const getMessageError = (value) => {
    setMessageError(value);
  };

  // Pega a variavel de estado sector
  const getSector = (value) => {
    setSector(value);
  };

  // Pega a variavel de estado ocurrence
  const getOccurrence = (value) => {
    setOccurrence(value);
  };

  // Pega a variavel de estado problemn
  const getProblemn = (value) => {
    setProblemn(value);
  };

  // Pega a variavel de estado equipamentSelected
  const getEquipamentSelected = (value) => {
    setEquipamentSelected(value);
  };

  // Pega a variavel de estado messageInfo2
  const getMessageInfo2 = (value) => {
    setMessageinfo2(value);
  };

  // Pega a variavel de estado messageInfo1
  const getMessageInfo1 = (value) => {
    setMessageinfo1(value);
  };

  // Pega a variavel de estado messageTitle
  const getMessageTitle = (value) => {
    setMessagetitle(value);
  };

  // Pega a variavel de estado alertVerify
  const getAlertVerify = (value) => {
    setAlertVerify(value);
  };

  // Pega a variavel de estado alert
  const getAlert = (value) => {
    setAlert(value);
  };

  // Pega a variavel de estado respectiveArea
  const getRespectiveArea = (value) => {
    setRespectiveArea(value);
    console.log(value);
  };

  return (
    <Div className={theme}>
      {navbar && <NavBar Name={dataUser.name} JobTitle={dataUser.job_title} />}
      {info && <Info id={infoID} cls={infoClass} cls2={infoClass2} funct={closeInfo} />}
      {loading && (
        <div className="position-absolute top-50 start-50 translate-middle">
          <Loading />
        </div>
      )}
      {message && (
        <div className="position-fixed top-50 start-50 translate-middle z-3">
          <Message TypeError={typeError} MessageError={messageError} CloseMessage={closeMessage} />
        </div>
      )}
      {dashboard && (
        <Form className={`mx-auto d-flex flex-column align-items-center justify-content-around ${themeTicket}`} ref={primaryContainerRef}>
          <TitlePage>Criação de Chamados</TitlePage>
          <div className="mb-3">
            <input type="hidden" name="_csrf" value={csrfToken} />
            <label htmlFor="nameInput" className="form-label">
              Nome
            </label>
            <Input type="name" className="form-control" id="nameInput" value={dataUser.name} disabled />
          </div>
          <div className="mb-3">
            <label htmlFor="departmentInput" className="form-label">
              Departamento
            </label>
            <Input type="text" className="form-control" id="departmentInput" value={dataUser.departament || ""} disabled={dataUser.departament} />
          </div>
          <div className="mb-3">
            <label htmlFor="mailInput" className="form-label">
              Email
            </label>
            <Input type="text" className="form-control" id="mailInput" value={dataUser.mail || ""} disabled={dataUser.mail} />
          </div>
          <div className="mb-3">
            <label htmlFor="companyInput" className="form-label">
              Empresa
            </label>
            <Input type="text" className="form-control" id="companyInput" value={dataUser.company || ""} disabled={dataUser.company} />
          </div>
          <ValorContext.Provider
            value={{
              respectiveArea,
              setRespectiveArea: getRespectiveArea,
              alert,
              setAlert: getAlert,
              messagetitle,
              setMessagetitle: getMessageTitle,
              messageinfo1,
              setMessageinfo1: getMessageInfo1,
              messageinfo2,
              setMessageinfo2: getMessageInfo2,
              typeError,
              setTypeError: getTypeError,
              messageError,
              setMessageError: getMessageError,
              sector,
              setSector: getSector,
              occurrence,
              setOccurrence: getOccurrence,
              problemn,
              setProblemn: getProblemn,
              alertverify,
              setAlertVerify: getAlertVerify,
              equipamentSelected,
              setEquipamentSelected: getEquipamentSelected,
            }}
          >
            <TicketsOptions reset={reset} />
          </ValorContext.Provider>
          {alert && (
            <div className="alert alert-info d-flex flex-column" role="alert">
              <h5 className="fw-bold">{messagetitle}</h5>
              <span>{messageinfo1}</span>
              <span>{messageinfo2}</span>
            </div>
          )}
          {alertverify && (
            <div className="alert alert-danger" role="alert">
              <h5 className="fw-bold">{messagetitle}</h5>
            </div>
          )}
          <div className="d-flex flex-column">
            <div className="form-floating mb-3 mx-auto">
              <Textarea ref={observationRef} className="form-control" id="floatingTextarea2" onChange={getObservation}></Textarea>
              <label htmlFor="floatingTextarea2">Observação</label>
            </div>
            <h3 className="text-center mt-1">Upload de Arquivo</h3>
            <DivUpload className="upload">
              <div className="upload-files">
                <HeaderFiles>
                  <PFiles className="position-relative pointer w-100 h-100">
                    <IMGFile2 src={Cloud} alt="" />
                    <InputFile className="w-100 h-100 position-absolute pointer" type="file" multiple onChange={inputManual} />
                    <Span1 className="up">up</Span1>
                    <Span2 className="load">load</Span2>
                  </PFiles>
                </HeaderFiles>
                <BodyFiles id="drop" onDrop={() => inputDrop()}>
                  <IMGFile src={File} alt="" />
                  <PFiles2 className="pointer-none">
                    <B1>Arraste e Solte</B1> os arquivos aqui para fazer upload{" "}
                  </PFiles2>
                  <InputFiles type="file" id="inputManual" multiple />
                </BodyFiles>
                <FooterFiles>
                  <Divider className="divider overflow-hidden" id="divider">
                    <Span3 className="mb-3">FILE</Span3>
                  </Divider>
                  {inputDropControl && (
                    <ListFiles className="list-files" id="list-files">
                      {nameOnDropFiles}
                    </ListFiles>
                  )}
                  {inputManualControl && <ListFiles>{nameOnInutFiles}</ListFiles>}
                  {fileSizeNotify && <div className="mt-2">Limite Máximo de arquivo é de 20MB</div>}
                </FooterFiles>
              </div>
            </DivUpload>
          </div>
          <input type="submit" className="importar btn btn-primary mt-3 mb-3" onClick={submitTicket} value={"Enviar"} />
        </Form>
      )}
    </Div>
  );
}
