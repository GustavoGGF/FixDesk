import React, { useState } from "react";
import "../styles/bootstrap-5.3.0-dist/css/bootstrap.css";
import Logo from "../images/logos/lupalogo.png";
import { Div, IMG, Span } from "../styles/loginStyle";
import Message from "../components/message";
import Loading from "../components/loading";

export default function Login() {
  const [loginPage, SetLoginPage] = useState(true);
  const [passlimit, SetPassLimit] = useState(false);
  const [awaitValidation, SAwaitValidation] = useState(false);
  const [message, SetMessage] = useState(false);
  const [typemessage, SetTypeMessage] = useState("");
  const [messageerror, SetMessageError] = useState("");

  function verifylogin(event) {
    SetLoginPage(false);
    SetPassLimit(false);
    SAwaitValidation(true);
    event.preventDefault();
    const user = document.getElementById("user").value;
    const pass = document.getElementById("pass").value;

    fetch("validation/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: user,
        password: pass,
      }),
    })
      .then((response) => {
        response.json();

        if (response.status === 401) {
          SetMessage(true);
          SetTypeMessage("Credencial Inválida");
          SetMessageError("Usuário e/ou Senha Inválido(s)");
          SetLoginPage(true);
          SetPassLimit(true);
          SAwaitValidation(false);
        } else if (response.status === 425) {
          SetMessage(true);
          SetTypeMessage("Acesso Restrito");
          SetMessageError("Você não possui permissão para essa Ferramenta");
          SetLoginPage(true);
          SetPassLimit(true);
          SAwaitValidation(false);
        } else {
          return window.location.replace("/helpdesk");
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
    } else {
      SetPassLimit(false);
    }
  }

  function closeMessage() {
    SetMessage(false);
  }

  return (
    <Div>
      {message && (
        <Message
          TypeError={typemessage}
          MessageError={messageerror}
          className="position-absolute top-0 start-50 translate-middle-x mt-5"
          CloseMessage={closeMessage}
        />
      )}
      <IMG
        id="logo"
        src={Logo}
        alt="Logo da lupatech"
        className="position-absolute top-0 start-20 none"
      />
      {loginPage && (
        <div className="position-absolute top-50 start-50 translate-middle d-flex flex-column none">
          <form action="" method="POST">
            <Span>Usuário</Span>
            <input id="user" type="text" className="form-control" name="user" />

            <Span>Senha</Span>
            <input
              id="pass"
              type="password"
              className="form-control mb-5"
              name="pass"
              onKeyUp={verifyPass}
            />

            {passlimit && (
              <button className="btn btn-success w-100" onClick={verifylogin}>
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
    </Div>
  );
}