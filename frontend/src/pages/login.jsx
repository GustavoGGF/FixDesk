import React, { useEffect, useState, useRef } from "react";
import "animate.css";

import "../styles/bootstrap/css/bootstrap.css";
import Logo from "../images/logos/lupalogo.png";
import { Div, IMG, Span, H5, Notification, Div2, PathNotes, CloseBTN } from "../styles/loginStyle";
import Message from "../components/message";
import Loading from "../components/loading";

export default function Login() {
  // Essa função verifica o armazenamento local(localStorage) em busca da preferência de tema do usuário.
  // Se não encontrar, configura automaticamente o tema como "black".
  useEffect(() => {
    // Definindo nome da Pagina
    document.title = "FixDesk";
    const theme = localStorage.getItem("Theme");
    if (!theme) {
      localStorage.setItem("Theme", "black");
      setThemeBlack();
    } else {
      if (theme === "black") {
        setThemeBlack();
      } else if (theme === "light") {
        setThemeLight();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Definindo versão do Software
  const version = "1.0";
  const [notify, setNotify] = useState(true);

  // Essa função realiza uma verificação no armazenamento local do navegador para determinar se a versão
  // do software é a mais recente.Em caso negativo, exibe uma notificação de atualização(patch notes).
  useEffect(() => {
    const storedVersion = localStorage.getItem("version");

    if (!storedVersion || storedVersion !== version) {
      setNotify(true);
    } else {
      setNotify(false);
    }
  }, []);

  const notificationRef = useRef(null);
  // Este procedimento é acionado imediatamente após a alteração do estado de notify.
  // Se o estado for verdadeiro, aguarda o término da animação atual e, em seguida, insere uma nova animação.
  useEffect(() => {
    if (notify) {
      const notificationElement = notificationRef.current;

      const handleAnimationEnd = () => {
        notificationElement.classList.remove("animate__fadeInUp", "animate__slow");
        notificationElement.classList.add("animate__pulse", "infinit");
      };

      notificationElement.addEventListener("animationend", handleAnimationEnd);

      return () => {
        notificationElement.removeEventListener("animationend", handleAnimationEnd);
      };
    }
  }, [notify]);

  // Essas são variáveis de estado que são alteradas dinamicamente ao longo do código.
  const [loginPage, setLoginPage] = useState(true);
  const [passlimit, setPassLimit] = useState(false);
  const [awaitValidation, setAwaitValidation] = useState(false);
  const [message, setMessage] = useState(false);
  const [typeMessage, setTypeMessage] = useState("");
  const [messageError, setMessageError] = useState("");
  const [animation, setAnimation] = useState("");
  const [theme, setTheme] = useState("");
  const [color, setColor] = useState("");
  const [patchNotes, setPatchNotes] = useState(false);

  // Esta função é acionada quando a constante pathNotes é alterada.Se for verdadeira,
  // ela verifica a versão do código no armazenamento local e realiza uma atualização, se necessário.
  useEffect(() => {
    if (patchNotes) {
      const storedVersion = localStorage.getItem("version");

      if (!storedVersion || storedVersion !== version) {
        localStorage.setItem("version", version);
      }
    }
  }, [patchNotes]);

  // Esta função é responsável por alterar o tema do site para "black".
  function setThemeBlack() {
    setColor("colorBlack");
    return setTheme("themeBlack");
  }
  // Esta função é responsável por alterar o tema do site para "white".
  function setThemeLight() {
    setColor("colorLight");
    return setTheme("themeLight");
  }

  // Referencia o input do usuario
  const userRef = useRef(null);
  // Referencia o input de senha
  const passRef = useRef(null);

  // Esta função recebe o nome de usuário e senha, envia - os para a view validation e ativa a
  // função handleInvalidCredentials se as credenciais estiverem incorretas, ou a função handleAccessRestricted se não houver permissão.
  // Se for concedido acesso, ela acessa o helpdesk.
  function verifylogin(event) {
    event.preventDefault();

    const user = userRef.current.value;
    const pass = passRef.current.value;

    setLoginPage(false);
    setPassLimit(false);
    setAwaitValidation(true);

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
          handleInvalidCredentials();
        } else if (response.status === 425) {
          handleAccessRestricted();
        } else if (response.ok) {
          return response.json();
        } else {
          setMessage(true);
          setMessageError("Erro ao verificar Login");
          setTypeMessage("Fatal ERROR");
        }
      })
      .then((data) => {
        if (data) {
          localStorage.setItem("dataInfo", JSON.stringify(data));
          window.location.replace("/helpdesk");
        }
      })
      .catch((err) => {
        console.error("Erro na validação do login:", err);
        setMessage(true);
        setMessageError("Erro ao verificar Login", err);
        setTypeMessage("Fatal ERROR");
      });
  }

  // Funçaõ mostrada após erro de login por erro na credencial
  function handleInvalidCredentials() {
    setMessage(true);
    setTypeMessage("Credencial Inválida");
    setMessageError("Usuário e/ou Senha Inválido(s)");
    setLoginPage(true);
    setPassLimit(false);
    setAnimation("");
    setAwaitValidation(false);
  }

  // Função mostrada após erro de acesso indevido
  function handleAccessRestricted() {
    setMessage(true);
    setTypeMessage("Acesso Restrito");
    setMessageError("Você não possui permissão para essa Ferramenta");
    setLoginPage(true);
    setPassLimit(true);
    setAwaitValidation(false);
  }

  function verifyPass() {
    const pass = passRef.current.value;

    if (pass.length > 10) {
      setPassLimit(true);
      setAnimation("animate__bounceIn");
    } else {
      setAnimation("animate__bounceOut");
    }
  }

  useEffect(() => {
    if (animation === "animate__bounceOut") {
      setTimeout(() => {
        setPassLimit(false);
      }, 500);
    }
  }, [animation]);

  return (
    <Div className={theme}>
      {message && (
        <div className="mt-5 position-relative">
          <Message
            TypeError={typeMessage}
            MessageError={messageError}
            className="position-absolute top-0 start-50 translate-middle-x"
            CloseMessage={() => {
              return setMessage(false);
            }}
          />
        </div>
      )}
      <IMG src={Logo} alt="Logo da lupatech" className="position-absolute top-0 start-20 none animate__animated animate__slideInDown" />
      {loginPage && (
        <div className="position-absolute top-50 start-50 translate-middle d-flex flex-column none animate__animated">
          <form action="" method="POST">
            <Span className={color}>Usuário</Span>
            <input ref={userRef} type="text" className="form-control" name="user" />

            <Span className={color}>Senha</Span>
            <input ref={passRef} type="password" className="form-control mb-5" name="pass" onKeyUp={verifyPass} />

            {passlimit && (
              <button className={`btn btn-success w-100 ${animation}`} onClick={verifylogin}>
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
            setPatchNotes(true);
          }}
        >
          {version}
        </H5>
        {notify && (
          <Notification
            onClick={() => {
              setPatchNotes(true);
            }}
            ref={notificationRef}
            className="animate__animated animate__fadeInUp animate__slow"
          ></Notification>
        )}
      </Div2>
      {patchNotes && (
        <PathNotes className="d-flex flex-column position-absolute top-50 start-50 translate-middle z-3">
          <CloseBTN
            className="position-absolute top-0 end-0 btn btn-danger"
            onClick={() => {
              setPatchNotes(false);
            }}
          >
            X
          </CloseBTN>
          <h3 className="text-center mb-5 mt-3 fw-bold">Notas de Atualizações</h3>
          <div className="d-flex flex-column">
            <h6 className="fw-bold mb-2">Nota de Atualização 1.0 - 21/03</h6>
            <p className="text-break">
              <b>Assunto</b>: Data de Lançamento da Ferramenta de Chamados FixDesk É com grande satisfação que anunciamos a data oficial de lançamento da nossa nova ferramenta de chamados, FixDesk.
              Após um período de desenvolvimento e testes rigorosos, estamos felizes em informar que o FixDesk estará disponível para uso a partir de 21/03/2024. Esta ferramenta revolucionária promete
              simplificar e otimizar o processo de gerenciamento de chamados, proporcionando uma experiência mais eficiente e organizada para toda a equipe. Fiquem atentos para mais informações sobre
              treinamentos e orientações sobre como utilizar o FixDesk da melhor forma possível.
            </p>
          </div>
        </PathNotes>
      )}
    </Div>
  );
}
