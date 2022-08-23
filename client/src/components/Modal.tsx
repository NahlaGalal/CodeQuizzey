import React from "react";

interface IProps {
	data: string;
	action: () => void;
}

const Modal: React.FC<IProps> = ({ data, action }) => {
  return (
    <div className="Modal">
			<div>
				<p>{data}</p>
				<button className="btn btn__solid" onClick={action}>Next</button>
			</div>
    </div>
  );
};

export default Modal;
