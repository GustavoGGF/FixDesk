import TXTImage from "../images/components/arquivo-txt.png";
import mailImage from "../images/components/mail.png";
import wordImage from "../images/components/palavra.png";
import PDFImage from "../images/components/pdf.png";
import XLSImage from "../images/components/xlsx.png";
import ZIPImage from "../images/components/zip.jpg";

export const fileTypeConfig = {
	mail: {
		imageSrc: mailImage,
		altImage: "Ícone de um arquivo de E-mail",
		mime: "message/rfc822",
	},
	excel: {
		imageSrc: XLSImage,
		altImage: "Ícone de um arquivo Excell",
		mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	},
	zip: {
		imageSrc: ZIPImage,
		altImage: "ìcone de um arquivo ZIP",
		mime: "application/zip",
	},
	txt: {
		imageSrc: TXTImage,
		altImage: "Ícone de um arquivo TXT",
		mime: "text/plain",
	},
	word: {
		imageSrc: wordImage,
		altImage: "Ícone de um Arquivo Word",
		mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	},
	pdf: {
		imageSrc: PDFImage,
		altImage: "Ícone de um Arquivo PDF",
		mime: "application/pdf",
	},
};
