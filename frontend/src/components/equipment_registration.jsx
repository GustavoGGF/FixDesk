import React, { useState, useEffect } from "react";
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

export default function Equipment_Registration({
  token,
  equipamentforuser,
  CloseFunct,
}) {
  const [filename, SetFileName] = useState("");
  const [fileimg, SetFileImg] = useState();
  const [modelequipament, SetModelEquipament] = useState("");
  const [companyname, SetCompanyName] = useState("");
  const [message, SetMessage] = useState(false);
  const [typeError, SetTypeError] = useState("");
  const [messageError, SetMessageError] = useState("");

  function inputDrop() {
    const input = document.getElementById("inputName");
    const p = document.getElementById("namefile");

    SetFileImg(input.files[0]);
    SetFileName(input.files[0].name);

    return (p.innerText = input.files[0].name);
  }

  function modelEquip(event) {
    const newModel = event.target.value;
    SetModelEquipament(newModel);

    return modelequipament;
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
          $("#importar").classList.add("active");
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

  function closeMessage() {
    SetMessage(false);
  }

  return (
    <TicketOpen className="position-fixed top-50 start-50 translate-middle z-2">
      <div className="w-100 d-flex justify-content-end">
        <IMGClose src={Close} className="img-fluid" onClick={CloseFunct} />
      </div>
      {message && (
        <Message
          MessageError={messageError}
          TypeError={typeError}
          CloseMessage={closeMessage}
        />
      )}
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
          <BodyFiles className="body" id="drop" onDrop={() => inputDrop()}>
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
              id="importar"
              className="btn btn-success mt-3"
              onClick={updateEquipament}
            >
              Cadastrar Equipamento
            </button>
          </FooterFiles>
        </div>
      </DivUpload>
    </TicketOpen>
  );
}
