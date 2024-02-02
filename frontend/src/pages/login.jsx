import React, { useEffect, useState } from "react";
import "../styles/bootstrap/css/bootstrap.css";
import Logo from "../images/logos/lupalogo.png";
import { Div, IMG, Span } from "../styles/loginStyle";
import Message from "../components/message";
import Loading from "../components/loading";
import "animate.css";

export default function Login() {
  useEffect(() => {
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

  const [loginPage, SetLoginPage] = useState(true);
  const [passlimit, SetPassLimit] = useState(false);
  const [awaitValidation, SAwaitValidation] = useState(false);
  const [message, SetMessage] = useState(false);
  const [typemessage, SetTypeMessage] = useState("");
  const [messageerror, SetMessageError] = useState("");
  const [animate, SetAnimate] = useState("");
  const [theme, SetTheme] = useState("");
  const [color, SetColor] = useState("");

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
        response.json();

        if (response.status === 401) {
          SetMessage(true);
          SetTypeMessage("Credencial Inválida");
          SetMessageError("Usuário e/ou Senha Inválido(s)");
          SetLoginPage(true);
          SetPassLimit(false);
          SetAnimate("");
          SAwaitValidation(false);
        } else if (response.status === 425) {
          SetMessage(true);
          SetTypeMessage("Acesso Restrito");
          SetMessageError("Você não possui permissão para essa Ferramenta");
          SetLoginPage(true);
          SetPassLimit(true);
          SAwaitValidation(false);
        }
      })
      .then((data) => {
        const dataUser = localStorage.getItem("dataUser");
        if (dataUser === null) {
          localStorage.setItem("dataUser", data);
          return window.location.replace("/helpdesk");
        }
        return;
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
          <Message
            TypeError={typemessage}
            MessageError={messageerror}
            className="position-absolute top-0 start-50 translate-middle-x"
            CloseMessage={closeMessage}
          />
        </div>
      )}
      <IMG
        id="logo"
        src={Logo}
        alt="Logo da lupatech"
        className="position-absolute top-0 start-20 none animate__animated animate__slideInDown"
      />
      {loginPage && (
        <div className="position-absolute top-50 start-50 translate-middle d-flex flex-column none animate__animated">
          <form action="" method="POST">
            <Span className={color}>Usuário</Span>
            <input id="user" type="text" className="form-control" name="user" />

            <Span className={color}>Senha</Span>
            <input
              id="pass"
              type="password"
              className="form-control mb-5"
              name="pass"
              onKeyUp={verifyPass}
            />

            {passlimit && (
              <button
                className={`btn btn-success w-100 ${animate}`}
                onClick={verifylogin}
              >
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
