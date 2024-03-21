import React, { useEffect, useState } from "react";
import "../styles/bootstrap/css/bootstrap.css";
import Logo from "../images/logos/lupalogo.png";
import { Div, IMG, Span, H5, Notification, Div2, PathNotes, CloseBTN } from "../styles/loginStyle";
import Message from "../components/message";
import Loading from "../components/loading";
import "animate.css";

export default function Login() {
  const version = "1.0";
  const [Notify, SetNotify] = useState(true);
  useEffect(() => {
    document.title = "FixDesk";
    const Theme = localStorage.getItem("Theme");
    if (Theme === null) {
      localStorage.setItem("Theme", "black");
      return ThemeBlack();
    } else if (Theme === "black") {
      return ThemeBlack();
    } else if (Theme === "light") {
      return ThemeLight();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const new_version = localStorage.getItem("version");
    if (new_version === null) {
      SetNotify(true);
    } else if (new_version !== version) {
      SetNotify(true);
    } else if (new_version === version) {
      SetNotify(false);
    }
  }, []);

  useEffect(() => {
    if (Notify) {
      const nt = document.getElementById("ntf");

      nt.addEventListener("animationend", () => {
        if (nt.classList.contains("animate__fadeInUp")) {
          nt.classList.remove("animate__fadeInUp");
          nt.classList.remove("animate__slow");
          nt.classList.add("animate__pulse");
          nt.classList.add("inifit");
        }
      });
    }
  }, [Notify]);

  const [loginPage, SetLoginPage] = useState(true);
  const [passlimit, SetPassLimit] = useState(false);
  const [awaitValidation, SAwaitValidation] = useState(false);
  const [message, SetMessage] = useState(false);
  const [typemessage, SetTypeMessage] = useState("");
  const [messageerror, SetMessageError] = useState("");
  const [animate, SetAnimate] = useState("");
  const [theme, SetTheme] = useState("");
  const [color, SetColor] = useState("");
  const [pathnotes, SetPatchNotes] = useState(false);

  useEffect(() => {
    if (pathnotes) {
      const new_version = localStorage.getItem("version");
      if (new_version === null) {
        localStorage.setItem("version", version);
      } else if (new_version !== version) {
        localStorage.setItem("version", version);
      }
    }
  }, [pathnotes]);

  function ThemeBlack() {
    SetColor("colorBlack");
    return SetTheme("themeBlack");
  }

  function ThemeLight() {
    SetColor("colorLight");
    return SetTheme("themeLight");
  }

  function verifylogin(event) {
    SetLoginPage(false);
    SetPassLimit(false);
    SAwaitValidation(true);
    event.preventDefault();
    const user = document.getElementById("user").value;
    const pass = document.getElementById("pass").value;

    fetch("validation/", {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: user,
        password: pass,
      }),
    })
      .then((response) => {
        if (response.status === 401) {
          SetMessage(true);
          SetTypeMessage("Credencial Inválida");
          SetMessageError("Usuário e/ou Senha Inválido(s)");
          SetLoginPage(true);
          SetPassLimit(false);
          SetAnimate("");
          SAwaitValidation(false);
          return;
        } else if (response.status === 425) {
          SetMessage(true);
          SetTypeMessage("Acesso Restrito");
          SetMessageError("Você não possui permissão para essa Ferramenta");
          SetLoginPage(true);
          SetPassLimit(true);
          SAwaitValidation(false);
          return;
        } else {
          return response.json();
        }
      })
      .then((data) => {
        if (data !== undefined) {
          localStorage.setItem("dataInfo", JSON.stringify(data));
          return window.location.replace("/helpdesk");
        } else {
          return;
        }
      })
      .catch((err) => {
        return console.log(err);
      });
  }

  function verifyPass() {
    const pass = document.getElementById("pass").value;

    if (pass.length > 10) {
      SetPassLimit(true);
      if (animate === "animate__bounceIn") {
        return;
      } else {
        return SetAnimate("animate__bounceIn");
      }
    } else {
      return SetAnimate("animate__bounceOut");
    }
  }

  function closeMessage() {
    return SetMessage(false);
  }

  useEffect(() => {
    if (animate === "animate__bounceOut") {
      setTimeout(() => {
        SetPassLimit(false);
      }, 500);
    }
  }, [animate]);

  return (
    <Div className={theme}>
      {message && (
        <div className="mt-5 position-relative">
          <Message TypeError={typemessage} MessageError={messageerror} className="position-absolute top-0 start-50 translate-middle-x" CloseMessage={closeMessage} />
        </div>
      )}
      <IMG id="logo" src={Logo} alt="Logo da lupatech" className="position-absolute top-0 start-20 none animate__animated animate__slideInDown" />
      {loginPage && (
        <div className="position-absolute top-50 start-50 translate-middle d-flex flex-column none animate__animated">
          <form action="" method="POST">
            <Span className={color}>Usuário</Span>
            <input id="user" type="text" className="form-control" name="user" />

            <Span className={color}>Senha</Span>
            <input id="pass" type="password" className="form-control mb-5" name="pass" onKeyUp={verifyPass} />

            {passlimit && (
              <button className={`btn btn-success w-100 ${animate}`} onClick={verifylogin}>
                Logar
              </button>
            )}
          </form>
        </div>
      )}
      {awaitValidation && (
        <div className="position-absolute top-50 start-50 translate-middle">
          <Loading />
        </div>
      )}
      <Div2 className="position-absolute bottom-0 start-0 d-flex">
        <H5
          onClick={() => {
            SetPatchNotes(true);
          }}
        >
          {version}
        </H5>
        a
        {Notify && (
          <Notification
            onClick={() => {
              SetPatchNotes(true);
            }}
            id="ntf"
            className="animate__animated animate__fadeInUp animate__slow"
          ></Notification>
        )}
      </Div2>
      {pathnotes && (
        <PathNotes className="d-flex flex-column position-absolute top-50 start-50 translate-middle z-3">
          <CloseBTN
            className="position-absolute top-0 end-0 btn btn-danger"
            onClick={() => {
              SetPatchNotes(false);
            }}
          >
            X
          </CloseBTN>
          <h3 className="text-center mb-5 mt-3 fw-bold">Notas de Atualizações</h3>
          <div className="d-flex flex-column">
            <h6 className="fw-bold mb-2">Nota de Atualização 1.0 - 21/03</h6>
            <p className="text-break">
              <b>Assunto</b>: Data de Lançamento da Ferramenta de Chamados FixDesk É com grande satisfação que anunciamos a data oficial de lançamento da nossa nova ferramenta de chamados, FixDesk.
              Após um período de desenvolvimento e testes rigorosos, estamos felizes em informar que o FixDesk estará disponível para uso a partir de [data de lançamento]. Esta ferramenta
              revolucionária promete simplificar e otimizar o processo de gerenciamento de chamados, proporcionando uma experiência mais eficiente e organizada para toda a equipe. Fiquem atentos para
              mais informações sobre treinamentos e orientações sobre como utilizar o FixDesk da melhor forma possível.
            </p>
          </div>
        </PathNotes>
      )}
    </Div>
  );
}
