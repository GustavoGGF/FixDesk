/**
 * Importação interna necessária para este componente.
 * - React: permite a criação e manipulação de componentes React.
 * - useRef: hook utilizado para criar uma referência mutable para elementos do DOM.
 */
import React, { useRef } from "react";

/**
 * Importações de elementos DOM necessárias para este componente, de arquivos CSS, JavaScript, e imagens necessárias para este componente.
 * - Div1, Logout, Img, ALink, SpanUser, CLose, BtnClose, H5, DropBTN, DropDown, DropContent, Arrow, DropContent2:
 * - importações de elementos DOM do módulo "../styles/navbarStyle".
 * - "../styles/bootstrap/css/bootstrap.css": importação do arquivo CSS do Bootstrap.
 * - "../styles/bootstrap/js/bootstrap.js": importação do arquivo JavaScript do Bootstrap.
 * - Logo: importação da imagem "fixdesk.png" localizada em "../images/logos".
 * - ImgClose: importação da imagem "close.png" localizada em "../images/components".
 * - ArrowDown: importação da imagem "caret-down-square.svg" localizada em "../images/components".
 */
import {
  Div1,
  Logout,
  Img,
  ALink,
  SpanUser,
  CLose,
  BtnClose,
  H5,
  DropBTN,
  DropDown,
  DropContent,
  Arrow,
  DropContent2,
} from "../../styles/navbarStyle";
import "../../styles/bootstrap/css/bootstrap.css";
import "../../styles/bootstrap/js/bootstrap.js";
import Logo from "../../images/logos/fixdesk.png";
import ImgClose from "../../images/components/close.png";
import ArrowDown from "../../images/components/caret-down-square.svg";

/**
 * Componente responsável por exibir a barra de navegação do site e informações do usuário.
 * @param {string} Name - Nome do usuário.
 * @param {string} JobTitle - Cargo do usuário.
 */
export default function NavBar({ Name, JobTitle }) {
  /**
   * Variáveis de referência utilizadas para acessar elementos do DOM neste componente.
   * - themeOption: referência ao elemento de opções de tema.
   * - dropContent: referência ao elemento de conteúdo suspenso.
   */
  const themeOption = useRef(null);
  const dropContent = useRef(null);

  /**
   * Evento de clique utilizado para ocultar ou exibir um elemento.
   * - Este evento é adicionado ao elemento raiz da aplicação (id="root").
   * - Verifica se o clique ocorreu fora de certos elementos específicos e oculta o elemento de conteúdo suspenso.
   * - Se o elemento de conteúdo suspenso não estiver visível, ele é ocultado.
   */
  document.getElementById("root").addEventListener("click", function (event) {
    if (
      event.target.id !== "btn-drop" &&
      event.target.id !== "drop-content" &&
      event.target.id !== "img-drop" &&
      event.target.id !== "drop-content-2" &&
      event.target.id !== "btn3" &&
      event.target.id !== "btn2" &&
      event.target.id !== "btn1" &&
      event.target.id !== "btn-1-image" &&
      event.target.id !== "drop-dwn-2"
    ) {
      if (!dropContent.current.classList.contains("visually-hidden")) {
        dropContent.current.classList.add("visually-hidden");
        if (themeOption.current) {
          themeOption.current.classList.add("visually-hidden");
        }
        return;
      } else {
        return;
      }
    }
    return;
  });

  /**
   * Função acionada ao clicar na aba de sair.
   * - Realiza uma solicitação GET para sair do sistema.
   * - Se a solicitação for bem-sucedida, a página é recarregada.
   */
  function Exit() {
    fetch("/helpdesk/exit/", {
      method: "GET",
      headers: {
        Accept: "text/html",
      },
    })
      .then((response) => {
        response.text() && window.location.reload();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  /**
   * Função utilizada para expandir as opções de configuração e escondê-las quando clicado fora.
   * @param {Object} event - Evento de clique.
   */
  function DropD(event) {
    if (
      (event.target.id === "btn-drop" &&
        dropContent.current.classList.contains("visually-hidden")) ||
      (event.target.id === "img-drop" &&
        dropContent.current.classList.contains("visually-hidden"))
    ) {
      dropContent.current.classList.remove("visually-hidden");
      return;
    } else if (
      (event.target.id === "btn-drop" &&
        !dropContent.current.classList.contains("visually-hidden")) ||
      (event.target.id === "img-drop" &&
        !dropContent.current.classList.contains("visually-hidden"))
    ) {
      if (dropContent.current) {
        dropContent.current.classList.add("visually-hidden");
      }
      if (themeOption.current) {
        themeOption.current.classList.add("visually-hidden");
      }
      return;
    } else if (
      (event.target.id === "btn1" &&
        themeOption.current.classList.contains("visually-hidden")) ||
      (event.target.id === "btn-1-image" &&
        themeOption.current.classList.contains("visually-hidden"))
    ) {
      themeOption.current.classList.remove("visually-hidden");
      return;
    } else if (
      (event.target.id === "btn1" &&
        !themeOption.current.classList.contains("visually-hidden")) ||
      (event.target.id === "btn-1-image" &&
        !themeOption.current.classList.contains("visually-hidden"))
    ) {
      themeOption.current.classList.add("visually-hidden");
      return;
    }

    return;
  }

  /**
   * Função acionada ao selecionar o tema claro.
   * - Armazena a escolha do tema no localStorage.
   * - Recarrega a página para aplicar as alterações do tema.
   */
  function ThemeLight() {
    localStorage.setItem("theme", "light");

    return window.location.reload();
  }

  /**
   * Função acionada ao selecionar o tema escuro.
   * - Armazena a escolha do tema no localStorage.
   * - Recarrega a página para aplicar as alterações do tema.
   */
  function ThemeBlack() {
    localStorage.setItem("theme", "black");

    return window.location.reload();
  }

  return (
    <>
      <nav className="navbar bg-primary">
        <div className="container-fluid no-wrap">
          <div className="d-flex justify-content-between w-100">
            <div>
              <Img
                src={Logo}
                className="img-fluid"
                alt=""
                onClick={() => {
                  return (window.location.href = "/helpdesk");
                }}
              />
              <ALink className="navbar-brand" href="/helpdesk">
                FixDesk
              </ALink>
            </div>
            <divc className="d-flex">
              <Div1 className="d-flex flex-column">
                <SpanUser>{Name}</SpanUser>
                <SpanUser>{JobTitle}</SpanUser>
              </Div1>
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasNavbar"
                aria-controls="offcanvasNavbar"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
            </divc>
          </div>
          <div
            className="offcanvas offcanvas-end"
            // eslint-disable-next-line react/no-unknown-property
            tabindex="-1"
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
          >
            <div className="offcanvas-header bg-primary">
              <div className="d-flex align-items-center">
                <Img src={Logo} alt="" />
                <H5
                  className="offcanvas-title fw-bold"
                  id="offcanvasNavbarLabel"
                >
                  FixDesk
                </H5>
              </div>
              <BtnClose
                type="button"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              >
                <CLose src={ImgClose} alt="" />
              </BtnClose>
            </div>
            <div className="offcanvas-body bg-primary">
              <ul className="navbar-nav justify-content-start flex-grow-1 pe-3 h-100 position-relative">
                <li className="nav-item">
                  <a
                    className="nav-link btn btn-light pointer"
                    aria-current="page"
                    href="/helpdesk/"
                  >
                    Criar Chamado
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link btn btn-light pointer"
                    aria-current="page"
                    href="/helpdesk/history/"
                  >
                    Meus Chamados
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link btn btn-light pointer"
                    aria-current="page"
                    href="/dashboard-ti/"
                  >
                    Dashboard
                  </a>
                </li>
                <li className="nav-item d-flex justify-content-center w-100">
                  <DropDown className="w-100">
                    <DropBTN
                      className="btn btn-light"
                      onClick={DropD}
                      id="btn-drop"
                    >
                      Configuração
                      <Arrow
                        src={ArrowDown}
                        alt="seta para abrir configurações"
                        id="img-drop"
                      />
                    </DropBTN>
                    <DropContent className="visually-hidden" ref={dropContent}>
                      <DropDown id="drop-dwn-2" className="w-100">
                        <DropBTN
                          className="btn btn-light"
                          id="btn1"
                          onClick={DropD}
                        >
                          Tema
                          <Arrow
                            src={ArrowDown}
                            alt="seta para abrir temas"
                            id="btn-1-image"
                          />
                        </DropBTN>
                        <DropContent2
                          className="visually-hidden"
                          ref={themeOption}
                        >
                          <DropBTN
                            className="btn btn-light"
                            id="btn2"
                            onClick={ThemeLight}
                          >
                            Claro
                          </DropBTN>
                          <DropBTN
                            className="btn btn-light"
                            id="btn3"
                            onClick={ThemeBlack}
                          >
                            Escuro
                          </DropBTN>
                        </DropContent2>
                      </DropDown>
                    </DropContent>
                  </DropDown>
                </li>
                <li className="nav-item position-absolute bottom-0 start-50 translate-middle-x w-100">
                  <Logout
                    className="nav-link btn btn-danger"
                    aria-current="page"
                    onClick={Exit}
                  >
                    Sair
                  </Logout>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
