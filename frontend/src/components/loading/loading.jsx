/**
 * Importação interna necessária para este componente.
 * - React: permite a criação e manipulação de componentes React.
 */
import React from "react";

/**
 * Importações de elementos DOM e estilos necessárias para este componente.
 * - Loader, Cube: importações de elementos DOM do módulo "../styles/loading/loadingStyle".
 * - loading.css: importação do arquivo de estilos "../styles/loading/loading.css".
 */
import { Loader, Cube } from "../../styles/loading/loadingStyle";
import "../../styles/loading/loading.css";

/**
 * Componente responsável por exibir um indicador de carregamento.
 */
export default function Loading() {
  return (
    <Loader>
      <Cube>
        <div class="face"></div>
        <div class="face"></div>
        <div class="face"></div>
        <div class="face"></div>
        <div class="face"></div>
        <div class="face"></div>
      </Cube>
    </Loader>
  );
}
