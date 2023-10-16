/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import {
  Div,
  DivDashPie,
  DropdownConten,
  Dropdown,
  DropdownButton,
  DivDrop,
  P1,
  DivUpload,
  HeaderFiles,
  PFiles,
  BodyFiles,
  FooterFiles,
  PFiles2,
  B1,
  IMGFile,
  InputFiles,
  Span1,
  Span2,
  Divider,
  Span3,
  ListFiles,
  IMGFile2,
} from "../styles/dashboardTIStyle";
import Loading from "../components/loading";
import DashBoardPie from "../components/dashboardPie";
import {
  TicketOpen,
  CloseBTN,
  Close,
  DivChat,
  IMGChat,
} from "../styles/historyStyle";
import CloseIMG from "../images/components/close.png";
import SendIMG from "../images/components/enviar.png";
import Cloud from "../images/components/cloud-uploading.png";
import File from "../images/components/upload-de-arquivo.png";
import Message from "../components/message";
import "../styles/bootstrap-5.3.0-dist/css/bootstrap.css";
import "../styles/bootstrap-5.3.0-dist/js/bootstrap.js";
import "../styles/bootstrap-5.3.0-dist/js/bootstrap.bundle";
import "../styles/bootstrap-5.3.0-dist/js/bootstrap.esm";

export default function DashboardTI() {
  const [loading, SetLoading] = useState(true);
  const [navbar, SetNavbar] = useState(false);
  const [userData, SetUserData] = useState([]);
  const [tickets, SetTickets] = useState([]);
  const [token, SetToken] = useState("");
  const [ticketNAME, SetTicketNAME] = useState("");
  const [ticketDEPARTMENT, SetTicketDEPARTMENT] = useState("");
  const [ticketMAIL, SetTicketMAIL] = useState("");
  const [ticketCOMPANY, SetTicketCOMPANY] = useState("");
  const [ticketSECTOR, SetTicketSECTOR] = useState("");
  const [ticketOCCURRENCE, SetTicketOCCURRENCE] = useState("");
  const [ticketPROBLEMN, SetTicketPROBLEMN] = useState("");
  const [ticketOBSERVATION, SetTicketOBSERVATION] = useState("");
  const [lifeTime, SetLifetime] = useState("");
  const [ticketResponsible_Technician, SetTicketResponsible_Technician] =
    useState("");
  const [ticketWindow, SetTicketWindow] = useState(false);
  const [ticketID, SetTicketID] = useState("");
  const [mountChat, SetMountChat] = useState([]);
  const [chat, SetChat] = useState(true);
  const [selectedTech, setSelectedTech] = useState("");
  const [techs, SetTechs] = useState([]);
  const [messageChat, SetMessageChat] = useState(false);
  const [typeError, SetTypeError] = useState("");
  const [messageError, SetMessageError] = useState("");
  const [textChat, SetTextChat] = useState("");
  const [message, SetMessage] = useState(false);
  const [equipamentforuser, SetEquipamentForUser] = useState(false);
  const [dropdownBTN, SetDropDownBTN] = useState(false);
  const [companyname, SetCompanyName] = useState("");
  const [filename, SetFileName] = useState("");
  const [fileimg, SetFileImg] = useState();
  const [modelequipament, SetModelEquipament] = useState("");

  useEffect(() => {
    fetch("", {
      method: "POST",
      headers: { Accept: "application/json" },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        SetTechs(data.techs);
        SetUserData(data.userData);
        SetToken(data.token);
        return userData;
      })
      .catch((err) => {
        console.log(err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
      SetNavbar(true);
      SetDropDownBTN(true);
      fetch("get_ticket_TI", {
        method: "GET",
        headers: { Accept: "application/json" },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          return SetTickets(data.tickets);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      return;
    }
  }, [userData]);

  useEffect(() => {
    if (tickets && Object.keys(tickets).length > 0) {
      const dashboard = document.getElementById("dashboard");
      SetLoading(false);
      SetNavbar(true);
      tickets.forEach((ticket) => {
        const div1 = document.createElement("div");
        div1.classList.add("DIV1");
        div1.addEventListener("click", () => {
          helpdeskPage({ id: ticket["id"] });
        });

        const H5 = document.createElement("h5");
        H5.classList.add("H5");
        H5.innerText = "chamado " + ticket["id"];

        const Span1 = document.createElement("span");
        Span1.classList.add("SPAN1");
        Span1.innerText = ticket["ticketRequester"];

        const Span2 = document.createElement("span");
        Span2.classList.add("SPAN1");
        Span2.innerText = "Ocorrência: " + ticket["occurrence"];

        const Span3 = document.createElement("span");
        Span3.classList.add("SPAN1");
        Span3.innerText = "Problema: " + ticket["problemn"];

        const Span4 = document.createElement("span");
        Span4.classList.add("SPAN1");
        Span4.innerText = ticket["start_date"];

        div1.appendChild(H5);
        div1.appendChild(Span1);
        div1.appendChild(Span2);
        div1.appendChild(Span3);
        div1.appendChild(Span4);
        dashboard.appendChild(div1);

        return SetLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets]);

  function helpdeskPage({ id }) {
    fetch("/helpdesk/ticket/" + id, {
      method: "GET",
      headers: {
        "X-CSRF-Token": token,
        pid: userData.pid,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((dataBack) => {
        const data = dataBack.data[0];
        setSelectedTech("");
        SetMessageChat(false);
        SetMountChat([]);
        const start_date = new Date(data.start_date);

        var CurrentDate = new Date();

        var calcDate = CurrentDate - start_date;

        var lifetime = Math.floor(calcDate / (1000 * 60 * 60 * 24));

        SetTicketNAME(data.ticketRequester);
        SetTicketDEPARTMENT(data.department);
        SetTicketMAIL(data.mail);
        SetTicketCOMPANY(data.company);
        SetTicketSECTOR(data.sector);
        SetTicketOCCURRENCE(data.occurrence);
        SetTicketPROBLEMN(data.problemn);
        SetTicketOBSERVATION(data.observation);
        SetLifetime(lifetime);
        SetTicketResponsible_Technician(data.responsible_technician);
        SetTicketID(data.id);

        var name_verify = userData.name;

        if (name_verify.includes("ADM")) {
          name_verify = name_verify.replace("ADM", "").trim();
        }

        if (data.responsible_technician === name_verify) {
          if (
            data.chat !== null &&
            data.chat !== undefined &&
            data.chat !== "undefined"
          ) {
            var arrayChat = data.chat.match(/\[.*?\]/g);

            const chatDiv = document.getElementById("chatDiv");
            chatDiv.style.background = "transparent";

            arrayChat.forEach(function (item) {
              if (item.includes("System")) {
                item = item
                  .replace("System:", "")
                  .replace("[", "")
                  .replace("]", "");
                const newItem = (
                  <div className="text-center d-flex justify-content-center text-break">
                    <p className="pChat">{item}</p>
                  </div>
                );
                SetMountChat((mountChat) => [...mountChat, newItem]);
              }
              if (item.includes("Technician")) {
                item = item
                  .replace("Technician:", "")
                  .replace("[", "")
                  .replace("]", "");
                const newItem = (
                  <div className="d-flex justify-content-end w-100 text-break">
                    <p className="tChat1">{item}</p>
                  </div>
                );
                SetMountChat((mountChat) => [...mountChat, newItem]);
              }
              if (item.includes("User")) {
                item = item
                  .replace("User:", "")
                  .replace("[", "")
                  .replace("]", "");
                const newItem = (
                  <div className="d-flex justify-content-start w-100 text-break">
                    <p className="uChat2">{item}</p>
                  </div>
                );
                SetMountChat((mountChat) => [...mountChat, newItem]);
              }
              SetChat(true);
              return mountChat;
            });
          }
        } else {
          const chatDiv = document.getElementById("chatDiv");
          chatDiv.style.background = "#e9ecef";
          SetChat(false);
          SetTypeError("Permissão Negada");
          SetMessageError("Assuma o Chamado para poder ver com mais detalhes");
          SetMessageChat(true);
        }

        return SetTicketWindow(true);
      })
      .catch((err) => {
        return console.log(err);
      });
    return SetTicketWindow(true);
  }

  function Close_ticket() {
    return SetTicketWindow(false);
  }

  function ChangeTechnician(event) {
    setSelectedTech(event.target.value);

    return selectedTech;
  }

  function closeMessage() {
    SetMessageChat(false);
  }

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
          $(".importar").classList.add("active");
          setTimeout(() => {
            $("#list-files").innerHTML = template;
          }, 1000);

          Object.keys(files).forEach((file) => {
            let load = 2000 + file * 2000; // fake load
            setTimeout(() => {
              $(`.file--${file}`)
                .querySelector(".progress")
                .classList.remove("active");
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
        $(".importar").addEventListener("click", () => {
          $("#list-files").innerHTML = "";
          $("footer").classList.remove("hasFiles");
          $(".importar").classList.remove("active");
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

  useEffect(() => {
    if (selectedTech.length > 1) {
      fetch("/helpdesk/ticket/" + ticketID, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": token,
        },
        body: JSON.stringify({
          responsible_technician: selectedTech,
          technician: userData.name,
        }),
      })
        .then((response) => {
          response.json();

          if (response.status === 200) {
            return window.location.reload();
          } else if (response.status === 304) {
            SetTypeError("Sistema Anti-Idiota");
            SetMessageError(
              "Está tentando transferir o Chamado para si mesmo sendo que já assumiu o mesmo??"
            );
            return SetMessage(true);
          }
        })
        .catch((err) => {
          return console.log(err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTech]);

  function NewChat(event) {
    const newText = event.target.value;
    SetTextChat(newText);

    return textChat;
  }

  function Select_Company() {
    const select = document.getElementById("select_company");
    var option = select.options[select.selectedIndex].value;

    if (option === "none") {
      return;
    } else if (option === "csc") {
      return SetCompanyName("CSC");
    } else if (option === "ropes") {
      return SetCompanyName("ROPES");
    } else if (option === "fiber") {
      return SetCompanyName("FIBER");
    } else if (option === "vera") {
      return SetCompanyName("VERA");
    } else if (option === "mna") {
      return SetCompanyName("MNA");
    }
  }

  function SendChat() {
    fetch("/helpdesk/ticket/" + ticketID, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      body: JSON.stringify({
        technician: userData.name,
        chat: textChat,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        return data;
      })
      .catch((err) => {
        return console.log(err);
      });
  }

  function closeMessage2() {
    SetMessage(false);
  }

  function dropdown() {
    const btn = document.getElementById("myDropdown");

    return btn.classList.toggle("showDP");
  }

  window.onclick = function (event) {
    if (
      !event.target.matches(".dropbtn") &&
      !event.target.matches(".dropdown-content")
    ) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains("showDP")) {
          openDropdown.classList.remove("showDP");
        }
      }
    }
  };

  function equipamentForUser() {
    return SetEquipamentForUser(true);
  }

  function inputDrop() {
    const input = document.getElementById("inputName");
    const p = document.getElementById("namefile");

    SetFileImg(input.files[0]);
    SetFileName(input.files[0].name);

    return (p.innerText = input.files[0].name);
  }

  function updateEquipament() {
    if (filename.length === 0) {
      SetTypeError("Dados insuficientes");
      SetMessageError("Imagem do equipamento obrigatoria");
      return SetMessage(true);
    }

    if (companyname.length === 0) {
      SetTypeError("Dados insuficientes");
      SetMessageError("Filial obrigatória");
      return SetMessage(true);
    }

    if (modelequipament.length === 0) {
      SetTypeError("Dados insuficientes");
      SetMessageError("Modelo Obrigatório");
      return SetMessage(true);
    }

    const formData = new FormData();

    formData.append("image", fileimg);
    formData.append("company", companyname);
    formData.append("model", modelequipament);

    console.log(modelequipament);

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
        return console.log(err);
      });
  }

  function modelEquip(event) {
    const newModel = event.target.value;
    SetModelEquipament(newModel);

    return modelequipament;
  }

  return (
    <Div className="position-relative">
      {navbar && <Navbar Name={userData.name} JobTitle={userData.job_title} />}
      {message && (
        <div className="position-absolute top-0 start-50 translate-middle-x mt-5 z-3">
          <Message
            TypeError={typeError}
            MessageError={messageError}
            CloseMessage={closeMessage2}
          />
        </div>
      )}
      {dropdownBTN && (
        <DivDrop className="position-absolute top-0 start-0">
          <Dropdown>
            <DropdownButton
              onClick={dropdown}
              className="dropbtn"
            ></DropdownButton>
            <DropdownConten id="myDropdown" className="dropdown-content">
              <P1 className="d-block" onClick={equipamentForUser}>
                Adicionar Equipamento
              </P1>
            </DropdownConten>
          </Dropdown>
        </DivDrop>
      )}
      <DivDashPie>
        <DashBoardPie sector={"TI"} />
      </DivDashPie>
      <div className="w-100 d-flex justify-content-center mt-5">
        {loading && <Loading />}
      </div>
      <div
        id="dashboard"
        className="container d-flex flex-wrap justify-content-around p-5 mt-5 w-100"
      ></div>{" "}
      {ticketWindow && (
        <TicketOpen className="position-fixed top-50 start-50 translate-middle">
          <CloseBTN
            onClick={Close_ticket}
            className="position-absolute top-0 end-0"
          >
            <Close src={CloseIMG} alt="" />
          </CloseBTN>
          {loading && <Loading />}
          <div className="overflow-hidden">
            <h3 className="text-center text-uppercase fw-bold text-danger mt-3">
              chamado {ticketID}
            </h3>
            <div className="d-flex flex-column">
              <input
                type="text"
                value={"Usuário: " + ticketNAME}
                className="form-control"
                disabled
              />
              <input
                type="text"
                value={"Departamento: " + ticketDEPARTMENT}
                className="form-control"
                disabled
              />
              <input
                type="text"
                value={"Email: " + ticketMAIL}
                className="form-control"
                disabled
              />
              <input
                type="text"
                value={"Unidade: " + ticketCOMPANY}
                className="form-control"
                disabled
              />
              <input
                type="text"
                value={"Setor: " + ticketSECTOR}
                className="form-control"
                disabled
              />
              <input
                type="text"
                value={"Ocorrência: " + ticketOCCURRENCE}
                className="form-control"
                disabled
              />
              <input
                type="text"
                value={"Problema: " + ticketPROBLEMN}
                className="form-control"
                disabled
              />
              <input
                type="text"
                value={
                  ticketOBSERVATION
                    ? "Observação: " + ticketOBSERVATION
                    : "Observação: "
                }
                className="form-control"
                disabled
              />
              <input
                type="text"
                value={"tempo de vida do chamado: " + lifeTime + " dias"}
                className="form-control"
                disabled
              />
              <div>
                <input
                  type="text"
                  value={"Arquivos"}
                  className="form-control"
                  disabled
                />
              </div>
              <input
                type="text"
                value={
                  "Tecnico responsavel: " +
                  (ticketResponsible_Technician
                    ? ticketResponsible_Technician
                    : "Nenhum técnico atribuído")
                }
                className="form-control"
                disabled
              />
            </div>
            <div>
              <select
                className="form-select"
                onChange={ChangeTechnician}
                value={selectedTech}
              >
                <option key={0} value="" disabled>
                  Tranferir
                </option>
                {techs.map((tech, index) => (
                  <option key={index + 1} value={tech}>
                    {tech}
                  </option>
                ))}
              </select>
            </div>
            <DivChat
              id="chatDiv"
              onMouseEnter={() => {
                const chatDiv = document.getElementById("chatDiv");
                chatDiv.scrollTop = chatDiv.scrollHeight;
              }}
            >
              {mountChat}
              {messageChat && (
                <div className="w-100 h-100 d-flex justify-content-center align-items-center">
                  <Message
                    TypeError={typeError}
                    MessageError={messageError}
                    CloseMessage={closeMessage}
                  />
                </div>
              )}
            </DivChat>
            {chat && (
              <div className="w-100 d-flex">
                <div className="w-100">
                  <input
                    className="form-control h-100 fs-5"
                    type="text"
                    onChange={NewChat}
                  />
                </div>
                <div>
                  <IMGChat
                    src={SendIMG}
                    className="img-fluid mt-1"
                    alt=""
                    onClick={SendChat}
                  />
                </div>
              </div>
            )}
          </div>
        </TicketOpen>
      )}
      {equipamentforuser && (
        <TicketOpen
          className="position-fixed
          top-50
          start-50
          translate-middle"
        >
          <h3 className="text-center mt-1">Cadastro de Equipamentos</h3>
          <p className="text-center">Imagem do Equipamento</p>
          <DivUpload className="upload">
            <div className="upload-files">
              <HeaderFiles>
                <PFiles>
                  <IMGFile2 src={Cloud} alt="" />
                  <Span1 className="up">up</Span1>
                  <Span2 className="load">load</Span2>
                </PFiles>
              </HeaderFiles>
              <BodyFiles className="body" id="drop" onDrop={inputDrop}>
                <IMGFile src={File} alt="" />
                <PFiles2 className="pointer-none">
                  <B1>Drag and drop</B1> files here to begin the upload
                </PFiles2>
                <InputFiles type="file" id="inputName" />
              </BodyFiles>
              <FooterFiles id="footerFiles">
                <Divider className="divider overflow-hidden" id="divider">
                  <Span3 className="mb-3">FILE</Span3>
                </Divider>
                <ListFiles className="list-files" id="list-files">
                  <p id="namefile"></p>
                </ListFiles>
                <input
                  type="text"
                  className="form-control mx-auto mb-2"
                  placeholder="Modelo"
                  onChange={modelEquip}
                />
                <select
                  className="form-select mx-auto w-25"
                  id="select_company"
                  onChange={Select_Company}
                >
                  <option value="none" selected disabled>
                    Filial
                  </option>
                  <option value="csc">CSC</option>
                  <option value="fiber">Fiber</option>
                  <option value="ropes">Ropes</option>
                  <option value="vera">Vera</option>
                  <option value="mna">MNA</option>
                </select>
                <button
                  className="importar btn btn-success mt-3"
                  onClick={updateEquipament}
                >
                  Cadastrar Equipamento
                </button>
              </FooterFiles>
            </div>
          </DivUpload>
        </TicketOpen>
      )}
    </Div>
  );
}
