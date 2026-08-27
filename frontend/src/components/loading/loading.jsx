import "../../styles/loading/loading.css";

export default function Loading() {
	return (
		<div className="loader tw-w-[100px] tw-h-[100px]">
			<div className="cube tw-w-full tw-h-full">
				<div className="face"></div>
				<div className="face"></div>
				<div className="face"></div>
				<div className="face"></div>
				<div className="face"></div>
				<div className="face"></div>
			</div>
		</div>
	);
}
