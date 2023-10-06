import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import { Div, DivDashPie } from "../styles/dashboardTIStyle";
import Loading from "../components/loading";
import DashBoardPie from "../components/dashboardPie";

export default function DashboardTI() {
  const [techs, SetTechs] = useState([]);
  const [token, setToken] = useState("");
  const [ticketData, SetTicketData] = useState([]);
  const [loading, SetLoading] = useState(true);

  // useEffect(() => {
  //   fetch("", {
  //     method: "POST",
  //     headers: { Accept: "application/json" },
  //   })
  //     .then((response) => {
  //       return response.json();
  //     })
  //     .then((data) => {
  //       const tech = data.techs;
  //       SetTechs(tech.split(","));
  //       setToken(data.token);
  //       SetTicketData(data);
  //       SetLoading(false);

  //       return ticketData;
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (
    <Div className="position-relative">
      <Navbar />
      <DivDashPie className="position-absolute top-0 start-50 translate-middle-x">
        <DashBoardPie sector={"TI"} />
      </DivDashPie>
      {loading && (
        <div className="position-absolute top-50 start-50 translate-middle">
          <Loading />
        </div>
      )}
    </Div>
  );
}
