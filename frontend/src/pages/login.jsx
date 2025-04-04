import React, { useEffect, useState, useRef, useContext } from "react";
import "animate.css";

import "../styles/bootstrap/css/bootstrap.css";
import Logo from "../images/logos/lupalogo.png";
import { Div, IMG, Span } from "../styles/loginStyle";
import Message from "../components/utility/message";
import Loading from "../components/loading/loading";
import { MessageContext } from "../context/MessageContext";

export default function Login() {
  useEffect(() => {
    // Função para desabilitar o menu de contexto (botão direito do mouse)
    const handleContextMenu = (event) => {
      // Previne o comportamento padrão de exibir o menu de contexto
      event.preventDefault();
    };

    // Função para desabilitar atalhos de teclado específicos, como F12 e Ctrl+Shift+I
    const handleKeyDown = (event) => {
      // Verifica se a tecla pressionada é F12 ou o atalho Ctrl+Shift+I (inspecionar elemento)
      if (
        event.key === "F12" ||
        (event.ctrlKey && event.shiftKey && event.key === "I")
      ) {
        // Previne o comportamento padrão associado a essas teclas
        event.preventDefault();
      }
    };

    // Adiciona o listener para desabilitar o menu de contexto
    document.addEventListener("contextmenu", handleContextMenu);
    // Adiciona o listener para desabilitar atalhos de teclado específicos
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup para remover os listeners ao desmontar o componente
    return () => {
      // Remove o listener do menu de contexto para evitar vazamentos de memória
      document.removeEventListener("contextmenu", handleContextMenu);
      // Remove o listener de atalhos de teclado para garantir que o comportamento padrão seja restaurado
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // Dependências vazias garantem que este efeito será executado apenas uma vez no ciclo de vida do componente

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

  // Essas são variáveis de estado que são alteradas dinamicamente ao longo do código.
  // Constantes Boolean
  const [awaitValidation, setAwaitValidation] = useState(false);
  const [loginPage, setLoginPage] = useState(true);
  const [passlimit, setPassLimit] = useState(false);
  // Constantes String
  const [animation, setAnimation] = useState("");
  const [color, setColor] = useState("");
  const [theme, setTheme] = useState("");

  const { setMessageError, setTypeError, setMessage, message } =
    useContext(MessageContext);

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
  function Verifylogin(event) {
    event.preventDefault();
    try {
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
          }
        })
        .then((data) => {
          if (data) {
            localStorage.setItem("dataInfo", JSON.stringify(data));
            return (window.location.href = "/helpdesk");
          }
        })
        .catch((err) => {
          console.error("Erro na validação do login:", err);
          setMessage(true);
          setMessageError("Erro ao verificar Login", err);
          setTypeError("Fatal ERROR");
          return;
        });
    } catch (err) {
      return console.log(err);
    }
  }

  // Funçaõ mostrada após erro de login por erro na credencial
  function handleInvalidCredentials() {
    setMessage(true);
    setTypeError("Credencial Inválida");
    setMessageError("Usuário e/ou Senha Inválido(s)");
    setLoginPage(true);
    setPassLimit(false);
    setAnimation("");
    setAwaitValidation(false);
  }

  // Função mostrada após erro de acesso indevido
  function handleAccessRestricted() {
    setMessage(true);
    setTypeError("Acesso Restrito");
    setMessageError("Você não possui permissão para essa Ferramenta");
    setLoginPage(true);
    setPassLimit(true);
    setAwaitValidation(false);
  }

  function VerifyPass() {
    try {
      const pass = passRef.current.value;

      if (pass.length > 10) {
        setPassLimit(true);
        setAnimation("animate__bounceIn");
      } else {
        setAnimation("animate__bounceOut");
      }
    } catch (err) {
      return console.log(err);
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
        <Message
          className="position-absolute top-0 start-50 translate-middle-x mt-5"
          CloseMessage={() => {
            return setMessage(false);
          }}
        />
      )}
      <IMG
        src={Logo}
        alt="Logo da lupatech"
        className="position-absolute top-0 start-20 animate__animated animate__slideInDown"
      />
      {loginPage && (
        <div className="position-absolute top-50 start-50 translate-middle d-flex flex-column none animate__animated">
          <form>
            <Span className={color}>Usuário</Span>
            <input
              ref={userRef}
              type="text"
              className="form-control"
              name="user"
            />

            <Span className={color}>Senha</Span>
            <input
              ref={passRef}
              type="password"
              className="form-control mb-5"
              name="pass"
              onKeyUp={VerifyPass}
            />

            {passlimit && (
              <button
                className={`btn btn-success w-100 ${animation}`}
                onClick={Verifylogin}
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
