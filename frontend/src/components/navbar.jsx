import React from "react";
import {
  Div1,
  A,
  Logout,
  Img,
  ALink,
  SpanUser,
  CLose,
  BtnClose,
  H5,
} from "../styles/navbarStyle";
import "../styles/bootstrap-5.3.0-dist/css/bootstrap.css";
import "../styles/bootstrap-5.3.0-dist/js/bootstrap";
import Logo from "../images/logos/fixdesk.png";
import ImgClose from "../images/components/close.png";

export default function NavBar({ Name, JobTitle }) {
  function helpdeskPage() {
    return (window.location.href = "/helpdesk/");
  }

  function historyPage() {
    return (window.location.href = "/helpdesk/history/");
  }

  function DashboardPage() {
    return (window.location.href = "/dashboard_TI/");
  }

  function FAQPage() {
    return;
  }

  function Exit() {
    fetch("/helpdesk/exit/", {
      method: "GET",
      headers: {
        Accept: "text/html",
      },
    })
      .then((response) => {
        return response.text() && window.location.reload();
      })
      .catch((err) => {
        return console.log(err);
      });
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
                  return (window.location.href = "/hepdesk");
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
              <div>
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
                  <A
                    className="nav-link btn btn-light"
                    aria-current="page"
                    onClick={helpdeskPage}
                  >
                    Criar Chamado
                  </A>
                </li>
                <li className="nav-item">
                  <A
                    className="nav-link btn btn-light"
                    aria-current="page"
                    onClick={historyPage}
                  >
                    Meus Chamados
                  </A>
                </li>
                <li className="nav-item">
                  <A
                    className="nav-link btn btn-light"
                    aria-current="page"
                    onClick={DashboardPage}
                  >
                    Dashboard
                  </A>
                </li>
                <li className="nav-item">
                  <A
                    className="nav-link btn btn-light"
                    aria-current="page"
                    onClick={FAQPage}
                  >
                    FAQ
                  </A>
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
