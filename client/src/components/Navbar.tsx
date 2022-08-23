import React from "react";

const Navbar: React.FC<{ logoOnly?: boolean; name: string }> = ({
  logoOnly,
  name,
}) => {
  return (
    <nav className="Navbar">
      <h1>{name}</h1>
      {!logoOnly && (
        <React.Fragment>
          <p>
            Hello to {name} hope you all the luck and we all always with you
          </p>
        </React.Fragment>
      )}
    </nav>
  );
};

export default Navbar;
