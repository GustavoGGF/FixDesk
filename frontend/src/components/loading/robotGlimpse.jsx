import "../../styles/robotGlimpse.css";

export default function RoboGlimpse() {
	return (
		<div className="loader">
			<div className="modelViewPort">
				<div className="eva">
					<div className="head">
						<div className="eyeChamber">
							<div className="eye"></div>
							<div className="eye"></div>
						</div>
					</div>
					<div className="body">
						<div className="hand"></div>
						<div className="hand"></div>
						<div className="scannerThing"></div>
						<div className="scannerOrigin"></div>
					</div>
				</div>
			</div>
		</div>
	);
}
